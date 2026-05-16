/**
 * يزامن .env عندما يكون service_role من مشروع مختلف عن URL/anon.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const o = {};
  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
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

function payload(jwt) {
  return JSON.parse(Buffer.from(jwt.split(".")[1], "base64url"));
}

const e = loadEnv();
const service = e.SUPABASE_SERVICE_ROLE_KEY;
if (!service) {
  console.error("SUPABASE_SERVICE_ROLE_KEY missing");
  process.exit(1);
}

const ref = payload(service).ref;
const newUrl = `https://${ref}.supabase.co`;
const urlRef = e.VITE_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (urlRef === ref) {
  console.log("Project already aligned:", ref);
  process.exit(0);
}

console.log("Mismatch: URL ref", urlRef, "vs service ref", ref);
console.log("Updating .env URL + PROJECT_ID to", ref);

let content = readFileSync(".env", "utf8");
content = content.replace(
  /^VITE_SUPABASE_URL=.*$/m,
  `VITE_SUPABASE_URL=${newUrl}`,
);
content = content.replace(
  /^VITE_SUPABASE_PROJECT_ID=.*$/m,
  `VITE_SUPABASE_PROJECT_ID=${ref}`,
);

if (!/^VITE_SUPABASE_URL=/m.test(content)) content += `\nVITE_SUPABASE_URL=${newUrl}\n`;
if (!/^VITE_SUPABASE_PROJECT_ID=/m.test(content))
  content += `\nVITE_SUPABASE_PROJECT_ID=${ref}\n`;

writeFileSync(".env", content, "utf8");

const sb = createClient(newUrl, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { error } = await sb.auth.admin.listUsers({ perPage: 1 });
console.log("service_role + new URL:", error?.message || "ok");

if (!error) {
  console.log(`
تم تحديث الرابط والمشروع.
مهم: انسخي أيضاً anon key من نفس المشروع (${ref}) إلى VITE_SUPABASE_PUBLISHABLE_KEY في .env
ثم شغّلي: node scripts/setup-admin.mjs
`);
} else {
  console.log("Fix service_role or URL in Supabase dashboard.");
}
