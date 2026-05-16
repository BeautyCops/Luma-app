import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { fetchIsAdmin, fetchProfile, type Profile } from "@/lib/auth-helpers";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (u: User | null) => {
    if (!u || !isSupabaseConfigured) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const [admin, prof] = await Promise.all([fetchIsAdmin(u.id), fetchProfile(u.id)]);
    setIsAdmin(admin);
    setProfile(prof);
  }, []);

  const refreshUserData = useCallback(async () => {
    if (user) await loadUserData(user);
  }, [user, loadUserData]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const applySession = async (s: Session | null) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      await loadUserData(s?.user ?? null);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      void applySession(s);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => applySession(s));

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isAdmin, loading, signOut, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
