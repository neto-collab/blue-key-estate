import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MessageCircle, Mail, Phone, Trash2, ExternalLink, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { BrokerPageHeader } from "@/components/broker/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { BRAND } from "@/lib/constants";

type LeadStatus = "novo" | "em_atendimento" | "finalizado";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  message: string | null;
  status: LeadStatus;
  created_at: string;
  property_id: string | null;
  broker_id: string;
  property_title?: string;
  broker_name?: string;
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  finalizado: "Finalizado",
};

const STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "outline"> = {
  novo: "default",
  em_atendimento: "secondary",
  finalizado: "outline",
};

const Leads = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | "todos">("todos");

  useEffect(() => {
    document.title = `Leads — ${BRAND.name}`;
  }, []);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    const propIds = Array.from(new Set((rows ?? []).map((r) => r.property_id).filter(Boolean) as string[]));
    const brokerIds = Array.from(new Set((rows ?? []).map((r) => r.broker_id)));

    const [{ data: props }, { data: profs }] = await Promise.all([
      propIds.length
        ? supabase.from("properties").select("id, title").in("id", propIds)
        : Promise.resolve({ data: [] as any[] }),
      brokerIds.length
        ? supabase.from("profiles").select("id, full_name").in("id", brokerIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const propMap = new Map((props ?? []).map((p: any) => [p.id, p.title]));
    const brokerMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));

    setLeads(
      (rows ?? []).map((r) => ({
        ...r,
        property_title: r.property_id ? propMap.get(r.property_id) ?? "—" : "—",
        broker_name: brokerMap.get(r.broker_id) ?? "—",
      })) as Lead[]
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success("Status atualizado");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir lead");
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success("Lead excluído");
  };

  const filtered = filter === "todos" ? leads : leads.filter((l) => l.status === filter);

  const counts = {
    novo: leads.filter((l) => l.status === "novo").length,
    em_atendimento: leads.filter((l) => l.status === "em_atendimento").length,
    finalizado: leads.filter((l) => l.status === "finalizado").length,
  };

  return (
    <div className="space-y-6">
      <BrokerPageHeader
        title="Leads"
        description={
          isAdmin
            ? "Todos os contatos recebidos pela imobiliária"
            : "Contatos recebidos pelos seus imóveis"
        }
      />

      <div className="grid gap-4 grid-cols-3">
        {(["novo", "em_atendimento", "finalizado"] as LeadStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s === filter ? "todos" : s)}
            className={`rounded-xl bg-card border p-4 text-left transition-smooth ${
              filter === s ? "border-secondary shadow-soft" : "border-border hover:border-secondary/40"
            }`}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{STATUS_LABEL[s]}</p>
            <p className="text-2xl font-display font-bold text-primary mt-1">{counts[s]}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtro: <span className="font-medium text-primary capitalize">{filter === "todos" ? "Todos" : STATUS_LABEL[filter as LeadStatus]}</span>
          </div>
          {filter !== "todos" && (
            <Button variant="ghost" size="sm" onClick={() => setFilter("todos")}>
              Limpar
            </Button>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {leads.length === 0 ? "Nenhum lead recebido ainda." : "Nenhum lead nesta categoria."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contato</TableHead>
                <TableHead className="hidden md:table-cell">Imóvel</TableHead>
                {isAdmin && <TableHead className="hidden lg:table-cell">Corretor</TableHead>}
                <TableHead className="hidden sm:table-cell">Recebido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => {
                const waNumber = l.phone.replace(/\D/g, "");
                const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                  `Olá ${l.name}! Sou da ${BRAND.name} e recebi seu contato sobre o imóvel.`
                )}`;
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="font-medium text-primary">{l.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {l.phone}
                      </div>
                      {l.email && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {l.email}
                        </div>
                      )}
                      {l.message && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xs italic">
                          "{l.message}"
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {l.property_id ? (
                        <Link
                          to={`/imoveis/${l.property_id}`}
                          target="_blank"
                          className="text-secondary hover:underline inline-flex items-center gap-1"
                        >
                          {l.property_title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{l.property_title}</span>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="hidden lg:table-cell text-sm">{l.broker_name}</TableCell>
                    )}
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as LeadStatus)}>
                        <SelectTrigger className="w-[150px] h-8">
                          <Badge variant={STATUS_VARIANT[l.status]} className="text-[10px]">
                            {STATUS_LABEL[l.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {(["novo", "em_atendimento", "finalizado"] as LeadStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title="WhatsApp">
                          <a href={waLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 text-[#25D366]" />
                          </a>
                        </Button>
                        {l.email && (
                          <Button asChild variant="ghost" size="icon" title="E-mail">
                            <a href={`mailto:${l.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Excluir">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação removerá o contato de {l.name} permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(l.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Leads;
