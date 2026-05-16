import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { authErrorMessage, fetchIsAdmin, upsertProfile } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LayoutDashboard, User } from "lucide-react";

type AuthIntent = "customer" | "admin";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent: AuthIntent = searchParams.get("intent") === "admin" ? "admin" : "customer";

  const { user, isAdmin, loading, refreshUserData } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const setIntent = (next: AuthIntent) => {
    const params = new URLSearchParams(searchParams);
    params.set("intent", next);
    if (next === "admin") setMode("signin");
    navigate({ pathname: "/auth", search: params.toString() }, { replace: true });
  };

  const goAfterAuth = async (userId: string) => {
    await refreshUserData();
    const admin = await fetchIsAdmin(userId);

    if (intent === "admin") {
      if (admin) navigate("/admin", { replace: true });
      else toast.error("هذا الحساب ليس أدمن. اطلبي من المدير إضافة صلاحية admin في Supabase.");
      return;
    }
    navigate("/?tab=account", { replace: true });
  };

  useEffect(() => {
    if (loading || !user) return;
    if (intent === "admin" && isAdmin) navigate("/admin", { replace: true });
    else if (intent === "customer") navigate("/?tab=account", { replace: true });
  }, [user, loading, isAdmin, intent, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("المصادقة غير مفعّلة — أضف متغيرات Supabase في Netlify ثم أعد النشر");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        if (intent === "admin") {
          toast.error("إنشاء حساب أدمن من التطبيق غير متاح — سجّلي دخول بحساب مُصرّح له");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?intent=customer`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;

        if (data.session?.user) {
          await upsertProfile(data.session.user, { full_name: fullName, phone });
          toast.success("تم إنشاء الحساب!");
          await goAfterAuth(data.session.user.id);
        } else {
          toast.success("تم إرسال رابط التأكيد إلى بريدك — بعد التأكيد سجّلي الدخول");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.user) throw new Error("تعذّر تسجيل الدخول");

        await upsertProfile(data.user, { full_name: fullName, phone });
        toast.success("تم تسجيل الدخول");
        await goAfterAuth(data.user.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      toast.error(authErrorMessage(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-pop">
        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl bg-destructive/10 text-destructive text-xs p-3 text-center">
            Supabase غير مضبوط في البناء. أضيفي VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY في Netlify.
          </div>
        )}

        <div className="flex gap-2 p-1 rounded-2xl bg-secondary/60 mb-6">
          <button
            type="button"
            onClick={() => setIntent("customer")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
              intent === "customer" ? "bg-background shadow-sm text-foreground" : "text-muted-ink"
            }`}
          >
            <User className="h-4 w-4" />
            عميل
          </button>
          <button
            type="button"
            onClick={() => setIntent("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
              intent === "admin" ? "bg-background shadow-sm text-foreground" : "text-muted-ink"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            أدمن
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">
            {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {intent === "admin"
              ? mode === "signin"
                ? "لوحة الإدارة"
                : "حساب إداري"
              : mode === "signin"
                ? "أهلاً بعودتك"
                : "أنشئي حسابك"}
          </h1>
          <p className="text-sm text-muted-ink mt-1">
            {intent === "admin"
              ? "للموظفات والمديرات المصرّح لهم فقط"
              : "لحجوزاتك وتقييماتك في لومن"}
          </p>
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
          {intent === "admin" ? (
            <p className="text-xs">صلاحية الأدمن تُمنح من Supabase (جدول user_roles) وليس من التسجيل العام.</p>
          ) : mode === "signin" ? (
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
