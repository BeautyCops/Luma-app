function readEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY"): string | undefined {
  const raw = import.meta.env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const supabaseUrl = readEnv("VITE_SUPABASE_URL") ?? "";
export const supabaseAnonKey = readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  supabaseUrl.includes(".supabase.co");
