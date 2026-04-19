import { useEffect, useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrokerPageHeader } from "@/components/broker/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BRAND } from "@/lib/constants";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = `Alterar senha — ${BRAND.name}`;
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
    setPassword("");
    setConfirm("");
  };

  return (
    <div className="space-y-6 max-w-xl">
      <BrokerPageHeader
        title="Alterar senha"
        description="Defina uma nova senha de acesso para sua conta"
      />

      <div className="rounded-xl bg-card border border-border shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="h-10 w-10 rounded-md gradient-brand flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-primary">Nova senha</h3>
            <p className="text-xs text-muted-foreground">
              Use no mínimo 8 caracteres. Senhas vazadas em incidentes públicos serão bloqueadas.
            </p>
          </div>
        </div>

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
              autoComplete="new-password"
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
              autoComplete="new-password"
            />
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar nova senha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
