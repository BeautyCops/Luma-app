import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/** الحساب الوحيد المصرّح له بلوحة الإدارة */
export const ADMIN_EMAIL = "r.s.althobaiti@gmail.com";

export type Profile = {
  full_name: string | null;
  phone: string | null;
};

export function isAdminEmail(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function isAdminUser(user: User | null | undefined): boolean {
  return !!user && isAdminEmail(user.email);
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
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
  if (m.includes("email not confirmed")) return "تعذّر تسجيل الدخول — حاولي مرة أخرى";
  if (m.includes("user already registered")) return "هذا البريد مسجّل مسبقاً — جرّبي تسجيل الدخول";
  if (m.includes("weak") || m.includes("easy to guess"))
    return "كلمة المرور ضعيفة جداً — اختاري كلمة أقوى";
  if (m.includes("password")) return "كلمة المرور غير مقبولة — جرّبي 6 أحرف على الأقل";
  if (m.includes("network") || m.includes("fetch")) return "تعذّر الاتصال، حاولي لاحقاً";
  return "حدث خطأ، حاولي مرة أخرى";
}
