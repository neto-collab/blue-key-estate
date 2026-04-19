import { useState } from "react";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(180).optional().or(z.literal("")),
  phone: z.string().trim().min(8, "Telefone inválido").max(40),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

interface Props {
  propertyId: string;
  brokerId: string;
  propertyTitle: string;
}

export function LeadForm({ propertyId, brokerId, propertyTitle }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const defaultMsg = `Tenho interesse no imóvel "${propertyTitle}".`;
    const { error } = await supabase.from("leads").insert({
      property_id: propertyId,
      broker_id: brokerId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone,
      message: parsed.data.message || defaultMsg,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível enviar. Tente novamente.");
      return;
    }
    setSent(true);
    toast.success("Contato enviado! O corretor retornará em breve.");
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4 text-center">
        <p className="font-semibold text-primary">Mensagem enviada ✓</p>
        <p className="text-sm text-muted-foreground mt-1">O corretor entrará em contato em breve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="lead-name" className="text-xs">Nome *</Label>
        <Input
          id="lead-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          maxLength={120}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="lead-phone" className="text-xs">Telefone *</Label>
          <Input
            id="lead-phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            maxLength={40}
          />
        </div>
        <div>
          <Label htmlFor="lead-email" className="text-xs">E-mail</Label>
          <Input
            id="lead-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            maxLength={180}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="lead-message" className="text-xs">Mensagem</Label>
        <Textarea
          id="lead-message"
          rows={3}
          placeholder="Tenho interesse neste imóvel..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          maxLength={1000}
        />
      </div>
      <Button type="submit" disabled={submitting} className="w-full bg-secondary hover:bg-secondary/90">
        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
        Enviar contato
      </Button>
    </form>
  );
}
