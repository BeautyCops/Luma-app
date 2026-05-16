import { supabase } from "@/integrations/supabase/client";

const PRICE = 90;
const HOURS = 3;

export type CreateBookingInput = {
  bookingDate: Date;
  bookingTime: string;
  shiftLabel?: string;
};

export type CreateBookingResult =
  | { ok: true; id: string }
  | { ok: false; code: "not_signed_in" | "no_service" | "db_error"; message: string };

function toDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getDefaultServiceId(): Promise<string | null> {
  const { data } = await supabase
    .from("services")
    .select("id")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

async function pickAvailableWorkerId(): Promise<string | null> {
  const { data } = await supabase
    .from("workers")
    .select("id")
    .eq("status", "available")
    .order("rating", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "not_signed_in", message: "سجّلي الدخول لإتمام الحجز" };
  }

  const serviceId = await getDefaultServiceId();
  if (!serviceId) {
    return { ok: false, code: "no_service", message: "الخدمة غير متوفرة حالياً" };
  }

  const workerId = await pickAvailableWorkerId();

  const notes = input.shiftLabel ? `الفترة: ${input.shiftLabel}` : null;

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      service_id: serviceId,
      worker_id: workerId,
      booking_date: toDateString(input.bookingDate),
      booking_time: input.bookingTime,
      hours: HOURS,
      total_price: PRICE,
      status: "pending",
      notes,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, code: "db_error", message: error.message };
  }

  return { ok: true, id: data.id };
}

export { PRICE as BOOKING_PRICE, HOURS as BOOKING_HOURS };
