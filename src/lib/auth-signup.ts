import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/auth-helpers";

type SignUpFields = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

type RegisterOk = {
  ok: true;
  session?: Session;
  user?: User;
  needsSignIn?: boolean;
};

type RegisterErr = {
  error: string;
  message?: string;
};

function authRedirectUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth`;
  }
  return "https://lumen-service.netlify.app/auth";
}

function mapRegisterError(code: string): Error {
  switch (code) {
    case "user_already_registered":
      return new Error("User already registered");
    case "weak_password":
      return new Error("Password is known to be weak and easy to guess");
    case "name_required":
      return new Error("Full name required");
    case "invalid_input":
      return new Error("Invalid input");
    case "auth_not_configured":
      return new Error("Auth not configured");
    default:
      return new Error("Signup failed");
  }
}

/** تسجيل عبر Netlify Function (تأكيد فوري) في الإنتاج. */
async function signUpViaRegister({
  email,
  password,
  fullName,
  phone,
}: SignUpFields): Promise<{ user: User; session: Session | null }> {
  const res = await fetch("/.netlify/functions/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName, phone }),
  });

  let data: RegisterOk | RegisterErr;
  try {
    data = await res.json();
  } catch {
    throw new Error("Signup failed");
  }

  if (!res.ok || "error" in data) {
    throw mapRegisterError("error" in data ? data.error : "signup_failed");
  }

  if (data.session) {
    const { error } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (error) throw error;
    const user = data.user ?? data.session.user;
    if (!user) throw new Error("تعذّر إنشاء الحساب");
    await upsertProfile(user, { full_name: fullName, phone });
    return { user, session: data.session };
  }

  if (data.needsSignIn) {
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    if (!signInData.user) throw new Error("تعذّر إنشاء الحساب");
    await upsertProfile(signInData.user, { full_name: fullName, phone });
    return { user: signInData.user, session: signInData.session };
  }

  throw new Error("تعذّر إنشاء الحساب");
}

/** تسجيل مباشر (تطوير محلي أو عند تعطيل Confirm email في Supabase). */
async function signUpDirect({
  email,
  password,
  fullName,
  phone,
}: SignUpFields): Promise<{ user: User; session: Session | null }> {
  const trimmedEmail = email.trim();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: { full_name: fullName.trim() },
      emailRedirectTo: authRedirectUrl(),
    },
  });
  if (error) throw error;

  let user = data.user;
  let session = data.session;

  if (!session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        throw new Error("Email not confirmed");
      }
      throw signInError;
    }
    user = signInData.user;
    session = signInData.session;
  }

  if (!user) throw new Error("تعذّر إنشاء الحساب");

  await upsertProfile(user, { full_name: fullName, phone });
  return { user, session };
}

/** تسجيل ثم دخول فوري — الإنتاج يستخدم خادم Netlify لتجاوز تأكيد البريد. */
export async function signUpAndEnter(fields: SignUpFields): Promise<{ user: User; session: Session | null }> {
  const useServer = import.meta.env.PROD;

  if (useServer) {
    try {
      return await signUpViaRegister(fields);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const retryDirect =
        msg.includes("Auth not configured") ||
        msg.includes("Signup failed") ||
        msg.includes("fetch");
      if (!retryDirect) throw err;
    }
  }

  return signUpDirect(fields);
}
