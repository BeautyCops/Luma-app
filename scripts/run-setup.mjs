/**
 * إعداد كامل عند توفر SUPABASE_SERVICE_ROLE_KEY في .env
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";

const ADMIN_EMAIL = "r.s.althobaiti@gmail.com";
const ADMIN_PASSWORD = "123456";

function loadEnv() {
  const out = {};
  for (const file of [".env", ".env.production.local"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      out[k] = v;
    }
  }
  return out;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = env.VITE_SUPABASE_PROJECT_ID || env.SUPABASE_PROJECT_ID;

if (!url || !serviceKey) {
  console.error("مطلوب: VITE_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const fixes = `
grant usage on schema public to anon, authenticated, service_role;
grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated, service_role;
`;

console.log("1) إصلاح صلاحيات has_role...");
const { error: sqlError } = await admin.rpc("exec_sql", { query: fixes }).catch(() => ({
  error: { message: "no exec_sql" },
}));
if (sqlError?.message === "no exec_sql") {
  console.log("   (تخطّي — نفّذي supabase/fix-grants.sql يدوياً إن لزم)");
} else if (sqlError) {
  console.log("   ", sqlError.message);
} else {
  console.log("   تم");
}

console.log("2) حساب الأدمن...");
const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
const existing = list?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

let userId = existing?.id;
if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (error) console.error("   تحديث:", error.message);
  else console.log("   تم تحديث كلمة المرور");
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Admin" },
  });
  if (error) console.error("   إنشاء:", error.message);
  else {
    userId = data.user?.id;
    console.log("   تم الإنشاء");
  }
}

if (userId) {
  await admin.from("profiles").upsert({ id: userId, full_name: "Admin", updated_at: new Date().toISOString() });
  const { error: rErr } = await admin.from("user_roles").insert({ user_id: userId, role: "admin" });
  if (rErr && !String(rErr.message).includes("duplicate")) console.warn("   user_roles:", rErr.message);
  else console.log("   صلاحية admin في قاعدة البيانات");
}

if (projectRef && env.SUPABASE_ACCESS_TOKEN) {
  console.log("3) تعطيل تأكيد البريد عبر Management API...");
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mailer_autoconfirm: true }),
  });
  console.log(res.ok ? "   تم" : `   فشل ${res.status}`);
} else {
  console.log("3) لتعطيل تأكيد البريد: Authentication → Email → عطّلي Confirm email");
}

console.log("\nجاهز — جرّبي الدخول:", ADMIN_EMAIL);
