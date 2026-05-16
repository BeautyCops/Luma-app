import heroBg from "@/assets/hero-bg.png";
import heroWorkers from "@/assets/hero-workers.png";
import w1 from "@/assets/worker-1.jpg";
import w2 from "@/assets/worker-2.jpg";
import w3 from "@/assets/worker-3.jpg";
import { Clock, Shield, SparkleFilled, ArrowLeft, Calendar, Star, Check, Chat, Plus, Minus } from "./icons";
import { useState } from "react";

export const HomeScreen = ({ onBook, onServices }: { onBook: () => void; onServices: () => void }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <div className="space-y-8 pb-32 lg:pb-16 lg:space-y-16 lg:px-10 lg:pt-2">
      {/* Hero */}
      <section className="px-5 pt-6 lg:px-0">
        <div className="relative overflow-hidden rounded-[28px] border border-hairline shadow-pop noise bg-[#0B0F1C]">
          {/* Background curves */}
          <div className="absolute inset-0">
            <img
              src={heroBg}
              alt=""
              aria-hidden
              className="h-full w-full object-cover"
              width={1024}
              height={1280}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1C] via-[#0B0F1C]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-l from-[#0B0F1C]/70 via-transparent to-transparent" />
          </div>

          {/* Workers image — transparent PNG, anchored to bottom */}
          <img
            src={heroWorkers}
            alt="فريق لومن"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[62%] w-auto max-w-[92%] object-contain object-bottom object-center bg-transparent drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] pointer-events-none select-none lg:left-auto lg:right-0 lg:translate-x-0 lg:h-[92%] lg:max-w-[58%]"
            width={992}
            height={984}
          />

          <div className="relative px-6 pt-7 pb-7 min-h-[480px] lg:min-h-[560px] lg:px-14 lg:pt-14 lg:pb-14 lg:max-w-[55%] flex flex-col">
            <div className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 mb-5 bg-white/10 backdrop-blur-md border border-white/15">
              <SparkleFilled className="h-3 w-3 text-gold" />
              <span className="text-[11px] tracking-wide text-white/90">خدمة موثوقة • متاحة يومياً</span>
            </div>

            <h2 className="text-[30px] lg:text-[52px] leading-[1.15] font-semibold tracking-tight text-white whitespace-nowrap">
              عاملة منزلية <span className="gold-gradient-text">بالساعة</span>
            </h2>
            <p className="mt-3 lg:mt-5 text-white/70 text-[14px] lg:text-[17px] leading-relaxed lg:max-w-[40ch]">
              خدمة موثوقة، في الوقت اللي يناسبك.
            </p>

            <div className="mt-auto pt-8 flex gap-2 relative z-20">
              <button
                onClick={onBook}
                className="tap flex-1 h-14 rounded-2xl bg-gradient-gold text-primary-foreground font-semibold tracking-tight shadow-glow flex items-center justify-center gap-2"
              >
                احجزي الآن
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
              <button
                onClick={onServices}
                className="tap h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center"
                aria-label="الخدمات"
              >
                <Calendar className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-5 lg:px-0">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[15px] font-semibold tracking-tight">لماذا لومن</h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">المميزات</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 lg:gap-6">
          {[
            { Icon: Clock, t: "حجز بالساعة", s: "مرونة كاملة" },
            { Icon: Shield, t: "فريق موثوق", s: "تدريب واعتماد" },
            { Icon: SparkleFilled, t: "متاح يومياً", s: "٧ أيام بالأسبوع" },
          ].map(({ Icon, t, s }, i) => (
            <div
              key={t}
              className={`surface-card p-4 lg:p-6 animate-rise delay-${i + 1}`}
            >
              <div className="h-9 w-9 rounded-xl bg-gold/10 text-gold grid place-items-center mb-3">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-[13px] font-semibold leading-tight">{t}</div>
              <div className="text-[11px] text-muted-ink mt-1">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live snapshot */}
      <section className="px-5 lg:px-0">
        <div className="surface-card p-5 flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-full bg-gradient-gold grid place-items-center shadow-glow">
            <span className="absolute inset-0 rounded-full shimmer-gold opacity-60" />
            <SparkleFilled className="relative h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">الخدمة متاحة الآن</div>
            <div className="text-[11px] text-muted-ink">أقرب موعد بعد ٣٠ دقيقة</div>
          </div>
          <div className="flex items-center gap-1 text-gold">
            <SparkleFilled className="h-3.5 w-3.5" />
            <span className="text-[12px] font-semibold">٤٫٩</span>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-5 lg:px-0">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-3">الثقة</div>
        <div className="grid grid-cols-3 gap-2.5 lg:gap-6">
          {[
            { t: "تأمين", s: "كامل على الخدمة" },
            { t: "تقييمات", s: "حقيقية وموثقة" },
            { t: "دعم", s: "على مدار الساعة" },
          ].map(({ t, s }) => (
            <div key={t} className="rounded-2xl border border-hairline p-4 lg:p-6">
              <div className="text-[13px] font-semibold">{t}</div>
              <div className="text-[11px] text-muted-ink mt-1 leading-snug">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — vertical timeline */}
      <section className="px-5 lg:px-0">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[15px] font-semibold tracking-tight">كيف تعمل لومن</h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">٣ خطوات</span>
        </div>
        <div className="relative">
          <span className="absolute right-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/60 via-hairline to-transparent" />
          {[
            { t: "اختاري الخدمة", s: "حددي نوع الخدمة والوقت المناسب لك", n: "١" },
            { t: "نختار لك الفريق", s: "نرشح لك عاملة مدرّبة وموثّقة بالكامل", n: "٢" },
            { t: "استمتعي بمنزل مرتب", s: "تابعي الموعد وقيّمي الخدمة بسهولة", n: "٣" },
          ].map((s, i) => (
            <div key={s.t} className={`relative flex gap-4 ${i ? "mt-4" : ""}`}>
              <div className="relative h-9 w-9 rounded-full bg-background border border-gold/40 grid place-items-center text-gold font-semibold text-[13px] shrink-0 shadow-soft">
                {s.n}
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[14px] font-semibold">{s.t}</div>
                <div className="text-[12px] text-muted-ink mt-1 leading-relaxed">{s.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing highlight */}
      <section className="px-5 lg:px-0">
        <div className="relative overflow-hidden surface-card p-6">
          <div className="absolute -top-16 -left-16 h-44 w-44 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">السعر</div>
              <h3 className="text-[20px] font-semibold tracking-tight leading-tight">
                فترة كاملة بسعر ثابت
              </h3>
              <p className="text-[12.5px] text-muted-ink mt-2 max-w-[28ch] leading-relaxed">
                ٣ ساعات من الخدمة الموثوقة، بدون رسوم خفية ولا مفاجآت.
              </p>
            </div>
            <div className="text-left shrink-0">
              <div className="gold-gradient-text text-[40px] font-semibold leading-none">٩٠</div>
              <div className="text-[11px] text-muted-ink mt-1">ر.س / فترة</div>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-2 gap-2">
            {["٣ ساعات خدمة", "فريق مدرّب", "تأمين كامل", "إلغاء مجاني"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-[12px] text-foreground/80">
                <span className="h-5 w-5 rounded-full bg-gold/15 text-gold grid place-items-center">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={onBook}
            className="tap relative mt-6 w-full h-12 rounded-2xl bg-foreground text-background font-semibold text-[14px] flex items-center justify-center gap-2"
          >
            احجزي فترتك الآن
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </section>

      {/* Testimonials — horizontal scroll */}
      <section>
        <div className="px-5 lg:px-0 flex items-baseline justify-between mb-3">
          <h3 className="text-[15px] font-semibold tracking-tight">آراء عميلاتنا</h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">قصص حقيقية</span>
        </div>
        <div className="overflow-x-auto -mx-1 lg:overflow-visible lg:mx-0">
          <div className="flex gap-3 px-5 pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:gap-6 lg:px-0 lg:pb-0">
            {[
              { n: "نورة", c: "الرياض", r: 5, q: "العاملة وصلت بالوقت تماماً، شغل احترافي وتعامل راقي. صار حجزي أسبوعي معهم." },
              { n: "ريم", c: "جدة", r: 5, q: "أول مرة أستخدم خدمة بالساعة وفعلاً مريحة. الحجز أخذ مني أقل من دقيقة." },
              { n: "سارة", c: "الدمام", r: 5, q: "البيت تغيّر بعد فترة وحدة. شفافية بالسعر وما في أي مفاجآت." },
            ].map((t, i) => (
              <article
                key={t.n}
                className="snap-start shrink-0 w-[80%] lg:w-auto surface-card p-5 lg:p-7 relative overflow-hidden"
              >
                <div className="absolute top-3 left-4 text-gold/30 text-[60px] leading-none font-display select-none">
                  &ldquo;
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.r }).map((_, k) => (
                    <Star key={k} className="h-3.5 w-3.5 text-gold" />
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/90">{t.q}</p>
                <div className="mt-4 pt-4 border-t border-hairline flex items-center gap-3">
                  <img
                    src={[w1, w2, w3][i]}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-hairline"
                    width={36}
                    height={36}
                    loading="lazy"
                  />
                  <div>
                    <div className="text-[12.5px] font-semibold">{t.n}</div>
                    <div className="text-[10.5px] text-muted-ink">{t.c}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-5 lg:px-0">
        <div className="surface-card p-5 grid grid-cols-3 divide-x divide-x-reverse divide-hairline">
          {[
            { v: "+٢٠٠٠", l: "حجز مكتمل" },
            { v: "٤٫٩", l: "تقييم العميلات" },
            { v: "٩٧٪", l: "إعادة طلب" },
          ].map((s) => (
            <div key={s.l} className="px-2 text-center">
              <div className="gold-gradient-text text-[22px] font-semibold leading-none">{s.v}</div>
              <div className="text-[10.5px] text-muted-ink mt-1.5">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 lg:px-0">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[15px] font-semibold tracking-tight">أسئلة شائعة</h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">مساعدة</span>
        </div>
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:items-start">
          {[
            { q: "كم مدة الفترة الواحدة؟", a: "كل فترة ٣ ساعات بسعر ثابت ٩٠ ر.س، صباحية أو مسائية أو ليلية." },
            { q: "هل العاملات موثّقات؟", a: "نعم، جميع عاملاتنا يخضعن لتدريب واعتماد كامل قبل الانضمام للفريق." },
            { q: "هل يمكنني إلغاء الحجز؟", a: "نعم، الإلغاء مجاني قبل ٣ ساعات من الموعد دون أي رسوم." },
            { q: "كيف يتم الدفع؟", a: "الدفع إلكتروني وآمن عبر التطبيق بعد تأكيد الحجز." },
          ].map((f, i) => {
            const open = openFaq === i;
            return (
              <button
                key={f.q}
                onClick={() => setOpenFaq(open ? null : i)}
                className={`tap w-full text-right rounded-2xl border ease-soft p-4 ${
                  open ? "border-gold/40 bg-gold/5" : "border-hairline"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[13.5px] font-semibold">{f.q}</div>
                  <span className={`h-7 w-7 rounded-full grid place-items-center shrink-0 ease-soft ${
                    open ? "bg-gradient-gold text-primary-foreground" : "bg-secondary text-muted-ink"
                  }`}>
                    {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </div>
                <div
                  className={`grid ease-soft transition-all ${
                    open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[12.5px] text-muted-ink leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Support card */}
      <section className="px-5 lg:px-0">
        <div className="relative overflow-hidden rounded-[28px] p-6 bg-gradient-night text-white shadow-pop">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-gold grid place-items-center shadow-glow shrink-0">
              <Chat className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-1.5">دعم لومن</div>
              <h3 className="text-[18px] font-semibold tracking-tight">نحن هنا في أي وقت</h3>
              <p className="text-[12.5px] text-white/70 mt-2 leading-relaxed max-w-[34ch]">
                فريق الدعم متاح ٢٤/٧ للإجابة على استفساراتك ومساعدتك خطوة بخطوة.
              </p>
              <div className="mt-4 flex gap-2">
                <button className="tap h-10 px-4 rounded-xl bg-white text-[#0B0F1C] text-[12.5px] font-semibold">
                  محادثة فورية
                </button>
                <button className="tap h-10 px-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white text-[12.5px] font-semibold">
                  اتصلي بنا
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 lg:px-0">
        <div className="text-center py-2">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">جاهزة؟</div>
          <h3 className="text-[22px] font-semibold tracking-tight leading-tight">
            ابدئي تجربة <span className="gold-gradient-text">لومن</span> اليوم
          </h3>
          <p className="text-[13px] text-muted-ink mt-2 max-w-[32ch] mx-auto">
            خدمة موثوقة، أسعار شفافة، ووقت يناسبك.
          </p>
          <button
            onClick={onBook}
            className="tap mt-5 inline-flex items-center justify-center gap-2 h-13 px-8 py-4 rounded-2xl bg-gradient-gold text-primary-foreground font-semibold shadow-glow"
          >
            احجزي الآن
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </section>
    </div>
  );
};
