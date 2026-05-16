import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Booking = {
  id: string;
  booking_date: string;
  hours: number;
  total_price: number;
  status: string;
  address: string | null;
  notes: string | null;
  created_at: string;
  worker: { name: string } | null;
  service: { name: string } | null;
  customer: { full_name: string | null; phone: string | null } | null;
};

const STATUS_AR: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  in_progress: "جاري",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const STATUS_VARIANT: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 ring-amber-500/30",
  confirmed: "bg-blue-500/10 text-blue-600 ring-blue-500/30",
  in_progress: "bg-purple-500/10 text-purple-600 ring-purple-500/30",
  completed: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30",
  cancelled: "bg-red-500/10 text-red-600 ring-red-500/30",
};

export const AdminBookings = () => {
  const [rows, setRows] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, booking_date, hours, total_price, status, address, notes, created_at,
        worker:workers(name),
        service:services(name),
        customer:profiles!bookings_customer_id_fkey(full_name, phone)
      `)
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRows((data as any) ?? []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم التحديث");
    load();
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <>
      <PageHeader
        subtitle="إدارة"
        title="الحجوزات"
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {Object.entries(STATUS_AR).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <Card className="border-hairline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الخدمة</TableHead>
              <TableHead className="text-right">العاملة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الساعات</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-ink py-12">لا توجد حجوزات</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium">{r.customer?.full_name || "—"}</div>
                  <div className="text-xs text-muted-ink">{r.customer?.phone || ""}</div>
                </TableCell>
                <TableCell>{r.service?.name || "—"}</TableCell>
                <TableCell>{r.worker?.name || "—"}</TableCell>
                <TableCell className="text-sm">{r.booking_date}</TableCell>
                <TableCell>{r.hours}</TableCell>
                <TableCell className="font-medium">{Number(r.total_price).toFixed(0)} ر.س</TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                    <SelectTrigger className={`w-36 h-8 text-xs ring-1 ${STATUS_VARIANT[r.status] || ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_AR).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
};
