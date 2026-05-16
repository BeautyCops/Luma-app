import { readFileSync, existsSync } from "fs";

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

const e = loadEnv();
const url = e.VITE_SUPABASE_URL;
const key = e.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});

console.log("status", res.status, await res.text().then((t) => t.slice(0, 120)));
