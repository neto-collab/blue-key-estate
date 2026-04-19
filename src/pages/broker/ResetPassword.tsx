import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BRAND } from "@/lib/constants";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    document.title = `Redefinir senha — ${BRAND.name}`;
  }, []);

  useEffect(() => {
    // Supabase processa o token automaticamente via hash da URL e dispara PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasRecoverySession(true);
      }
    });
    // Verifica se já existe sessão (caso o link já tenha sido processado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setHasRecoverySession(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não conferem");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha alterada com sucesso");
    navigate("/corretor", { replace: true });
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
            Defina uma<br />nova senha
          </h1>
          <p className="text-primary-foreground/80 max-w-sm">
            Escolha uma senha forte para proteger sua conta.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} {BRAND.name}</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md gradient-brand flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-primary">Redefinir senha</h2>
              <p className="text-sm text-muted-foreground">Crie uma nova senha de acesso</p>
            </div>
          </div>

          {!hasRecoverySession ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Aguardando validação do link de recuperação... Se nada acontecer em alguns segundos, solicite um novo link.
              <div className="mt-4">
                <Link to="/corretor/esqueci-senha" className="text-primary hover:underline">
                  Solicitar novo link
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirme a nova senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-border text-center">
            <Link to="/corretor/login" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
