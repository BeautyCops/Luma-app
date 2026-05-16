import { Home, Grid, Calendar, User } from "./icons";

type Tab = "home" | "services" | "bookings" | "account";

const items: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "الرئيسية", Icon: Home },
  { id: "services", label: "الخدمات", Icon: Grid },
  { id: "bookings", label: "حجوزاتي", Icon: Calendar },
  { id: "account", label: "حسابي", Icon: User },
];

export const BottomNav = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
  return (
    <nav className="fixed md:absolute lg:hidden bottom-0 inset-x-0 z-50 pb-safe pointer-events-none">
      <div className="mx-auto max-w-md px-4 pb-3 pointer-events-auto">
        <div className="glass-strong rounded-[28px] shadow-pop px-2 py-2 flex items-center justify-between">
          {items.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="tap relative flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl ease-soft"
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute inset-1 rounded-2xl bg-foreground/[0.04] dark:bg-gold/10 ring-1 ring-gold/30" />
                )}
                <Icon
                  className={`relative h-5 w-5 transition-colors ${
                    isActive ? "text-gold" : "text-muted-ink"
                  }`}
                />
                <span
                  className={`relative text-[10.5px] font-medium tracking-tight transition-colors ${
                    isActive ? "text-foreground" : "text-muted-ink"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export type { Tab };
