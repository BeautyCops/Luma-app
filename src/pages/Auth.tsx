import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@supabase/supabase-js";
import { authErrorMessage, isAdminUser, upsertProfile } from "@/lib/auth-helpers";
import { signUpAndEnter } from "@/lib/auth-signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (isAdmin) navigate("/admin", { replace: true });
    else navigate("/?tab=account", { replace: true });
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("type") === "signup" || window.location.hash.includes("access_token")) {
      toast.success("تم تأكيد بريدك — يمكنك تسجيل الدخول");
      setMode("signin");
      window.history.replaceState({}, "", "/auth");
    }
  }, []);

  const afterAuth = (authUser: User) => {
    toast.success(mode === "signup" ? "تم إنشاء الحساب!" : "تم تسجيل الدخول");
    if (isAdminUser(authUser)) navigate("/admin", { replace: true });
    else navigate("/?tab=account", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("تعذّر الاتصال، حاولي لاحقاً");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { user: newUser } = await signUpAndEnter({
          email,
          password,
          fullName,
          phone,
        });
        afterAuth(newUser);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.user) throw new Error("تعذّر تسجيل الدخول");

        await upsertProfile(data.user, { full_name: fullName, phone });
        afterAuth(data.user);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(authErrorMessage(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-pop">
        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">
            {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "أهلاً بعودتك" : "أنشئي حسابك"}
          </h1>
          <p className="text-sm text-muted-ink mt-1">لحجوزاتك وتجربتك في لومن</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال (اختياري)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" disabled={busy || loading} className="w-full">
            {busy ? "..." : mode === "signin" ? "دخول" : "إنشاء حساب"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-ink">
          {mode === "signin" ? (
            <>
              ليس لديك حساب؟{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-gold font-medium">
                سجّلي الآن
              </button>
            </>
          ) : (
            <>
              لديك حساب؟{" "}
              <button type="button" onClick={() => setMode("signin")} className="text-gold font-medium">
                سجّلي الدخول
              </button>
            </>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-muted-ink">
          <Link to="/" className="hover:text-foreground">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
