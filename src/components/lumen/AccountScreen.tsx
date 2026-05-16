import { Chat, Shield, SparkleFilled, User } from "./icons";

export const AccountScreen = () => {
  return (
    <div className="pb-32 space-y-6">
      <div className="px-5 pt-2">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">حسابي</div>
        <h2 className="text-[26px] font-semibold tracking-tight">مرحباً بك</h2>
      </div>

      <div className="px-5">
        <div className="surface-card p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-gold grid place-items-center shadow-glow">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold">ضيف</div>
            <div className="text-[12px] text-muted-ink">سجّلي للحصول على تجربة كاملة</div>
          </div>
          <button className="tap h-10 px-4 rounded-xl bg-foreground text-background text-[12.5px] font-semibold">
            دخول
          </button>
        </div>
      </div>

      <div className="px-5">
        <div className="text-[12px] text-muted-ink mb-3">عام</div>
        <div className="surface-card divide-y divide-hairline overflow-hidden">
          {[
            { Icon: Shield, t: "الأمان والتأمين", s: "تعرفي على ضمانات الخدمة" },
            { Icon: Chat, t: "الدعم", s: "تواصلي معنا في أي وقت" },
            { Icon: SparkleFilled, t: "عن لومن", s: "قصتنا ورؤيتنا" },
          ].map(({ Icon, t, s }) => (
            <button key={t} className="tap w-full p-4 flex items-center gap-3 text-right">
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
    </div>
  );
};
