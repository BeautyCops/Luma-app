import { readFileSync } from "fs";

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
const url = e.VITE_SUPABASE_URL?.replace(/\/$/, "");
const key = e.SUPABASE_SERVICE_ROLE_KEY;

for (const path of ["/pg/query", "/rest/v1/rpc/exec_sql"]) {
  const res = await fetch(`${url}${path}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "select 1 as n" }),
  });
  const text = await res.text();
  console.log(path, res.status, text.slice(0, 80));
}
