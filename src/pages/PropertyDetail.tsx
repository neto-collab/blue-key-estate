import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bed, Bath, Car, Maximize, MapPin, ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPriceWithSuffix, labelForType, labelForPurpose, BRAND } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadForm } from "@/components/property/LeadForm";

interface PropertyDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  purpose: string;
  price: number;
  city: string;
  neighborhood: string;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  area: number | null;
  status: string;
  cover_image: string | null;
  broker_id: string;
}

interface BrokerInfo {
  full_name: string;
  whatsapp: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [broker, setBroker] = useState<BrokerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const { data: prop } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!prop) { setLoading(false); return; }
      setProperty(prop as PropertyDetail);
      document.title = `${prop.title} — ${BRAND.name}`;

      const { data: imgs } = await supabase
        .from("property_images")
        .select("url")
        .eq("property_id", id)
        .order("position", { ascending: true });

      const allImgs = [
        ...(prop.cover_image ? [prop.cover_image] : []),
        ...((imgs ?? []).map((i: any) => i.url).filter((u: string) => u !== prop.cover_image)),
      ];
      setImages(allImgs);
      setActiveImg(allImgs[0] ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,whatsapp,phone,avatar_url")
        .eq("id", prop.broker_id)
        .maybeSingle();
      setBroker(profile as BrokerInfo | null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="aspect-[4/3] rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-display font-bold text-primary mb-2">Imóvel não encontrado</h1>
        <Button asChild variant="link"><Link to="/imoveis">Voltar para listagem</Link></Button>
      </div>
    );
  }

  const whatsappNumber = broker?.whatsapp || broker?.phone || BRAND.fallbackPhone;
  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${property.title}" (${BRAND.name}). Pode me passar mais informações?`
  );
  const waLink = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${whatsappMsg}`;

  return (
    <div className="container py-8">
      <Link to="/imoveis" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-smooth">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted shadow-card">
            {activeImg ? (
              <img src={activeImg} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">Sem foto</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition-smooth ${
                    activeImg === img ? "border-secondary" : "border-transparent hover:border-border"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="pt-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground">{labelForPurpose(property.purpose)}</Badge>
              <Badge variant="secondary">{labelForType(property.type)}</Badge>
              {property.status !== "disponivel" && (
                <Badge variant="destructive">{property.status}</Badge>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">{property.title}</h1>
            <p className="text-muted-foreground flex items-center gap-1 mb-6">
              <MapPin className="h-4 w-4" /> {property.address ? `${property.address}, ` : ""}{property.neighborhood}, {property.city}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Bed, label: "Quartos", value: property.bedrooms },
                { icon: Bath, label: "Banheiros", value: property.bathrooms },
                { icon: Car, label: "Garagens", value: property.garages },
                { icon: Maximize, label: "Área (m²)", value: property.area },
              ].filter(item => item.value !== null && item.value !== undefined).map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-card p-4 text-center">
                  <item.icon className="h-5 w-5 mx-auto mb-2 text-secondary" />
                  <div className="text-xl font-bold text-primary">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>

            {property.description && (
              <div>
                <h2 className="font-display text-xl font-semibold text-primary mb-3">Sobre o imóvel</h2>
                <p className="text-foreground/80 whitespace-pre-line leading-relaxed">{property.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground mb-1">Valor</p>
            <p className="text-3xl font-display font-bold text-secondary mb-6">
              {formatPriceWithSuffix(Number(property.price), property.purpose)}
            </p>

            {broker && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
                <div className="h-12 w-12 rounded-full gradient-brand flex items-center justify-center text-primary-foreground font-semibold">
                  {broker.full_name?.[0]?.toUpperCase() ?? "C"}
                </div>
                <div>
                  <p className="font-semibold text-primary">{broker.full_name || "Corretor"}</p>
                  <p className="text-xs text-muted-foreground">Corretor responsável</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button asChild size="lg" className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
                </a>
              </Button>
              {broker?.phone && (
                <Button asChild variant="outline" size="lg" className="w-full gap-2">
                  <a href={`tel:${broker.phone}`}><Phone className="h-4 w-4" /> Ligar</a>
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-primary mb-1">Tem interesse?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Deixe seu contato e o corretor responsável retornará em breve.
            </p>
            <LeadForm
              propertyId={property.id}
              brokerId={property.broker_id}
              propertyTitle={property.title}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetail;
