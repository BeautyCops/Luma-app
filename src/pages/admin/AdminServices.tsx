import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_hours: number;
  active: boolean;
};

export const AdminServices = () => {
  const [rows, setRows] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name) { toast.error("الاسم مطلوب"); return; }
    const payload: any = {
      name: editing.name,
      description: editing.description || null,
      price: editing.price || 0,
      duration_hours: editing.duration_hours || 4,
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحفظ"); setOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذه الخدمة؟")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف"); load();
  };

  const toggleActive = async (s: Service) => {
    await supabase.from("services").update({ active: !s.active }).eq("id", s.id);
    load();
  };

  return (
    <>
      <PageHeader
        subtitle="إدارة"
        title="الخدمات"
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ active: true, duration_hours: 4 })}>
                <Plus className="h-4 w-4" /> إضافة خدمة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader><DialogTitle>{editing?.id ? "تعديل خدمة" : "خدمة جديدة"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>الاسم</Label><Input value={editing?.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>الوصف</Label><Textarea value={editing?.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>السعر (ر.س)</Label><Input type="number" value={editing?.price || ""} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} /></div>
                  <div><Label>المدة (ساعات)</Label><Input type="number" value={editing?.duration_hours || ""} onChange={(e) => setEditing({ ...editing, duration_hours: +e.target.value })} /></div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>نشطة</Label>
                  <Switch checked={editing?.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                </div>
                <Button onClick={save} className="w-full">حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((s) => (
          <Card key={s.id} className="p-5 border-hairline">
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold tracking-tight">{s.name}</div>
              <Switch checked={s.active} onCheckedChange={() => toggleActive(s)} />
            </div>
            {s.description && <p className="text-xs text-muted-ink mb-3 line-clamp-2">{s.description}</p>}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-semibold text-gold">{Number(s.price).toFixed(0)}</span>
              <span className="text-xs text-muted-ink">ر.س / {s.duration_hours} س</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(s); setOpen(true); }}>
                <Pencil className="h-3.5 w-3.5" /> تعديل
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(s.id)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};
