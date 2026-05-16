import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, SparkleFilled } from "./icons";
import { ContactSheet } from "./ContactSheet";

type BookingRow = {
  id: string;
  booking_date: string;
  booking_time: string | null;
  hours: number;
  status: string;
  total_price: number;
  service: { name: string } | null;
};

const statusLabel: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  in_progress: "جارية",
  completed: "مكتمل",
  cancelled: "ملغى",
};

const arNum = (n: number) => n.toLocaleString("ar-EG");

function formatBookingDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" });
}

function formatTime(time: string | null) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const hour12 = h % 12 || 12;
  return `${arNum(hour12)}:${m.toString().padStart(2, "0")} ${period}`;
}

type BookingsScreenProps = {
  onBook: () => void;
};

export const BookingsScreen = ({ onBook }: BookingsScreenProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_date, booking_time, hours, status, total_price, service:services(name)")
        .eq("customer_id", user.id)
        .order("booking_date", { ascending: false });

      if (error) {
        console.warn("[Lumen] bookings:", error.message);
        setBookings([]);
      } else {
        setBookings((data as BookingRow[]) ?? []);
      }
      setLoading(false);
    })();
  }, [user, authLoading]);

  const upcoming = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const demoBooking: BookingRow = {
    id: "demo",
    booking_date: new Date().toISOString().slice(0, 10),
    booking_time: "10:00",
    hours: 3,
    status: "confirmed",
    total_price: 90,
    service: { name: "عاملة منزلية بالساعة" },
  };

  const showDemo = !user && !authLoading;
  const upcomingList = showDemo ? [demoBooking] : upcoming;
  const pastList = showDemo ? [] : past;

  return (
    <div className="pb-32 space-y-6">
      <div className="px-5 pt-2">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">حجوزاتي</div>
        <h2 className="text-[26px] font-semibold tracking-tight">رحلتك مع لومن</h2>
      </div>

      {!user && !authLoading && (
        <div className="px-5">
          <div className="surface-card p-4 text-center">
            <p className="text-[13px] text-muted-ink mb-3">سجّلي الدخول لمتابعة حجوزاتك</p>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="tap h-11 px-6 rounded-xl bg-foreground text-background text-[13px] font-semibold"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      )}

      <div className="px-5">
        <div className="text-[12px] text-muted-ink mb-3">القادم</div>
        {loading ? (
          <div className="surface-card p-8 text-center text-[13px] text-muted-ink">جاري التحميل...</div>
        ) : upcomingList.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <p className="text-[13px] text-muted-ink mb-4">لا توجد حجوزات قادمة</p>
            {user && (
              <button
                type="button"
                onClick={onBook}
                className="tap h-11 px-6 rounded-xl bg-gradient-gold text-primary-foreground text-[13px] font-semibold"
              >
                احجزي الآن
              </button>
            )}
          </div>
        ) : (
          upcomingList.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onEdit={onBook}
              onContact={() => setContactOpen(true)}
            />
          ))
        )}
      </div>

      {(pastList.length > 0 || showDemo) && (
        <div className="px-5">
          <div className="text-[12px] text-muted-ink mb-3">سابقاً</div>
          {pastList.length === 0 && showDemo ? (
            <div className="surface-card p-4 flex items-center gap-3 opacity-80">
              <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center text-muted-ink">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold">عاملة منزلية بالساعة</div>
                <div className="text-[11px] text-muted-ink mt-0.5">مثال — بعد تسجيل الدخول تظهر حجوزاتك</div>
              </div>
              <div className="text-[11px] text-gold">مكتمل</div>
            </div>
          ) : (
            pastList.map((b) => (
              <div key={b.id} className="surface-card p-4 flex items-center gap-3 opacity-80 mb-2">
                <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center text-muted-ink">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">{b.service?.name || "خدمة منزلية"}</div>
                  <div className="text-[11px] text-muted-ink mt-0.5">
                    {formatBookingDate(b.booking_date)} • {arNum(b.hours)} ساعات
                  </div>
                </div>
                <div className="text-[11px] text-gold">{statusLabel[b.status] || b.status}</div>
              </div>
            ))
          )}
        </div>
      )}

      <ContactSheet open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

function BookingCard({
  booking,
  onEdit,
  onContact,
}: {
  booking: BookingRow;
  onEdit: () => void;
  onContact: () => void;
}) {
  return (
    <div className="surface-card p-5 relative overflow-hidden mb-3">
      <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-gold grid place-items-center shadow-glow">
          <SparkleFilled className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold">{booking.service?.name || "عاملة منزلية بالساعة"}</div>
          <div className="text-[11.5px] text-muted-ink mt-1">{statusLabel[booking.status] || booking.status}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11.5px]">
              <Calendar className="h-3.5 w-3.5" />
              {formatBookingDate(booking.booking_date)}
            </span>
            {booking.booking_time && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11.5px]">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(booking.booking_time)} • {arNum(booking.hours)} ساعات
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="tap h-11 rounded-xl border border-hairline text-[13px] font-medium hover:bg-foreground/[0.03]"
        >
          تعديل
        </button>
        <button
          type="button"
          onClick={onContact}
          className="tap h-11 rounded-xl bg-foreground text-background text-[13px] font-semibold"
        >
          تواصل
        </button>
      </div>
    </div>
  );
}
