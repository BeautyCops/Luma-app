/**
 * يُشغَّل على GitHub Actions بأسرار Supabase من ربط المستودع.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const ADMIN_EMAIL = "r.s.althobaiti@gmail.com";
const ADMIN_PASSWORD = "123456";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = process.env.SUPABASE_PROJECT_ID;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!url || !serviceKey) {
  console.error(`
GitHub Secrets غير مضبوطة بعد.
من Supabase → Project Settings → API انسخي:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY (service_role)
  SUPABASE_PROJECT_ID
  SUPABASE_DB_PASSWORD (من Database settings)
ثم GitHub → Luma-app → Settings → Secrets and variables → Actions → New repository secret
أو شغّلي Workflow يدوياً بعد الإضافة: Actions → Setup Supabase → Run workflow
`);
  process.exit(1);
}

function readSql(file) {
  return readFileSync(file, "utf8");
}

async function runPsql(sqlText, label) {
  if (!projectRef || !dbPassword) {
    console.log(`[skip psql] ${label} — no SUPABASE_DB_PASSWORD`);
    return;
  }
  const host = `db.${projectRef}.supabase.co`;
  const user = `postgres`;
  const env = { ...process.env, PGPASSWORD: dbPassword };
  const r = spawnSync(
    "psql",
    ["-h", host, "-p", "5432", "-U", user, "-d", "postgres", "-v", "ON_ERROR_STOP=0", "-c", sqlText],
    { env, encoding: "utf8" },
  );
  console.log(`[psql] ${label}:`, r.status === 0 ? "ok" : r.stderr?.slice(0, 200) || r.stdout?.slice(0, 200));
}

async function patchAuth() {
  if (!accessToken || !projectRef) {
    console.log("[skip] auth patch — no SUPABASE_ACCESS_TOKEN");
    return;
  }
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mailer_autoconfirm: true,
      security_hibp_enabled: false,
    }),
  });
  const body = await res.text();
  console.log("[auth]", res.ok ? "mailer_autoconfirm + hibp off" : `failed ${res.status} ${body.slice(0, 120)}`);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log("Project:", projectRef || url);

if (existsSync("supabase/fix-grants.sql")) {
  await runPsql(readSql("supabase/fix-grants.sql"), "fix-grants");
}

console.log("Admin user...");
const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 200 });
if (listError) {
  console.error("listUsers:", listError.message);
  process.exit(1);
}

const existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
let userId = existing?.id;

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (error) console.error("updateUser:", error.message);
  else console.log("Updated admin password");
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Admin" },
  });
  if (error) console.error("createUser:", error.message);
  else {
    userId = data.user?.id;
    console.log("Created admin user");
  }
}

if (userId) {
  await admin.from("profiles").upsert({
    id: userId,
    full_name: "Admin",
    updated_at: new Date().toISOString(),
  });
  const { error: rErr } = await admin.from("user_roles").insert({ user_id: userId, role: "admin" });
  if (rErr && !String(rErr.message).includes("duplicate")) console.warn("user_roles:", rErr.message);
  else console.log("user_roles admin ok");
}

if (existsSync("supabase/grant-admin.sql")) {
  await runPsql(readSql("supabase/grant-admin.sql"), "grant-admin");
}

if (existsSync("supabase/seed.sql")) {
  await runPsql(readSql("supabase/seed.sql"), "seed");
}

await patchAuth();
console.log("Done.");
