import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Check, Shield, SparkleFilled, Clock } from "./icons";
import { useAuth } from "@/hooks/useAuth";
import { BOOKING_PRICE, createBooking } from "@/lib/bookings";

const arNum = (n: number) => n.toLocaleString("ar-EG");
const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

type ShiftId = "morning" | "evening" | "night";
const shifts: { id: ShiftId; label: string; range: string; from: string; to: string }[] = [
  { id: "morning", label: "الفترة الصباحية", range: "١٠ ص – ١ م", from: "10:00", to: "13:00" },
  { id: "evening", label: "الفترة المسائية", range: "٢ م – ٥ م", from: "14:00", to: "17:00" },
  { id: "night", label: "الفترة الليلية", range: "٦ م – ٩ م", from: "18:00", to: "21:00" },
];

export const BookingScreen = ({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess?: () => void;
}) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const today = new Date();
  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, [today.getDate(), today.getMonth(), today.getFullYear()]);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(days[0]);
  const [selectedShift, setSelectedShift] = useState<ShiftId>("morning");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeShift = shifts.find((s) => s.id === selectedShift)!;

  const confirmBooking = async () => {
    if (!user) {
      toast.error("سجّلي الدخول لإتمام الحجز");
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    const result = await createBooking({
      bookingDate: selectedDate,
      bookingTime: activeShift.from,
      shiftLabel: activeShift.label,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.code === "not_signed_in") {
        toast.error(result.message);
        navigate("/auth");
        return;
      }
      toast.error(result.message);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="px-5 pt-10 pb-32 flex flex-col items-center text-center animate-rise">
        <div className="relative h-24 w-24 rounded-full bg-gradient-gold grid place-items-center shadow-glow">
          <span className="absolute inset-0 rounded-full shimmer-gold opacity-60" />
          <Check className="relative h-10 w-10 text-primary-foreground" strokeWidth={2} />
        </div>
        <h2 className="mt-6 text-[26px] font-semibold tracking-tight">تم تأكيد الحجز</h2>
        <p className="mt-2 text-muted-ink text-[14px] max-w-[28ch]">
          تم حفظ حجزك. سنرسل لك تفاصيل الموعد قبل الزيارة بـ ٣٠ دقيقة.
        </p>
        <button
          type="button"
          onClick={() => {
            onSuccess?.();
            onBack();
          }}
          className="tap mt-8 h-12 px-6 rounded-2xl bg-gradient-gold text-primary-foreground font-semibold"
        >
          عرض حجوزاتي
        </button>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <div className="px-5 pt-2 flex items-center justify-between">
        <button onClick={onBack} className="tap h-10 w-10 rounded-full glass grid place-items-center">
          <ArrowLeft className="h-5 w-5 rotate-180" />
        </button>
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold">
          الخطوة {arNum(step)} من ٢
        </div>
        <div className="h-10 w-10" />
      </div>

      {!user && !authLoading && (
        <div className="px-5 mt-3">
          <div className="rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3 text-[12.5px] text-foreground/90">
            سجّلي الدخول لحفظ الحجز في حسابك ومتابعته من «حجوزاتي».
          </div>
        </div>
      )}

      <div className="px-5 mt-4 flex gap-1.5">
        {[1, 2].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ease-soft transition-all ${
              step >= i ? "bg-gradient-gold" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      <div className="px-5 mt-6">
        <h2 className="text-[24px] font-semibold tracking-tight">
          {step === 1 ? "اختاري التاريخ" : "اختاري الفترة"}
        </h2>
        <p className="text-[13px] text-muted-ink mt-1">
          {step === 1
            ? `${monthNames[selectedDate.getMonth()]} ${arNum(selectedDate.getFullYear())}`
            : "كل فترة ٣ ساعات بسعر ثابت"}
        </p>
      </div>

      {step === 1 && (
        <div className="mt-6 overflow-x-auto px-5 -mx-5">
          <div className="flex gap-2 px-5">
            {days.map((d) => {
              const isSel = d.toDateString() === selectedDate.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={`tap shrink-0 w-[64px] h-[88px] rounded-2xl flex flex-col items-center justify-center border ease-soft ${
                    isSel
                      ? "bg-foreground text-background border-foreground shadow-pop"
                      : "border-hairline glass"
                  }`}
                >
                  <span className={`text-[10px] tracking-wider ${isSel ? "opacity-70" : "text-muted-ink"}`}>
                    {dayNames[d.getDay()].slice(0, 3)}
                  </span>
                  <span className="text-[24px] font-semibold mt-1">{arNum(d.getDate())}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="px-5 mt-6 space-y-3">
          {shifts.map((s) => {
            const isSel = s.id === selectedShift;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedShift(s.id)}
                className={`tap w-full text-right rounded-2xl border p-4 flex items-center gap-4 ease-soft ${
                  isSel ? "border-gold bg-gold/5 shadow-pop" : "border-hairline glass"
                }`}
              >
                <div
                  className={`h-12 w-12 rounded-xl grid place-items-center ${
                    isSel ? "bg-gradient-gold text-primary-foreground" : "bg-secondary text-foreground/70"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold">{s.label}</div>
                  <div className="text-[12px] text-muted-ink mt-0.5">{s.range} · ٣ ساعات</div>
                </div>
                <div className="text-left">
                  <div className={`text-[16px] font-semibold ${isSel ? "gold-gradient-text" : ""}`}>
                    {arNum(BOOKING_PRICE)}
                  </div>
                  <div className="text-[10px] text-muted-ink -mt-0.5">ر.س</div>
                </div>
              </button>
            );
          })}

          <div className="surface-card p-4 mt-2 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold/10 text-gold grid place-items-center">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">يتم اختيار الفريق المناسب تلقائياً</div>
              <div className="text-[11px] text-muted-ink mt-0.5">
                نختار من فريقنا المدرّب والموثّق بالكامل
              </div>
            </div>
            <SparkleFilled className="h-4 w-4 text-gold" />
          </div>

          <div className="surface-card p-4 flex items-center justify-between">
            <div>
              <div className="text-[12px] text-muted-ink">المجموع</div>
              <div className="text-[20px] font-semibold mt-0.5">{arNum(BOOKING_PRICE)} ر.س</div>
            </div>
            <div className="text-left">
              <div className="text-[12px] text-muted-ink">الفترة</div>
              <div className="text-[13px] font-semibold mt-0.5">{activeShift.range}</div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed md:absolute bottom-24 inset-x-0 z-40 px-5 pointer-events-none">
        <div className="mx-auto max-w-md pointer-events-auto">
          <button
            type="button"
            disabled={submitting || authLoading}
            onClick={() => {
              if (step < 2) setStep(2);
              else void confirmBooking();
            }}
            className="tap w-full h-14 rounded-2xl bg-gradient-gold text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting
              ? "جاري الحفظ..."
              : step < 2
                ? "متابعة"
                : `تأكيد الحجز · ${arNum(BOOKING_PRICE)} ر.س`}
            {!submitting && <ArrowLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
