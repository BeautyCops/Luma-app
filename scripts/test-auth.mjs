import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";

function loadEnv() {
  const out = {};
  for (const file of [".env"]) {
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

const e = loadEnv();
const sb = createClient(e.VITE_SUPABASE_URL, e.VITE_SUPABASE_PUBLISHABLE_KEY);
const email = "r.s.althobaiti@gmail.com";
const password = "123456";

let r = await sb.auth.signInWithPassword({ email, password });
console.log("signIn:", r.error?.message || "ok", r.data.user?.id);

if (r.error) {
  r = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: "Admin" } },
  });
  console.log("signUp:", r.error?.message || "ok", "session:", !!r.data.session);
}
