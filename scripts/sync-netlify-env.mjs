const token = process.env.NETLIFY_AUTH_TOKEN;
const siteId = process.env.NETLIFY_SITE_ID;
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anon =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!token || !siteId || !url || !anon) {
  console.log("[netlify] skip — missing NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID, or Supabase vars");
  process.exit(0);
}

const vars = [
  { key: "SUPABASE_URL", value: url },
  { key: "SUPABASE_ANON_KEY", value: anon },
  { key: "VITE_SUPABASE_URL", value: url },
  { key: "VITE_SUPABASE_PUBLISHABLE_KEY", value: anon },
];
if (service) vars.push({ key: "SUPABASE_SERVICE_ROLE_KEY", value: service });

for (const { key, value } of vars) {
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/${key}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      values: [{ value, context: "all" }],
      scopes: ["builds", "functions", "runtime"],
    }),
  });
  if (res.status === 404) {
    const create = await fetch(`https://api.netlify.com/api/v1/accounts/${siteId}/env`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        values: [{ value, context: "all" }],
        scopes: ["builds"],
      }),
    });
    console.log(key, create.ok ? "created" : create.status);
  } else {
    console.log(key, res.ok ? "updated" : res.status);
  }
}

console.log("[netlify] env sync attempted — trigger redeploy in Netlify UI");
