import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  full_name: string | null;
  phone: string | null;
};

export async function fetchIsAdmin(userId: string): Promise<boolean> {
  const { data: viaRpc, error: rpcError } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (!rpcError && viaRpc === true) return true;

  const { data: row } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return !!row;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[Lumen] profile fetch:", error.message);
    return null;
  }
  return data;
}

export async function upsertProfile(
  user: User,
  fields?: { full_name?: string; phone?: string },
): Promise<void> {
  const metaName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fields?.full_name?.trim() || metaName || null,
      phone: fields?.phone?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) console.warn("[Lumen] profile upsert:", error.message);
}

export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "البريد أو كلمة المرور غير صحيحة";
  if (m.includes("email not confirmed")) return "يرجى تأكيد البريد الإلكتروني من الرابط المرسل إليك";
  if (m.includes("user already registered")) return "هذا البريد مسجّل مسبقاً — جرّبي تسجيل الدخول";
  if (m.includes("password")) return "كلمة المرور ضعيفة — استخدمي 6 أحرف على الأقل";
  return message;
}
