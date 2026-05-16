/** قيم عامة (anon) — تُستخدم إذا لم تُضبط متغيرات Vite عند البناء على Netlify */
export const LUMEN_SUPABASE_URL = "https://riuiyhdcxzmnppqlyjpf.supabase.co";
export const LUMEN_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpdWl5aGRjeHptbnBwcWx5anBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzM1MDYsImV4cCI6MjA5Mzg0OTUwNn0.aUvgDdLLTXudR7kfek1h5yYOfURPkI7mCHq5YWngWNk";

function readEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY"): string | undefined {
  const raw = import.meta.env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const supabaseUrl = readEnv("VITE_SUPABASE_URL") ?? LUMEN_SUPABASE_URL;
export const supabaseAnonKey = readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ?? LUMEN_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes("placeholder");
