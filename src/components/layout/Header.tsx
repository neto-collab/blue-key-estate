import { Link, NavLink } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Início" },
    { to: "/imoveis?purpose=venda", label: "Comprar" },
    { to: "/imoveis?purpose=aluguel", label: "Alugar" },
    { to: "/contato", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md gradient-brand shadow-soft transition-smooth group-hover:shadow-glow">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-primary">{BRAND.name}</div>
            <div className="hidden sm:block text-[10px] uppercase tracking-widest text-muted-foreground">
              Imóveis selecionados
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-smooth",
                  isActive
                    ? "text-primary bg-accent"
                    : "text-foreground/70 hover:text-primary hover:bg-accent/60"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="default" size="sm">
            <Link to="/imoveis">Ver imóveis</Link>
          </Button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md hover:bg-accent transition-smooth"
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-md text-sm font-medium",
                    isActive ? "bg-accent text-primary" : "text-foreground/80"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Button asChild className="mt-2">
              <Link to="/imoveis" onClick={() => setOpen(false)}>Ver imóveis</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
