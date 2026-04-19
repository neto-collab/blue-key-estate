import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Plus, TrendingUp, Eye, Inbox } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { BrokerPageHeader, NewPropertyButton } from "@/components/broker/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPriceWithSuffix, labelForType, BRAND } from "@/lib/constants";

type RecentLead = {
  id: string;
  name: string;
  phone: string;
  status: string;
  created_at: string;
  property_id: string | null;
  property_title?: string;
};

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const Dashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0, leads: 0, newLeads: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [chart, setChart] = useState<{ month: string; leads: number }[]>([]);

  useEffect(() => {
    document.title = `Dashboard — ${BRAND.name}`;
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Properties: admin sees all, broker sees own
      const propQuery = supabase
        .from("properties")
        .select("id,title,city,neighborhood,type,purpose,price,status,cover_image,created_at,broker_id")
        .order("created_at", { ascending: false });
      if (!isAdmin) propQuery.eq("broker_id", user.id);
      const { data: all } = await propQuery;

      const list = all ?? [];
      // Leads (RLS filtra automaticamente)
      const { data: leadsRows } = await supabase
        .from("leads")
        .select("id,name,phone,status,created_at,property_id")
        .order("created_at", { ascending: false });
      const leads = leadsRows ?? [];

      setStats({
        total: list.length,
        available: list.filter((p) => p.status === "disponivel").length,
        sold: list.filter((p) => p.status === "vendido" || p.status === "alugado").length,
        leads: leads.length,
        newLeads: leads.filter((l) => l.status === "novo").length,
      });
      setRecent(list.slice(0, 5));

      // Top 5 leads + título do imóvel
      const top = leads.slice(0, 5);
      const propIds = Array.from(new Set(top.map((l) => l.property_id).filter(Boolean) as string[]));
      const propMap = new Map<string, string>();
      if (propIds.length) {
        const { data: props } = await supabase.from("properties").select("id, title").in("id", propIds);
        (props ?? []).forEach((p: any) => propMap.set(p.id, p.title));
      }
      setRecentLeads(
        top.map((l) => ({ ...l, property_title: l.property_id ? propMap.get(l.property_id) ?? "—" : "—" }))
      );

      // Gráfico: últimos 6 meses
      const now = new Date();
      const buckets: { month: string; key: string; leads: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({
          month: MONTHS[d.getMonth()],
          key: `${d.getFullYear()}-${d.getMonth()}`,
          leads: 0,
        });
      }
      leads.forEach((l) => {
        const d = new Date(l.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const b = buckets.find((x) => x.key === key);
        if (b) b.leads += 1;
      });
      setChart(buckets.map(({ month, leads }) => ({ month, leads })));
    };
    load();
  }, [user, isAdmin]);

  const cards = [
    { label: isAdmin ? "Imóveis (todos)" : "Meus imóveis", value: stats.total, icon: Home, color: "text-primary" },
    { label: "Disponíveis", value: stats.available, icon: TrendingUp, color: "text-secondary" },
    { label: "Vendidos / Alugados", value: stats.sold, icon: Eye, color: "text-emerald-600" },
    { label: "Leads novos", value: stats.newLeads, icon: Inbox, color: "text-amber-600", link: "/corretor/leads" },
  ];

  return (
    <div className="space-y-8">
      <BrokerPageHeader
        title="Dashboard"
        description={isAdmin ? "Visão geral da imobiliária" : "Visão geral dos seus imóveis e leads"}
        action={<NewPropertyButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <div className="rounded-xl bg-card border border-border p-6 shadow-soft hover:shadow-card transition-smooth h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-3xl font-display font-bold text-primary mt-1">{c.value}</p>
                </div>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
            </div>
          );
          return c.link ? (
            <Link key={c.label} to={c.link}>{inner}</Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      <div className="rounded-xl bg-card border border-border shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Leads por mês</h2>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </div>
          <Badge variant="outline">{stats.leads} no total</Badge>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="leads" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card border border-border shadow-soft">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-primary">Imóveis recentes</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/corretor/imoveis">Ver todos</Link>
            </Button>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4 text-sm">Nenhum imóvel cadastrado.</p>
              <Button asChild size="sm">
                <Link to="/corretor/imoveis/novo">
                  <Plus className="h-4 w-4 mr-2" /> Cadastrar
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  to={isAdmin && p.broker_id !== user?.id ? `/imoveis/${p.id}` : `/corretor/imoveis/${p.id}/editar`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-smooth"
                >
                  <div className="h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                    {p.cover_image ? <img src={p.cover_image} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary truncate text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.neighborhood}, {p.city} • {labelForType(p.type)}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-secondary text-sm">
                      {formatPriceWithSuffix(Number(p.price), p.purpose)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-card border border-border shadow-soft">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-primary">Leads recentes</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/corretor/leads">Ver todos</Link>
            </Button>
          </div>
          {recentLeads.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum lead recebido ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentLeads.map((l) => (
                <Link
                  key={l.id}
                  to="/corretor/leads"
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-smooth"
                >
                  <div className="h-10 w-10 rounded-full gradient-brand flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                    {l.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary truncate text-sm">{l.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{l.property_title}</p>
                  </div>
                  <Badge
                    variant={l.status === "novo" ? "default" : l.status === "em_atendimento" ? "secondary" : "outline"}
                    className="text-[10px] flex-shrink-0"
                  >
                    {l.status === "novo" ? "Novo" : l.status === "em_atendimento" ? "Atend." : "OK"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
