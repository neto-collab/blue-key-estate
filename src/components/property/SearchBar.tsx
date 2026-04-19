import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_TYPES, PROPERTY_PURPOSES } from "@/lib/constants";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [city, setCity] = useState(params.get("city") ?? "");
  const [type, setType] = useState(params.get("type") ?? "all");
  const [purpose, setPurpose] = useState(params.get("purpose") ?? "all");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (city) sp.set("city", city);
    if (type !== "all") sp.set("type", type);
    if (purpose !== "all") sp.set("purpose", purpose);
    navigate(`/imoveis?${sp.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className={`grid gap-3 bg-background/95 backdrop-blur p-4 md:p-5 rounded-xl shadow-elegant border border-border/40 ${
        compact ? "md:grid-cols-4" : "md:grid-cols-[1fr_180px_180px_auto]"
      }`}
    >
      <Input
        placeholder="Cidade ou bairro"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="h-12"
      />
      <Select value={purpose} onValueChange={setPurpose}>
        <SelectTrigger className="h-12"><SelectValue placeholder="Finalidade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Comprar ou alugar</SelectItem>
          {PROPERTY_PURPOSES.map((p) => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="h-12"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {PROPERTY_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="lg" className="h-12 gap-2 px-8">
        <Search className="h-4 w-4" /> Buscar
      </Button>
    </form>
  );
}
