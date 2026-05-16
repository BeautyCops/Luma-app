import { ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, CalendarCheck, Users, Briefcase, Star, LogOut, Home } from "lucide-react";
import { ThemeProvider } from "@/components/lumen/ThemeProvider";
import { ThemeToggle } from "@/components/lumen/ThemeToggle";
import { Logo } from "@/components/lumen/Logo";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, end: true },
  { to: "/admin/bookings", label: "الحجوزات", icon: CalendarCheck },
  { to: "/admin/workers", label: "العاملات", icon: Users },
  { to: "/admin/services", label: "الخدمات", icon: Briefcase },
  { to: "/admin/customers", label: "العملاء والتقييمات", icon: Star },
];

export const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-ink text-sm">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center glass-strong rounded-3xl p-8 shadow-pop">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">صلاحيات محدودة</div>
          <h1 className="text-2xl font-semibold tracking-tight mb-3">ليس لديك صلاحية الوصول</h1>
          <p className="text-sm text-muted-ink mb-6">
            هذا الحساب ليس له صلاحيات أدمن. تواصل مع المدير ليمنحك الصلاحية.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => signOut()}>تسجيل الخروج</Button>
            <Button asChild><a href="/">الرئيسية</a></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div dir="rtl" className="min-h-screen flex bg-background">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-l border-hairline bg-background sticky top-0 h-screen">
          <div className="px-6 py-5 flex items-center justify-between border-b border-hairline">
            <Logo size={22} />
            <span className="text-[10px] uppercase tracking-[0.22em] text-gold">أدمن</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-foreground/[0.05] dark:bg-gold/10 text-foreground ring-1 ring-gold/30"
                      : "text-muted-ink hover:text-foreground hover:bg-foreground/[0.03]"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-hairline space-y-2">
            <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-ink hover:text-foreground hover:bg-foreground/[0.03]">
              <Home className="h-4 w-4" /> الموقع
            </a>
            <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-ink hover:text-foreground hover:bg-foreground/[0.03]">
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-b border-hairline">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo size={20} />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button size="sm" variant="outline" onClick={signOut}>خروج</Button>
            </div>
          </div>
          <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap ${
                    isActive
                      ? "bg-foreground/[0.06] text-foreground ring-1 ring-gold/30"
                      : "text-muted-ink"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Main */}
        <main className="flex-1 min-w-0 pt-[100px] lg:pt-0">
          <div className="hidden lg:flex items-center justify-end gap-3 px-8 py-4 border-b border-hairline">
            <span className="text-sm text-muted-ink">{user.email}</span>
            <ThemeToggle />
          </div>
          <div className="px-5 lg:px-10 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="flex items-end justify-between gap-4 mb-6">
    <div>
      {subtitle && <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-1.5">{subtitle}</div>}
      <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{title}</h1>
    </div>
    {actions}
  </div>
);
