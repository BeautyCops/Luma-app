import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Chat, Shield, SparkleFilled, User } from "./icons";
import { InfoPageSheet } from "./InfoPageSheet";
import { INFO_PAGES, type InfoPageId } from "@/content/info-pages";

const menuItems: { id: InfoPageId; Icon: typeof Shield; t: string; s: string }[] = [
  { id: "security", Icon: Shield, t: "الأمان والتأمين", s: "تعرفي على ضمانات الخدمة" },
  { id: "support", Icon: Chat, t: "الدعم", s: "تواصلي معنا في أي وقت" },
  { id: "about", Icon: SparkleFilled, t: "عن لومن", s: "قصتنا ورؤيتنا" },
];

export const AccountScreen = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const [infoPage, setInfoPage] = useState<InfoPageId | null>(null);

  const displayName =
    profile?.full_name ||
    (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ||
    user?.email?.split("@")[0] ||
    "ضيف";

  return (
    <div className="pb-32 space-y-6">
      <div className="px-5 pt-2">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">حسابي</div>
        <h2 className="text-[26px] font-semibold tracking-tight">
          {user ? `مرحباً، ${displayName}` : "مرحباً بك"}
        </h2>
      </div>

      <div className="px-5">
        <div className="surface-card p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-gold grid place-items-center shadow-glow">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold truncate">{user ? displayName : "ضيف"}</div>
            <div className="text-[12px] text-muted-ink truncate">
              {loading ? "..." : user ? user.email : "سجّلي للحصول على تجربة كاملة"}
            </div>
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="tap h-10 px-4 rounded-xl border border-hairline text-[12.5px] font-semibold"
            >
              خروج
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="tap h-10 px-4 rounded-xl bg-foreground text-background text-[12.5px] font-semibold"
            >
              دخول
            </button>
          )}
        </div>

        {user && isAdmin && (
          <Link
            to="/admin"
            className="mt-3 flex items-center justify-center gap-2 w-full tap h-11 rounded-xl bg-gold/10 text-gold text-[13px] font-semibold ring-1 ring-gold/30"
          >
            لوحة الإدارة
          </Link>
        )}
      </div>

      <div className="px-5">
        <div className="text-[12px] text-muted-ink mb-3">عام</div>
        <div className="surface-card divide-y divide-hairline overflow-hidden">
          {menuItems.map(({ id, Icon, t, s }) => (
            <button
              key={id}
              type="button"
              onClick={() => setInfoPage(id)}
              className="tap w-full p-4 flex items-center gap-3 text-right hover:bg-foreground/[0.02]"
            >
              <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold grid place-items-center">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold">{t}</div>
                <div className="text-[11.5px] text-muted-ink mt-0.5">{s}</div>
              </div>
              <span className="text-muted-ink">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 text-center text-[11px] text-muted-ink pt-4">
        Lumen v1.0 — صُنع بعناية في السعودية
      </div>

      <InfoPageSheet
        page={infoPage ? INFO_PAGES[infoPage] : null}
        onClose={() => setInfoPage(null)}
        showContactCta={infoPage === "support"}
      />
    </div>
  );
};
