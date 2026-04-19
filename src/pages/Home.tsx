import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Home as HomeIcon, Users, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/property/SearchBar";
import { PropertyCard, PropertyCardData } from "@/components/property/PropertyCard";
import { BRAND } from "@/lib/constants";
import heroImg from "@/assets/hero-house.jpg";

const Home = () => {
  const [featured, setFeatured] = useState<PropertyCardData[]>([]);
  const [recent, setRecent] = useState<PropertyCardData[]>([]);

  useEffect(() => {
    document.title = `${BRAND.name} — Imóveis para venda e aluguel`;
    const meta = document.querySelector('meta[name="description"]');
    const desc = `${BRAND.tagline}. Encontre casas, apartamentos e terrenos para comprar ou alugar com a ${BRAND.name}.`;
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description"; m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: feat } = await supabase
        .from("properties")
        .select("id,title,city,neighborhood,price,type,purpose,bedrooms,bathrooms,garages,area,cover_image")
        .eq("status", "disponivel")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      setFeatured((feat as PropertyCardData[]) ?? []);

      const { data: rec } = await supabase
        .from("properties")
        .select("id,title,city,neighborhood,price,type,purpose,bedrooms,bathrooms,garages,area,cover_image")
        .eq("status", "disponivel")
        .order("created_at", { ascending: false })
        .limit(8);
      setRecent((rec as PropertyCardData[]) ?? []);
    };
    load();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[640px] flex items-center">
        <img
          src={heroImg}
          alt="Casa moderna de luxo"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="container relative py-20 md:py-28 grid gap-10 lg:grid-cols-[1.3fr_1fr] items-center">
          <div className="text-primary-foreground space-y-6 animate-fade-in-up">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] bg-primary-foreground/10 backdrop-blur px-4 py-2 rounded-full border border-primary-foreground/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Atendimento exclusivo
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Encontre o imóvel<br />
              <span className="text-secondary-foreground/95 italic">que combina com você.</span>
            </h1>
            <p className="text-lg text-primary-foreground/85 max-w-xl">
              {BRAND.tagline}. Imóveis selecionados, atendimento humano e processo transparente do início ao fim.
            </p>
            <div className="flex gap-3 pt-2">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/imoveis">Ver imóveis <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/contato">Fale com um corretor</Link>
              </Button>
            </div>
          </div>
          <div className="lg:justify-self-end w-full max-w-xl">
            <SearchBar compact />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-16 grid gap-6 md:grid-cols-3">
        {[
          { icon: HomeIcon, title: "Imóveis selecionados", text: "Cada imóvel é cuidadosamente avaliado pelos nossos corretores." },
          { icon: Users, title: "Corretores experientes", text: "Equipe especializada para guiar você em cada etapa." },
          { icon: Award, title: "Negociação transparente", text: "Sem letras miúdas. Tudo claro do primeiro contato à assinatura." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl bg-card border border-border/60 p-6 shadow-soft hover:shadow-card transition-smooth">
            <div className="h-11 w-11 rounded-lg gradient-brand flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-primary mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>

      {/* DESTAQUES */}
      {featured.length > 0 && (
        <section className="container py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">Selecionados pela equipe</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Imóveis em destaque</h2>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link to="/imoveis">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* RECENTES */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">Acabaram de chegar</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Últimos cadastros</h2>
          </div>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link to="/imoveis">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Em breve novos imóveis disponíveis. Volte em breve!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="rounded-2xl gradient-brand p-10 md:p-14 text-primary-foreground text-center shadow-elegant">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Vai vender ou alugar seu imóvel?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
            Anuncie com a {BRAND.name} e tenha visibilidade, segurança e atendimento profissional.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/contato">Fale com a gente</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Home;
