import { useEffect } from "react";
import { BRAND } from "@/lib/constants";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  useEffect(() => { document.title = `Contato — ${BRAND.name}`; }, []);
  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-bold text-primary mb-3">Fale com a gente</h1>
      <p className="text-muted-foreground mb-10">
        Entre em contato com a {BRAND.name}. Nossa equipe está pronta para atender você.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Phone, title: "Telefone", value: "Em breve" },
          { icon: Mail, title: "E-mail", value: `contato@${BRAND.url}` },
          { icon: MapPin, title: "Endereço", value: "Brasil" },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <c.icon className="h-6 w-6 text-secondary mb-3" />
            <p className="font-semibold text-primary">{c.title}</p>
            <p className="text-sm text-muted-foreground mt-1 break-all">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contact;
