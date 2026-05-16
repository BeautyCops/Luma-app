import { Lock, SparkleFilled, ArrowLeft, Clock } from "./icons";
import w1 from "@/assets/worker-1.jpg";
import w2 from "@/assets/worker-2.jpg";
import w3 from "@/assets/worker-3.jpg";

export const ServicesScreen = ({ onBook }: { onBook: () => void }) => {
  return (
    <div className="space-y-7 pb-32">
      <div className="px-5 pt-2">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">الخدمات</div>
        <h2 className="text-[26px] font-semibold tracking-tight leading-tight">
          اختاري الخدمة المناسبة لمنزلك
        </h2>
      </div>

      {/* Active service — premium hero card */}
      <section className="px-5">
        <button
          onClick={onBook}
          className="tap w-full text-right surface-card overflow-hidden relative group"
        >
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 text-gold px-2.5 py-1 text-[10.5px] font-semibold mb-3">
                  <SparkleFilled className="h-3 w-3" />
                  متاحة الآن
                </div>
                <h3 className="text-[22px] font-semibold tracking-tight">عاملة منزلية بالساعة</h3>
                <p className="text-[13px] text-muted-ink mt-1.5 max-w-[34ch]">
                  تنظيف، ترتيب، ومساعدة منزلية بأيدي موثوقة ومدربة.
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-gold grid place-items-center shadow-glow shrink-0">
                <SparkleFilled className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>

            <div className="flex -space-x-3 space-x-reverse mb-5">
              {[w1, w2, w3].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-card"
                  loading="lazy"
                  width={40}
                  height={40}
                />
              ))}
              <div className="h-10 w-10 rounded-full grid place-items-center text-[11px] font-semibold bg-secondary text-secondary-foreground ring-2 ring-card">
                +20
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-hairline">
              <div className="flex items-center gap-2 text-[12px] text-muted-ink">
                <Clock className="h-4 w-4" />
                تبدأ من ٤٥ ر.س / ساعة
              </div>
              <div className="inline-flex items-center gap-1 text-gold text-[13px] font-semibold">
                احجزي
                <ArrowLeft className="h-4 w-4" />
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Coming soon */}
      <section className="px-5">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[14px] font-semibold tracking-tight">قريباً</h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-ink">خدمات قادمة</span>
        </div>
        <div className="space-y-2.5">
          {[
            { t: "طاقم ضيافة", s: "خدمة احترافية لمناسباتك الخاصة" },
            { t: "صالون منزلي", s: "تجربة عناية فاخرة في منزلك" },
          ].map(({ t, s }) => (
            <div
              key={t}
              className="surface-card p-4 flex items-center gap-4 opacity-80"
            >
              <div className="h-11 w-11 rounded-2xl bg-secondary grid place-items-center text-muted-ink">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-semibold">{t}</div>
                  <span className="text-[10px] tracking-wider text-gold border border-gold/40 rounded-full px-2 py-0.5">
                    قريباً
                  </span>
                </div>
                <div className="text-[12px] text-muted-ink mt-0.5">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
