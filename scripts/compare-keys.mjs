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
const anon = e.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const service = e.SUPABASE_SERVICE_ROLE_KEY || "";

function role(jwt) {
  try {
    return JSON.parse(Buffer.from(jwt.split(".")[1], "base64url")).role;
  } catch {
    return "?";
  }
}

console.log("anon === service ?", anon === service);
console.log("anon role:", role(anon));
console.log("service role:", role(service));
