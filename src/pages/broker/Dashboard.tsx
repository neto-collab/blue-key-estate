import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Plus, TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BrokerPageHeader, NewPropertyButton } from "@/components/broker/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPriceWithSuffix, labelForType } from "@/lib/constants";
import { BRAND } from "@/lib/constants";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => { document.title = `Dashboard — ${BRAND.name}`; }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: all } = await supabase
        .from("properties")
        .select("id,title,city,neighborhood,type,purpose,price,status,cover_image,created_at")
        .eq("broker_id", user.id)
        .order("created_at", { ascending: false });
      const list = all ?? [];
      setStats({
        total: list.length,
        available: list.filter((p) => p.status === "disponivel").length,
        sold: list.filter((p) => p.status === "vendido" || p.status === "alugado").length,
      });
      setRecent(list.slice(0, 5));
    };
    load();
  }, [user]);

  const cards = [
    { label: "Total de imóveis", value: stats.total, icon: Home, color: "text-primary" },
    { label: "Disponíveis", value: stats.available, icon: TrendingUp, color: "text-secondary" },
    { label: "Vendidos / Alugados", value: stats.sold, icon: Eye, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      <BrokerPageHeader
        title="Dashboard"
        description="Visão geral dos seus imóveis"
        action={<NewPropertyButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-card border border-border p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-display font-bold text-primary mt-1">{c.value}</p>
              </div>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border shadow-soft">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-xl font-semibold text-primary">Imóveis recentes</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/corretor/imoveis">Ver todos</Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhum imóvel.</p>
            <Button asChild><Link to="/corretor/imoveis/novo"><Plus className="h-4 w-4 mr-2" /> Cadastrar primeiro imóvel</Link></Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((p) => (
              <Link key={p.id} to={`/corretor/imoveis/${p.id}/editar`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-smooth">
                <div className="h-14 w-14 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  {p.cover_image ? <img src={p.cover_image} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.neighborhood}, {p.city} • {labelForType(p.type)}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-secondary">{formatPriceWithSuffix(Number(p.price), p.purpose)}</p>
                  <Badge variant="outline" className="text-xs mt-1">{p.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
