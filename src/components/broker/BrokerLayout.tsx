import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Building2, LayoutDashboard, Home, LogOut, Plus, Shield, Users, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function BrokerLayout() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    navigate("/");
  };

  const navItems = [
    { to: "/corretor", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/corretor/imoveis", label: "Meus imóveis", icon: Home, end: false },
  ];

  const adminItems = [
    { to: "/corretor/admin/corretores", label: "Corretores", icon: Users, end: false },
    { to: "/corretor/admin/imoveis", label: "Todos os imóveis", icon: Database, end: false },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden lg:flex w-64 flex-col bg-primary text-primary-foreground">
        <Link to="/corretor" className="h-16 flex items-center gap-2 px-6 border-b border-primary-foreground/10">
          <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-display font-bold">{BRAND.name}</span>
        </Link>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-primary-foreground/50">
                <Shield className="h-3 w-3" /> Administração
              </div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div className="p-3 border-t border-primary-foreground/10 space-y-2">
          <div className="px-3 py-2 text-xs text-primary-foreground/60 truncate flex items-center gap-2">
            {isAdmin && <Badge className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0 h-4">Admin</Badge>}
            <span className="truncate">{user?.email}</span>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-14 bg-primary text-primary-foreground flex items-center justify-between px-4">
          <Link to="/corretor" className="flex items-center gap-2 font-display font-bold">
            <Building2 className="h-4 w-4" /> {BRAND.name}
          </Link>
          <Button onClick={handleLogout} size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <nav className="lg:hidden flex border-b border-border bg-background">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex-1 px-3 py-3 text-center text-sm font-medium transition-smooth",
                  isActive ? "text-primary border-b-2 border-secondary" : "text-muted-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function BrokerPageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function NewPropertyButton() {
  return (
    <Button asChild>
      <Link to="/corretor/imoveis/novo"><Plus className="h-4 w-4 mr-2" /> Novo imóvel</Link>
    </Button>
  );
}
