import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type AppUser = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: string;
  bookings: number;
};

const roleLabel: Record<string, string> = {
  admin: "مدير",
  user: "عميل",
};

export const AdminUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }, { data: bookings, error: bErr }] =
        await Promise.all([
          supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
          supabase.from("user_roles").select("user_id, role"),
          supabase.from("bookings").select("customer_id"),
        ]);

      if (pErr) toast.error(pErr.message);
      if (rErr) toast.error(rErr.message);
      if (bErr) toast.error(bErr.message);

      const roleMap: Record<string, string> = {};
      (roles ?? []).forEach((r: { user_id: string; role: string }) => {
        roleMap[r.user_id] = r.role;
      });

      const bookingCounts: Record<string, number> = {};
      (bookings ?? []).forEach((b: { customer_id: string }) => {
        bookingCounts[b.customer_id] = (bookingCounts[b.customer_id] || 0) + 1;
      });

      setUsers(
        (profiles ?? []).map((p: { id: string; full_name: string | null; phone: string | null; created_at: string }) => ({
          ...p,
          role: roleMap[p.id] || "user",
          bookings: bookingCounts[p.id] || 0,
        })),
      );
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <PageHeader subtitle="إدارة" title="المستخدمون" />

      <Card className="border-hairline overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
          <div className="font-medium">كل الحسابات ({users.length})</div>
          <span className="text-xs text-muted-ink">من جدول profiles و user_roles</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الجوال</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">الحجوزات</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-ink py-12">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-ink py-12">
                  لا يوجد مستخدمون بعد
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-sm">{u.phone || "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        u.role === "admin"
                          ? "bg-gold/15 text-gold ring-1 ring-gold/30"
                          : "bg-foreground/[0.05]"
                      }`}
                    >
                      {roleLabel[u.role] || u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-foreground/[0.05]">{u.bookings}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-ink">
                    {new Date(u.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
};
