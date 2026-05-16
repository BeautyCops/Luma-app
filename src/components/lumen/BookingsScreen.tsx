import { Calendar, Clock, Shield, SparkleFilled } from "./icons";

export const BookingsScreen = () => {
  return (
    <div className="pb-32 space-y-6">
      <div className="px-5 pt-2">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">حجوزاتي</div>
        <h2 className="text-[26px] font-semibold tracking-tight">رحلتك مع لومن</h2>
      </div>

      {/* Upcoming */}
      <div className="px-5">
        <div className="text-[12px] text-muted-ink mb-3">القادم</div>
        <div className="surface-card p-5 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-gold grid place-items-center shadow-glow">
              <SparkleFilled className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold">عاملة منزلية بالساعة</div>
              <div className="text-[11.5px] text-muted-ink mt-1">حجز مؤكد</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11.5px]">
                  <Calendar className="h-3.5 w-3.5" />
                  الأربعاء ١٢
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11.5px]">
                  <Clock className="h-3.5 w-3.5" />
                  ١٠:٠٠ ص • ٣ ساعات
                </span>
              </div>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-2 gap-2">
            <button className="tap h-11 rounded-xl border border-hairline text-[13px] font-medium">
              تعديل
            </button>
            <button className="tap h-11 rounded-xl bg-foreground text-background text-[13px] font-semibold">
              تواصل
            </button>
          </div>
        </div>
      </div>

      {/* Past */}
      <div className="px-5">
        <div className="text-[12px] text-muted-ink mb-3">سابقاً</div>
        <div className="surface-card p-4 flex items-center gap-3 opacity-80">
          <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center text-muted-ink">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">عاملة منزلية بالساعة</div>
            <div className="text-[11px] text-muted-ink mt-0.5">٢٨ أبريل • ٤ ساعات</div>
          </div>
          <div className="text-[11px] text-gold">مكتمل</div>
        </div>
      </div>
    </div>
  );
};
