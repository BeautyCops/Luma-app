/**
 * يطبّق schema.sql عبر اتصال Postgres (أضيفي SUPABASE_DB_PASSWORD في .env).
 */
import { readFileSync, existsSync } from "fs";
import postgres from "postgres";

function loadEnv() {
  const o = {};
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
      o[k] = v;
    }
  }
  return o;
}

const e = loadEnv();
const ref = e.VITE_SUPABASE_PROJECT_ID;
const password = e.SUPABASE_DB_PASSWORD;

if (!ref || !password) {
  console.error("أضيفي في .env: SUPABASE_DB_PASSWORD=كلمة مرور قاعدة البيانات من Supabase → Settings → Database");
  process.exit(1);
}

const connectionString = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

const sql = postgres(connectionString, { ssl: "require", max: 1 });
const schema = readFileSync("supabase/schema.sql", "utf8");

try {
  await sql.unsafe(schema);
  console.log("schema.sql applied");
  const fix = readFileSync("supabase/fix-grants.sql", "utf8");
  await sql.unsafe(fix);
  console.log("fix-grants.sql applied");
  const seed = readFileSync("supabase/seed.sql", "utf8");
  await sql.unsafe(seed);
  console.log("seed.sql applied");
} catch (err) {
  console.error("SQL error:", err.message);
  process.exit(1);
} finally {
  await sql.end();
}
