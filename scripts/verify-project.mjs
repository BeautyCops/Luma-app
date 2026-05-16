import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const o = {};
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

function payload(jwt) {
  return JSON.parse(Buffer.from(jwt.split(".")[1], "base64url"));
}

const e = loadEnv();
const url = e.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anon = e.VITE_SUPABASE_PUBLISHABLE_KEY;
const service = e.SUPABASE_SERVICE_ROLE_KEY;
const refFromUrl = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

let refService, refAnon;
try {
  refService = payload(service).ref;
  refAnon = payload(anon).ref;
} catch (err) {
  console.error("JWT decode failed", err.message);
  process.exit(1);
}

console.log("URL project ref:", refFromUrl);
console.log("anon JWT ref:", refAnon);
console.log("service JWT ref:", refService);
console.log("URL matches service?", refFromUrl === refService);
console.log("URL matches anon?", refFromUrl === refAnon);

const sb = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tests = [
  () => sb.auth.admin.listUsers({ perPage: 1 }),
  () => sb.from("services").select("id").limit(1),
];

for (const [i, t] of tests.entries()) {
  const { error } = await t();
  console.log(`test ${i + 1}:`, error?.message || "ok");
}
