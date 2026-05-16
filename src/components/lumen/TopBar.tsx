import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import type { Tab } from "./BottomNav";
import { LayoutDashboard } from "lucide-react";

const navItems: { id: Tab; label: string }[] = [
  { id: "home", label: "الرئيسية" },
  { id: "services", label: "الخدمات" },
  { id: "bookings", label: "حجوزاتي" },
  { id: "account", label: "حسابي" },
];

export const TopBar = ({
  title,
  subtitle,
  activeTab,
  onTabChange,
}: {
  title?: string;
  subtitle?: string;
  activeTab?: Tab;
  onTabChange?: (t: Tab) => void;
}) => {
  return (
    <header className="pt-safe lg:sticky lg:top-0 lg:z-40 lg:bg-background/80 lg:backdrop-blur-xl lg:border-b lg:border-hairline">
      <div className="px-5 pt-4 pb-2 lg:px-10 lg:py-4 flex items-center justify-between gap-6">
        <Logo size={22} />

        {/* Desktop nav */}
        {activeTab && onTabChange && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((it) => {
              const isActive = it.id === activeTab;
              return (
                <button
                  key={it.id}
                  onClick={() => onTabChange(it.id)}
                  className={`tap relative px-4 py-2 rounded-full text-[13px] font-medium tracking-tight ease-soft ${
                    isActive
                      ? "text-foreground bg-foreground/[0.04] dark:bg-gold/10 ring-1 ring-gold/30"
                      : "text-muted-ink hover:text-foreground"
                  }`}
                >
                  {it.label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <AdminLink />
          <ThemeToggle />
        </div>
      </div>
      {title && (
        <div className="px-5 pt-6 pb-2 lg:px-10 animate-rise">
          {subtitle && (
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">{subtitle}</div>
          )}
          <h1 className="text-[28px] leading-[1.15] font-semibold tracking-tight">{title}</h1>
        </div>
      )}
    </header>
  );
};

const AdminLink = () => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (isAdmin) {
    return (
      <Link
        to="/admin"
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-gold ring-1 ring-gold/30 hover:bg-gold/10 ease-soft"
        aria-label="لوحة الإدارة"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        الإدارة
      </Link>
    );
  }
  if (user) return null;
  return (
    <Link
      to="/auth?intent=customer"
      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-muted-ink ring-1 ring-hairline hover:text-foreground ease-soft"
    >
      دخول
    </Link>
  );
};
