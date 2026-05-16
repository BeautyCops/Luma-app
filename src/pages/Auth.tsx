import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/admin", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! يرجى تأكيد البريد الإلكتروني.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
        navigate("/admin", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-pop">
        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">
            {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "أهلاً بعودتك" : "أنشئ حسابك"}
          </h1>
          <p className="text-sm text-muted-ink mt-1">
            للوصول إلى لوحة الإدارة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "..." : mode === "signin" ? "دخول" : "إنشاء حساب"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-ink">
          {mode === "signin" ? (
            <>ليس لديك حساب؟{" "}
              <button onClick={() => setMode("signup")} className="text-gold font-medium">سجل الآن</button>
            </>
          ) : (
            <>لديك حساب؟{" "}
              <button onClick={() => setMode("signin")} className="text-gold font-medium">سجل الدخول</button>
            </>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-muted-ink">
          <Link to="/" className="hover:text-foreground">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
