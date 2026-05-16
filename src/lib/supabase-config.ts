function readEnv(names: string[]): string | undefined {
  for (const name of names) {
    const raw = import.meta.env[name];
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return undefined;
}

export const supabaseUrl =
  readEnv(["VITE_SUPABASE_URL", "SUPABASE_URL"]) ?? "";

export const supabaseAnonKey =
  readEnv([
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  ]) ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  supabaseUrl.includes(".supabase.co");
