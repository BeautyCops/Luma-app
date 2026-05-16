/**
 * يمرّر متغيرات Supabase من GitHub/Netlify (SUPABASE_*) إلى Vite (VITE_*) قبل البناء.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";

function loadDotEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnv();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const key =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";
const projectId = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID || "";

if (!url || !key) {
  console.warn(
    "[inject-env] SUPABASE_URL / SUPABASE_ANON_KEY غير موجودة — تأكدي من أسرار GitHub أو متغيرات Netlify.",
  );
  process.exit(0);
}

const lines = [
  `VITE_SUPABASE_URL=${url}`,
  `VITE_SUPABASE_PUBLISHABLE_KEY=${key}`,
];
if (projectId) lines.push(`VITE_SUPABASE_PROJECT_ID=${projectId}`);

writeFileSync(".env.production.local", lines.join("\n") + "\n", "utf8");
console.log("[inject-env] تم تجهيز .env.production.local للبناء");

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (serviceKey) {
  const runtime = {
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY: key,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  };
  writeFileSync("netlify/functions/.runtime-env.json", JSON.stringify(runtime), "utf8");
  console.log("[inject-env] تم تجهيز Netlify Functions (تسجيل فوري)");
} else {
  console.warn(
    "[inject-env] أضيفي SUPABASE_SERVICE_ROLE_KEY في Netlify → Environment variables (Builds + Functions)",
  );
}
