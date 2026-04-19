import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BRAND } from "@/lib/constants";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = `Recuperar senha — ${BRAND.name}`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/corretor/redefinir-senha`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("E-mail de recuperação enviado");
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
            Recuperar<br />acesso
          </h1>
          <p className="text-primary-foreground/80 max-w-sm">
            Enviaremos um link seguro para você criar uma nova senha.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} {BRAND.name}</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary">Esqueci minha senha</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Informe seu e-mail e enviaremos um link de recuperação.
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-border bg-muted/40 p-6 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center">
                <Mail className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary">Verifique seu e-mail</h3>
              <p className="text-sm text-muted-foreground">
                Se houver uma conta com <strong>{email}</strong>, você receberá um link para redefinir a senha em instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  placeholder="seu@email.com"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar link de recuperação
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-border text-center space-y-2">
            <Link to="/corretor/login" className="block text-sm text-muted-foreground hover:text-primary transition-smooth">
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
