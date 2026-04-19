import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, X, Star } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BrokerPageHeader } from "@/components/broker/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_TYPES, PROPERTY_PURPOSES, PROPERTY_STATUSES, BRAND } from "@/lib/constants";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().trim().min(3, "Título obrigatório").max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(["casa", "apartamento", "terreno", "comercial", "rural"]),
  purpose: z.enum(["venda", "aluguel"]),
  status: z.enum(["disponivel", "reservado", "vendido", "alugado"]),
  price: z.number().positive("Preço inválido"),
  city: z.string().trim().min(2).max(100),
  neighborhood: z.string().trim().min(2).max(100),
  address: z.string().max(255).optional(),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  garages: z.number().int().min(0).max(50),
  area: z.number().min(0).max(1000000).optional(),
  featured: z.boolean(),
});

interface ImageItem { id?: string; url: string; storage_path?: string | null; isCover: boolean; }

const PropertyForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", type: "casa", purpose: "venda", status: "disponivel",
    price: "", city: "", neighborhood: "", address: "",
    bedrooms: "0", bathrooms: "0", garages: "0", area: "",
    featured: false,
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => { document.title = `${isEdit ? "Editar" : "Novo"} imóvel — ${BRAND.name}`; }, [isEdit]);

  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      const { data } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (!data) { toast.error("Imóvel não encontrado"); navigate("/corretor/imoveis"); return; }
      setForm({
        title: data.title, description: data.description ?? "", type: data.type, purpose: data.purpose,
        status: data.status, price: String(data.price), city: data.city, neighborhood: data.neighborhood,
        address: data.address ?? "", bedrooms: String(data.bedrooms ?? 0), bathrooms: String(data.bathrooms ?? 0),
        garages: String(data.garages ?? 0), area: data.area ? String(data.area) : "", featured: data.featured,
      });
      const { data: imgs } = await supabase.from("property_images").select("*").eq("property_id", id).order("position");
      setImages((imgs ?? []).map((i: any) => ({ id: i.id, url: i.url, storage_path: i.storage_path, isCover: i.url === data.cover_image })));
      setLoading(false);
    };
    load();
  }, [isEdit, id, navigate]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    try {
      const uploaded: ImageItem[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("property-images").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("property-images").getPublicUrl(path);
        uploaded.push({ url: pub.publicUrl, storage_path: path, isCover: false });
      }
      setImages((prev) => {
        const next = [...prev, ...uploaded];
        if (!next.some((i) => i.isCover) && next.length > 0) next[0].isCover = true;
        return next;
      });
      toast.success(`${uploaded.length} imagem(ns) enviada(s)`);
    } catch (e: any) {
      toast.error("Erro no upload: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (idx: number) => {
    const img = images[idx];
    if (img.id) {
      await supabase.from("property_images").delete().eq("id", img.id);
      if (img.storage_path) await supabase.storage.from("property-images").remove([img.storage_path]);
    }
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (img.isCover && next.length > 0) next[0].isCover = true;
      return next;
    });
  };

  const setCover = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isCover: i === idx })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = schema.safeParse({
      title: form.title, description: form.description || undefined, type: form.type as any,
      purpose: form.purpose as any, status: form.status as any, price: Number(form.price),
      city: form.city, neighborhood: form.neighborhood, address: form.address || undefined,
      bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), garages: Number(form.garages),
      area: form.area ? Number(form.area) : undefined, featured: form.featured,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSaving(true);
    try {
      const cover = images.find((i) => i.isCover)?.url ?? images[0]?.url ?? null;
      const payload = { ...parsed.data, broker_id: user.id, cover_image: cover };

      let propId = id;
      if (isEdit) {
        const { error } = await supabase.from("properties").update(payload).eq("id", id!);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("properties").insert([payload]).select("id").single();
        if (error) throw error;
        propId = data.id;
      }

      // Sync new images (without id)
      const newImgs = images.filter((i) => !i.id).map((i, idx) => ({
        property_id: propId!, url: i.url, storage_path: i.storage_path ?? null, position: idx,
      }));
      if (newImgs.length > 0) {
        const { error: imgErr } = await supabase.from("property_images").insert(newImgs);
        if (imgErr) throw imgErr;
      }

      toast.success(isEdit ? "Imóvel atualizado" : "Imóvel cadastrado");
      navigate("/corretor/imoveis");
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <Link to="/corretor/imoveis" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <BrokerPageHeader title={isEdit ? "Editar imóvel" : "Novo imóvel"} description="Preencha os dados do imóvel" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Informações principais">
          <Field label="Título*" className="md:col-span-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
          </Field>
          <Field label="Tipo*">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Finalidade*">
            <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROPERTY_PURPOSES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Preço (R$)*">
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </Field>
          <Field label="Status*">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROPERTY_STATUSES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Descrição" className="md:col-span-2">
            <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={5000} />
          </Field>
        </Section>

        <Section title="Localização">
          <Field label="Cidade*"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required maxLength={100} /></Field>
          <Field label="Bairro*"><Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} required maxLength={100} /></Field>
          <Field label="Endereço" className="md:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={255} /></Field>
        </Section>

        <Section title="Características">
          <Field label="Quartos"><Input type="number" min={0} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} /></Field>
          <Field label="Banheiros"><Input type="number" min={0} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} /></Field>
          <Field label="Garagens"><Input type="number" min={0} value={form.garages} onChange={(e) => setForm({ ...form, garages: e.target.value })} /></Field>
          <Field label="Área (m²)"><Input type="number" step="0.01" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></Field>
          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <Switch id="featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            <Label htmlFor="featured" className="cursor-pointer">Imóvel em destaque na home</Label>
          </div>
        </Section>

        <Section title="Imagens">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border-2 border-border">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {img.isCover && (
                    <div className="absolute top-1 left-1 bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">CAPA</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2">
                    {!img.isCover && (
                      <button type="button" onClick={() => setCover(idx)} className="bg-background text-foreground p-1.5 rounded" title="Definir como capa">
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(idx)} className="bg-destructive text-destructive-foreground p-1.5 rounded" title="Remover">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <label className="aspect-square rounded-md border-2 border-dashed border-border hover:border-secondary hover:bg-accent/30 transition-smooth flex flex-col items-center justify-center cursor-pointer text-center p-2">
                {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground mt-2">Adicionar fotos</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">A primeira imagem ou a marcada como CAPA será exibida nos cards.</p>
          </div>
        </Section>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/corretor/imoveis")}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Salvar alterações" : "Cadastrar imóvel"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl bg-card border border-border p-6 shadow-soft">
    <h2 className="font-display text-lg font-semibold text-primary mb-4">{title}</h2>
    <div className="grid gap-4 md:grid-cols-2">{children}</div>
  </div>
);

const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    <Label>{label}</Label>
    {children}
  </div>
);

export default PropertyForm;
