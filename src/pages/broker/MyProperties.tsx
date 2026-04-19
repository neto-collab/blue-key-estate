import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BrokerPageHeader, NewPropertyButton } from "@/components/broker/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPriceWithSuffix, labelForType, BRAND } from "@/lib/constants";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyProperties = () => {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = `Meus imóveis — ${BRAND.name}`; }, []);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("broker_id", user.id)
      .order("created_at", { ascending: false });
    setList(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir: " + error.message);
    else { toast.success("Imóvel excluído"); load(); }
  };

  return (
    <div className="space-y-8">
      <BrokerPageHeader
        title="Meus imóveis"
        description="Gerencie todos os seus imóveis cadastrados"
        action={<NewPropertyButton />}
      />

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <p className="text-lg font-medium text-primary mb-2">Nenhum imóvel cadastrado</p>
          <p className="text-sm text-muted-foreground mb-6">Comece a anunciar agora.</p>
          <Button asChild><Link to="/corretor/imoveis/novo"><Plus className="h-4 w-4 mr-2" /> Cadastrar imóvel</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl bg-card border border-border shadow-soft p-4 flex flex-col sm:flex-row gap-4">
              <div className="h-24 w-full sm:w-32 rounded-md bg-muted overflow-hidden flex-shrink-0">
                {p.cover_image && <img src={p.cover_image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline">{p.status}</Badge>
                  <Badge variant="secondary">{labelForType(p.type)}</Badge>
                </div>
                <p className="font-display font-semibold text-primary truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.neighborhood}, {p.city}</p>
                <p className="text-secondary font-bold mt-1">{formatPriceWithSuffix(Number(p.price), p.purpose)}</p>
              </div>
              <div className="flex sm:flex-col gap-2 sm:justify-center">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/corretor/imoveis/${p.id}/editar`}><Pencil className="h-3.5 w-3.5 mr-1" /> Editar</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
                      <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
