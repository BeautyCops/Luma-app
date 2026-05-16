import { readFileSync, existsSync } from "fs";

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

function decodeRole(jwt) {
  try {
    return JSON.parse(Buffer.from(jwt.split(".")[1], "base64url")).role;
  } catch {
    return null;
  }
}

const e = loadEnv();
const url = e.VITE_SUPABASE_URL || e.SUPABASE_URL;
const sk = e.SUPABASE_SERVICE_ROLE_KEY || "";
const anon = e.VITE_SUPABASE_PUBLISHABLE_KEY || "";

console.log("url:", url || "(missing)");
console.log("anon: length", anon.length, decodeRole(anon) ? `role=${decodeRole(anon)}` : "");

if (!sk) {
  console.error("SUPABASE_SERVICE_ROLE_KEY missing");
  process.exit(1);
}

if (sk.startsWith("sb_secret_")) {
  console.error(`
المفتاح الحالي يبدأ بـ sb_secret_ — هذا المفتاح الجديد ولا يعمل مع إعداد الأدمن في المشروع حالياً.

من Supabase → Settings → API:
  انزلي لقسم "Legacy API keys" أو "JWT keys"
  انسخي service_role (يبدأ بـ eyJ وطوله ~200+ حرف)
  استبدليه في .env مكان السطر الحالي:
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
`);
  process.exit(1);
}

const role = decodeRole(sk);
console.log("service: length", sk.length, role ? `role=${role}` : "(not a JWT)");

if (role !== "service_role") {
  console.error("ERROR: use legacy service_role JWT (eyJ...), not anon.");
  process.exit(1);
}

console.log("OK — run: node scripts/setup-admin.mjs");
