/**
 * إعداد/تحديث حساب الأدمن (مرة واحدة على جهازك).
 * أضيفي في .env: SUPABASE_SERVICE_ROLE_KEY=... من Supabase → Settings → API
 * ثم: node scripts/setup-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";

const ADMIN_EMAIL = "r.s.althobaiti@gmail.com";
const ADMIN_PASSWORD = "123456";

function loadEnv() {
  const path = ".env";
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        let v = l.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
          v = v.slice(1, -1);
        return [l.slice(0, i).trim(), v];
      }),
  );
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error("أضيفي VITE_SUPABASE_URL أو SUPABASE_URL إلى ملف .env");
  process.exit(1);
}

if (!serviceKey) {
  console.error(
    "أضيفي SUPABASE_SERVICE_ROLE_KEY إلى ملف .env ثم أعيدي تشغيل الأمر.\n" +
      "أو من Supabase Dashboard → Authentication → Users → اختاري المستخدم → Set password → 123456",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 200 });
if (listError) {
  console.error("listUsers:", listError.message);
  process.exit(1);
}

const existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error("updateUser:", error.message);
    if (error.message.toLowerCase().includes("weak")) {
      console.error(
        "\nعطّلي في Supabase: Authentication → Settings → Password → Leaked password protection",
      );
    }
    process.exit(1);
  }
  console.log("تم تحديث كلمة مرور الأدمن:", ADMIN_EMAIL);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Admin" },
  });
  if (error) {
    console.error("createUser:", error.message);
    process.exit(1);
  }
  console.log("تم إنشاء حساب الأدمن:", data.user?.id);
}

const userId = existing?.id ?? (await admin.auth.admin.listUsers()).data.users.find(
  (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
)?.id;

if (userId) {
  await admin.from("profiles").upsert({
    id: userId,
    full_name: "Admin",
    updated_at: new Date().toISOString(),
  });
  const { error: roleErr } = await admin.from("user_roles").insert({ user_id: userId, role: "admin" });
  if (roleErr && !roleErr.message.includes("duplicate")) console.warn("user_roles:", roleErr.message);
  console.log("تم ربط الصلاحيات في profiles و user_roles");
}

console.log("جاهز — سجّلي الدخول:");
console.log("  البريد:", ADMIN_EMAIL);
console.log("  كلمة المرور:", ADMIN_PASSWORD);
console.log(
  "\nعلى Netlify أضيفي نفس SUPABASE_SERVICE_ROLE_KEY في Environment (Builds + Functions) ثم أعيدي النشر.",
);
console.log(
  "لتسجيل فوري بدون تأكيد بريد: Supabase → Authentication → Email → عطّلي Confirm email",
);
