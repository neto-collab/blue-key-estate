import { useEffect, useState } from "react";
import { Loader2, UserPlus, Mail, Phone, Award } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { BrokerPageHeader } from "@/components/broker/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BRAND } from "@/lib/constants";

const schema = z.object({
  full_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(120),
  email: z.string().trim().email("E-mail inválido").max(180),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  creci: z.string().trim().max(40).optional().or(z.literal("")),
});

type Broker = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  creci: string | null;
  created_at: string;
  is_admin?: boolean;
  property_count?: number;
};

const AdminBrokers = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: "",
    creci: "",
  });

  useEffect(() => {
    document.title = `Corretores — ${BRAND.name}`;
  }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: props }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("properties").select("broker_id"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    const counts = new Map<string, number>();
    (props ?? []).forEach((p) => counts.set(p.broker_id, (counts.get(p.broker_id) ?? 0) + 1));
    setBrokers(
      (profiles ?? []).map((p) => ({
        ...p,
        is_admin: adminIds.has(p.id),
        property_count: counts.get(p.id) ?? 0,
      })) as Broker[]
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("create-broker", {
      body: parsed.data,
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Erro ao criar corretor");
      return;
    }
    toast.success("Corretor criado com sucesso");
    setOpen(false);
    setForm({ full_name: "", email: "", password: "", phone: "", whatsapp: "", creci: "" });
    load();
  };

  return (
    <div className="space-y-6">
      <BrokerPageHeader
        title="Corretores"
        description="Gerencie as contas dos corretores da imobiliária"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" /> Novo corretor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Cadastrar corretor</DialogTitle>
                <DialogDescription>
                  A senha é definida agora e pode ser alterada pelo corretor depois.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Nome completo *</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Mín. 8 caracteres"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      placeholder="5511999999999"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creci">CRECI</Label>
                  <Input
                    id="creci"
                    value={form.creci}
                    onChange={(e) => setForm({ ...form, creci: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar corretor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-xl bg-card border border-border shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : brokers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Nenhum corretor cadastrado.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden lg:table-cell">CRECI</TableHead>
                <TableHead className="text-center">Imóveis</TableHead>
                <TableHead className="text-right">Função</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brokers.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium text-primary">{b.full_name || "(sem nome)"}</div>
                    <div className="text-xs text-muted-foreground md:hidden flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" /> {b.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" /> {b.email}
                    </div>
                    {b.phone && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" /> {b.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {b.creci ? (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Award className="h-3 w-3 text-muted-foreground" /> {b.creci}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-medium">{b.property_count}</TableCell>
                  <TableCell className="text-right">
                    {b.is_admin ? (
                      <Badge className="bg-secondary">Admin</Badge>
                    ) : (
                      <Badge variant="outline">Corretor</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminBrokers;
