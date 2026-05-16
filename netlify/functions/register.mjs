/**
 * تسجيل مستخدم جديد مع تأكيد فوري للبريد (بدون رسالة Lovable).
 * يتطلب SUPABASE_SERVICE_ROLE_KEY (Netlify UI أو يُولَّد عند البناء عبر inject-env).
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadRuntimeEnv() {
  const path = join(__dirname, ".runtime-env.json");
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

const runtime = loadRuntimeEnv();

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { ...cors, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });

  const url =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || runtime.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || runtime.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return json(503, { error: "auth_not_configured" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const fullName = String(payload.fullName || "").trim();
  const phone = String(payload.phone || "").trim();

  if (!email || !password || password.length < 6) {
    return json(400, { error: "invalid_input" });
  }
  if (!fullName) return json(400, { error: "name_required" });

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);

  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    runtime.SUPABASE_ANON_KEY;

  const publicClient = createClient(url, anonKey);

  if (existing) {
    const { data: signIn, error: signInError } = await publicClient.auth.signInWithPassword({
      email,
      password,
    });
    if (!signInError && signIn.session) {
      return json(200, {
        ok: true,
        session: signIn.session,
        user: signIn.user,
      });
    }
    return json(409, { error: "user_already_registered" });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    const msg = createError.message.toLowerCase();
    if (msg.includes("already")) return json(409, { error: "user_already_registered" });
    if (msg.includes("weak") || msg.includes("easy to guess")) return json(400, { error: "weak_password" });
    return json(400, { error: "signup_failed", message: createError.message });
  }

  const userId = created.user?.id;
  if (userId) {
    await admin.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    });
  }

  const { data: signIn, error: signInError } = await publicClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signIn.session) {
    return json(200, {
      ok: true,
      needsSignIn: true,
      user: { id: userId, email },
    });
  }

  return json(200, {
    ok: true,
    session: signIn.session,
    user: signIn.user,
  });
}
