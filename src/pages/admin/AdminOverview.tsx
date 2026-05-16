import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { CalendarCheck, Users, Briefcase, DollarSign, Star, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

type Stats = {
  bookings: number;
  workers: number;
  services: number;
  customers: number;
  revenue: number;
  avgRating: number;
};

const StatCard = ({ icon: Icon, label, value, accent }: any) => (
  <Card className="p-5 border-hairline">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-ink">{label}</div>
        <div className="text-2xl lg:text-3xl font-semibold tracking-tight mt-2">{value}</div>
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </Card>
);

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(45 90% 55%)",
  confirmed: "hsl(210 90% 55%)",
  in_progress: "hsl(280 70% 60%)",
  completed: "hsl(140 60% 45%)",
  cancelled: "hsl(0 70% 55%)",
};
const STATUS_AR: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  in_progress: "جاري",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({ bookings: 0, workers: 0, services: 0, customers: 0, revenue: 0, avgRating: 0 });
  const [statusData, setStatusData] = useState<{ name: string; value: number; key: string }[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; bookings: number; revenue: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [b, w, s, p, r] = await Promise.all([
        supabase.from("bookings").select("status,total_price,created_at"),
        supabase.from("workers").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("rating"),
      ]);

      const bookings = b.data ?? [];
      const totalRev = bookings
        .filter((x: any) => x.status === "completed")
        .reduce((sum: number, x: any) => sum + Number(x.total_price || 0), 0);

      const ratings = (r.data ?? []).map((x: any) => x.rating);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      setStats({
        bookings: bookings.length,
        workers: w.count ?? 0,
        services: s.count ?? 0,
        customers: p.count ?? 0,
        revenue: totalRev,
        avgRating,
      });

      // Status breakdown
      const counts: Record<string, number> = {};
      bookings.forEach((x: any) => { counts[x.status] = (counts[x.status] || 0) + 1; });
      setStatusData(Object.entries(counts).map(([key, value]) => ({ key, name: STATUS_AR[key] || key, value })));

      // Monthly aggregation (last 6 months)
      const now = new Date();
      const months: { month: string; bookings: number; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("ar", { month: "short" });
        const matching = bookings.filter((x: any) => {
          const dt = new Date(x.created_at);
          return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
        });
        months.push({
          month: label,
          bookings: matching.length,
          revenue: matching.filter((m: any) => m.status === "completed").reduce((s: number, m: any) => s + Number(m.total_price || 0), 0),
        });
      }
      setMonthly(months);
    })();
  }, []);

  return (
    <>
      <PageHeader subtitle="لوحة التحكم" title="نظرة عامة" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        <StatCard icon={CalendarCheck} label="إجمالي الحجوزات" value={stats.bookings} accent="bg-blue-500/10 text-blue-500" />
        <StatCard icon={DollarSign} label="الإيرادات" value={`${stats.revenue.toFixed(0)} ر.س`} accent="bg-emerald-500/10 text-emerald-500" />
        <StatCard icon={Users} label="العاملات" value={stats.workers} accent="bg-amber-500/10 text-amber-500" />
        <StatCard icon={Briefcase} label="الخدمات" value={stats.services} accent="bg-purple-500/10 text-purple-500" />
        <StatCard icon={TrendingUp} label="العملاء" value={stats.customers} accent="bg-pink-500/10 text-pink-500" />
        <StatCard icon={Star} label="متوسط التقييم" value={stats.avgRating.toFixed(1)} accent="bg-gold/10 text-gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="p-5 lg:col-span-2 border-hairline">
          <div className="text-sm font-medium mb-4">النمو الشهري (6 أشهر)</div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--hairline))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-ink))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-ink))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--hairline))", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="bookings" name="الحجوزات" stroke="hsl(210 90% 55%)" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue" name="الإيرادات" stroke="hsl(45 90% 55%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 border-hairline">
          <div className="text-sm font-medium mb-4">توزيع الحجوزات</div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {statusData.map((d) => <Cell key={d.key} fill={STATUS_COLORS[d.key] || "hsl(var(--gold))"} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--hairline))", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 mt-6 border-hairline">
        <div className="text-sm font-medium mb-4">إيرادات شهرية</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--hairline))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-ink))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-ink))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--hairline))", borderRadius: 12 }} />
              <Bar dataKey="revenue" name="الإيرادات (ر.س)" fill="hsl(45 90% 55%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
};
