/**
 * ضبط تسجيل فوري + روابط لومن (بدون Lovable).
 * يحتاج SUPABASE_ACCESS_TOKEN من https://supabase.com/dashboard/account/tokens
 * ثم: node scripts/configure-auth.mjs
 */
import { existsSync, readFileSync } from "fs";

const SITE_URL = process.env.LUMEN_SITE_URL || "https://lumen-service.netlify.app";
const REDIRECTS = [
  `${SITE_URL}/**`,
  `${SITE_URL}/auth`,
  "http://localhost:5173/**",
  "http://localhost:8080/**",
].join(",");

function loadEnv() {
  const o = {};
  if (!existsSync(".env")) return o;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    o[k] = v;
  }
  return o;
}

const env = loadEnv();
const projectRef = env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID;
const token = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;

if (!projectRef || !token) {
  console.error(`
أضيفي إلى .env:
  SUPABASE_ACCESS_TOKEN=sbp_...   (من supabase.com/dashboard/account/tokens)
ثم أعيدي: node scripts/configure-auth.mjs
`);
  process.exit(1);
}

const body = {
  site_url: SITE_URL,
  uri_allow_list: REDIRECTS,
  mailer_autoconfirm: true,
  security_hibp_enabled: false,
};

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
if (!res.ok) {
  console.error("فشل التحديث:", res.status, text.slice(0, 300));
  process.exit(1);
}

console.log("تم ضبط Auth:");
console.log("  site_url:", SITE_URL);
console.log("  mailer_autoconfirm: true");
console.log("  uri_allow_list:", REDIRECTS.split(",").join("\n    "));
