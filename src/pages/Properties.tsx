import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/property/SearchBar";
import { PropertyCard, PropertyCardData } from "@/components/property/PropertyCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRAND } from "@/lib/constants";

const Properties = () => {
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const sort = params.get("sort") ?? "recent";

  useEffect(() => {
    document.title = `Imóveis — ${BRAND.name}`;
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let q = supabase
        .from("properties")
        .select("id,title,city,neighborhood,price,type,purpose,bedrooms,bathrooms,garages,area,cover_image")
        .eq("status", "disponivel");

      const city = params.get("city");
      const type = params.get("type");
      const purpose = params.get("purpose");
      const minPrice = params.get("min");
      const maxPrice = params.get("max");

      if (city) q = q.or(`city.ilike.%${city}%,neighborhood.ilike.%${city}%`);
      if (type && type !== "all") q = q.eq("type", type as any);
      if (purpose && purpose !== "all") q = q.eq("purpose", purpose as any);
      if (minPrice) q = q.gte("price", Number(minPrice));
      if (maxPrice) q = q.lte("price", Number(maxPrice));

      if (sort === "price_asc") q = q.order("price", { ascending: true });
      else if (sort === "price_desc") q = q.order("price", { ascending: false });
      else q = q.order("created_at", { ascending: false });

      const { data } = await q;
      setList((data as PropertyCardData[]) ?? []);
      setLoading(false);
    };
    load();
  }, [params, sort]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">Imóveis disponíveis</h1>
        <p className="text-muted-foreground">Refine sua busca para encontrar o imóvel ideal</p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {loading ? "Carregando..." : `${list.length} ${list.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar:</span>
          <Select value={sort} onValueChange={(v) => { params.set("sort", v); setParams(params); }}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="price_asc">Menor preço</SelectItem>
              <SelectItem value="price_desc">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!loading && list.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <p className="text-lg font-medium text-primary mb-1">Nenhum imóvel encontrado</p>
          <p className="text-sm text-muted-foreground">Tente ajustar os filtros da busca.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </div>
  );
};

export default Properties;
