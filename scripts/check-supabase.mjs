import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";

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
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("url", url ? "set" : "missing");
console.log("anon", key ? "set" : "missing");
console.log("service_role", service ? "set" : "missing");

if (!url || !key) process.exit(1);

const sb = createClient(url, key);
for (const t of ["profiles", "services", "workers", "bookings", "user_roles"]) {
  const { error } = await sb.from(t).select("id").limit(1);
  console.log(t + ":", error ? error.message : "ok");
}
