import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BRAND } from "@/lib/constants";

const BrokerLogin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = `Acesso do corretor — ${BRAND.name}`; }, []);
  useEffect(() => {
    if (!authLoading && user) navigate("/corretor", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/corretor`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail se necessário e faça login.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
        navigate("/corretor", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex relative gradient-brand text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-primary-foreground/15 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">{BRAND.name}</span>
        </Link>
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Área exclusiva<br />do corretor
          </h1>
          <p className="text-primary-foreground/80 max-w-sm">
            Gerencie seus imóveis, acompanhe leads e cresça com a {BRAND.name}.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} {BRAND.name}</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="md:hidden flex items-center gap-2">
            <div className="h-9 w-9 rounded-md gradient-brand flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-primary">{BRAND.name}</span>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-primary">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Acesse seu painel de corretor"
                : "Cadastre-se para começar a anunciar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} maxLength={120} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={128} />
            </div>
            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-smooth"
          >
            {mode === "login"
              ? "Ainda não tem conta? Cadastre-se"
              : "Já tem conta? Entrar"}
          </button>

          <div className="pt-4 border-t border-border text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerLogin;
