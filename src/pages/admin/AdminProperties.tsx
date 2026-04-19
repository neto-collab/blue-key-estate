import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrokerPageHeader } from "@/components/broker/BrokerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceWithSuffix, labelForType, labelForPurpose, BRAND } from "@/lib/constants";

const AdminProperties = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Todos os imóveis — ${BRAND.name}`;
  }, []);

  useEffect(() => {
    const load = async () => {
      const [{ data: props }, { data: profs }] = await Promise.all([
        supabase
          .from("properties")
          .select("id,title,city,neighborhood,type,purpose,price,status,broker_id,cover_image,created_at")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name"),
      ]);
      const byId = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
      setItems((props ?? []).map((p) => ({ ...p, broker_name: byId.get(p.broker_id) ?? "—" })));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <BrokerPageHeader
        title="Todos os imóveis"
        description="Visão consolidada de todos os imóveis cadastrados na imobiliária"
      />

      <div className="rounded-xl bg-card border border-border shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Nenhum imóvel cadastrado ainda.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imóvel</TableHead>
                <TableHead className="hidden md:table-cell">Corretor</TableHead>
                <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        {p.cover_image && <img src={p.cover_image} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-primary truncate max-w-[220px]">{p.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.neighborhood}, {p.city}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{p.broker_name}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {labelForType(p.type)} • {labelForPurpose(p.purpose)}
                  </TableCell>
                  <TableCell className="font-semibold text-secondary">
                    {formatPriceWithSuffix(Number(p.price), p.purpose)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="capitalize">
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/imoveis/${p.id}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
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

export default AdminProperties;
