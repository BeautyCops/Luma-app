import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star } from "lucide-react";
import { toast } from "sonner";

type Customer = { id: string; full_name: string | null; phone: string | null; created_at: string; bookings: number };
type Review = {
  id: string; rating: number; comment: string | null; created_at: string;
  worker: { name: string } | null;
  customer: { full_name: string | null } | null;
};

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: bookings }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
        supabase.from("bookings").select("customer_id"),
      ]);
      const counts: Record<string, number> = {};
      (bookings ?? []).forEach((b: any) => { counts[b.customer_id] = (counts[b.customer_id] || 0) + 1; });
      setCustomers((profiles ?? []).map((p: any) => ({ ...p, bookings: counts[p.id] || 0 })));

      const { data: r, error } = await supabase
        .from("reviews")
        .select(`id, rating, comment, created_at, worker:workers(name), customer:profiles!reviews_customer_id_fkey(full_name)`)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setReviews((r as any) ?? []);
    })();
  }, []);

  return (
    <>
      <PageHeader subtitle="إدارة" title="العملاء والتقييمات" />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-hairline overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline">
            <div className="font-medium">العملاء ({customers.length})</div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">الحجوزات</TableHead>
                <TableHead className="text-right">منذ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-ink py-12">لا يوجد عملاء بعد</TableCell></TableRow>
              ) : customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                  <TableCell className="text-sm">{c.phone || "—"}</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full text-xs bg-foreground/[0.05]">{c.bookings}</span></TableCell>
                  <TableCell className="text-xs text-muted-ink">{new Date(c.created_at).toLocaleDateString("ar")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="border-hairline overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline">
            <div className="font-medium">آخر التقييمات ({reviews.length})</div>
          </div>
          <div className="divide-y divide-hairline max-h-[600px] overflow-auto">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-muted-ink text-sm">لا توجد تقييمات بعد</div>
            ) : reviews.map((r) => (
              <div key={r.id} className="p-5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-gold text-gold" : "text-muted-ink/30"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-muted-ink">{new Date(r.created_at).toLocaleDateString("ar")}</div>
                </div>
                <div className="text-sm font-medium">{r.customer?.full_name || "عميل"} <span className="text-muted-ink font-normal">عن</span> {r.worker?.name || "—"}</div>
                {r.comment && <p className="text-sm text-muted-ink mt-1.5">{r.comment}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};
