import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/auth-helpers";

type SignUpFields = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

/** تسجيل ثم دخول فوري بدون انتظار تأكيد البريد (يتطلب تعطيل Confirm email في Supabase). */
export async function signUpAndEnter({
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
    if (signInError) throw signInError;
    user = signInData.user;
    session = signInData.session;
  }

  if (!user) throw new Error("تعذّر إنشاء الحساب");

  await upsertProfile(user, { full_name: fullName, phone });
  return { user, session };
}
