import { Link } from "react-router-dom";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { BRAND } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold">{BRAND.name}</span>
          </div>
          <p className="text-sm text-primary-foreground/75 max-w-md">
            {BRAND.tagline}. Selecionamos os melhores imóveis com atendimento personalizado e transparente.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider">Navegação</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/" className="hover:text-primary-foreground transition-smooth">Início</Link></li>
            <li><Link to="/imoveis?purpose=venda" className="hover:text-primary-foreground transition-smooth">Comprar</Link></li>
            <li><Link to="/imoveis?purpose=aluguel" className="hover:text-primary-foreground transition-smooth">Alugar</Link></li>
            <li><Link to="/contato" className="hover:text-primary-foreground transition-smooth">Contato</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider">Contato</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Brasil</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> Fale com um corretor</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contato@{BRAND.url}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} {BRAND.name}. Todos os direitos reservados.</p>
          <p>{BRAND.url}</p>
        </div>
      </div>
    </footer>
  );
}
