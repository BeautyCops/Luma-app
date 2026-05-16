/**
 * إدخال الخدمة والعاملات الافتراضية (مرة واحدة).
 * يتطلب SUPABASE_SERVICE_ROLE_KEY في .env
 * node scripts/seed-data.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";

function loadEnv() {
  const out = {};
  for (const file of [".env", ".env.production.local"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      out[k] = v;
    }
  }
  return out;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("أضيفي VITE_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY إلى .env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const WORKERS = [
  { name: "سارة", nationality: "فلبينية", age: 32, bio: "خبرة في التنظيف والترتيب المنزلي", hourly_rate: 45, rating: 4.9, status: "available" },
  { name: "مريم", nationality: "إندونيسية", age: 28, bio: "متخصصة في العناية بالمنزل والمطبخ", hourly_rate: 45, rating: 4.8, status: "available" },
  { name: "أمنة", nationality: "إثيوبية", age: 30, bio: "دقة في التفاصيل وخدمة ممتازة", hourly_rate: 45, rating: 4.9, status: "available" },
  { name: "روز", nationality: "فلبينية", age: 29, bio: "خبرة مع العائلات والأطفال", hourly_rate: 45, rating: 4.7, status: "available" },
  { name: "سيتي", nationality: "إندونيسية", age: 27, bio: "تنظيم وترتيب احترافي", hourly_rate: 45, rating: 4.8, status: "busy" },
  { name: "هاجر", nationality: "إثيوبية", age: 31, bio: "سرعة وإتقان في أعمال المنزل", hourly_rate: 45, rating: 4.9, status: "available" },
];

const { data: existingWorkers } = await admin.from("workers").select("name");
const existingNames = new Set((existingWorkers ?? []).map((w) => w.name));
const toInsert = WORKERS.filter((w) => !existingNames.has(w.name));

if (toInsert.length) {
  const { error } = await admin.from("workers").insert(toInsert);
  if (error) {
    console.error("workers insert:", error.message);
    process.exit(1);
  }
  console.log("تم إضافة", toInsert.length, "عاملة");
} else {
  console.log("العاملات موجودة مسبقاً:", existingWorkers?.length ?? 0);
}

const { data: services } = await admin.from("services").select("id").limit(1);
if (!services?.length) {
  const { error } = await admin.from("services").insert({
    name: "عاملة منزلية بالساعة",
    description: "خدمة مرنة حسب وقتك",
    price: 90,
    duration_hours: 3,
    icon: "home",
    active: true,
  });
  if (error) {
    console.error("services insert:", error.message);
    process.exit(1);
  }
  console.log("تم إضافة الخدمة الافتراضية");
} else {
  console.log("الخدمة موجودة");
}

const { count } = await admin.from("workers").select("id", { count: "exact", head: true });
const { count: bc } = await admin.from("bookings").select("id", { count: "exact", head: true });
console.log("إجمالي العاملات:", count ?? 0, "| الحجوزات:", bc ?? 0);
