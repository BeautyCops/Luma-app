import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

type Worker = {
  id: string;
  name: string;
  age: number | null;
  nationality: string | null;
  rating: number;
  hourly_rate: number;
  status: "available" | "busy" | "inactive";
  bio: string | null;
};

const STATUS_AR = { available: "متاحة", busy: "مشغولة", inactive: "غير نشطة" };

export const AdminWorkers = () => {
  const [rows, setRows] = useState<Worker[]>([]);
  const [editing, setEditing] = useState<Partial<Worker> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("workers").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as any) ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name) { toast.error("الاسم مطلوب"); return; }
    const payload: any = {
      name: editing.name,
      age: editing.age || null,
      nationality: editing.nationality || null,
      hourly_rate: editing.hourly_rate || 50,
      status: editing.status || "available",
      bio: editing.bio || null,
    };
    const { error } = editing.id
      ? await supabase.from("workers").update(payload).eq("id", editing.id)
      : await supabase.from("workers").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحفظ");
    setOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذه العاملة؟")) return;
    const { error } = await supabase.from("workers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف"); load();
  };

  return (
    <>
      <PageHeader
        subtitle="إدارة"
        title="العاملات"
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ status: "available", hourly_rate: 50 })}>
                <Plus className="h-4 w-4" /> إضافة عاملة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader><DialogTitle>{editing?.id ? "تعديل عاملة" : "عاملة جديدة"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>الاسم</Label><Input value={editing?.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                  <div><Label>العمر</Label><Input type="number" value={editing?.age || ""} onChange={(e) => setEditing({ ...editing, age: +e.target.value })} /></div>
                  <div><Label>الجنسية</Label><Input value={editing?.nationality || ""} onChange={(e) => setEditing({ ...editing, nationality: e.target.value })} /></div>
                  <div><Label>الأجرة/ساعة</Label><Input type="number" value={editing?.hourly_rate || ""} onChange={(e) => setEditing({ ...editing, hourly_rate: +e.target.value })} /></div>
                </div>
                <div><Label>الحالة</Label>
                  <Select value={editing?.status || "available"} onValueChange={(v: any) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_AR).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>نبذة</Label><Textarea value={editing?.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} /></div>
                <Button onClick={save} className="w-full">حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rows.map((w) => (
          <Card key={w.id} className="p-5 border-hairline">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold tracking-tight">{w.name}</div>
                <div className="text-xs text-muted-ink mt-0.5">{w.nationality} {w.age ? `• ${w.age} سنة` : ""}</div>
              </div>
              <Badge className={
                w.status === "available" ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30" :
                w.status === "busy" ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/30" :
                "bg-muted text-muted-ink"
              }>{STATUS_AR[w.status]}</Badge>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="font-medium">{Number(w.rating).toFixed(1)}</span>
              <span className="text-muted-ink mx-2">•</span>
              <span className="text-muted-ink">{Number(w.hourly_rate).toFixed(0)} ر.س/س</span>
            </div>
            {w.bio && <p className="text-xs text-muted-ink mt-3 line-clamp-2">{w.bio}</p>}
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(w); setOpen(true); }}>
                <Pencil className="h-3.5 w-3.5" /> تعديل
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(w.id)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};
