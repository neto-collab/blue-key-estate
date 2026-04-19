import { Link } from "react-router-dom";
import { Bed, Bath, Car, Maximize, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPriceWithSuffix, labelForType, labelForPurpose } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface PropertyCardData {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  price: number;
  type: string;
  purpose: string;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  area: number | null;
  cover_image: string | null;
}

export function PropertyCard({ p, className }: { p: PropertyCardData; className?: string }) {
  return (
    <Link
      to={`/imoveis/${p.id}`}
      className={cn(
        "group block rounded-xl overflow-hidden bg-card shadow-card hover:shadow-elegant transition-smooth border border-border/60",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {p.cover_image ? (
          <img
            src={p.cover_image}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            Sem foto
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">
            {labelForPurpose(p.purpose)}
          </Badge>
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            {labelForType(p.type)}
          </Badge>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight line-clamp-1 text-primary">
            {p.title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {p.neighborhood}, {p.city}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-3">
          {!!p.bedrooms && (
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.bedrooms}</span>
          )}
          {!!p.bathrooms && (
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.bathrooms}</span>
          )}
          {!!p.garages && (
            <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" /> {p.garages}</span>
          )}
          {!!p.area && (
            <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {p.area}m²</span>
          )}
        </div>
        <div className="text-xl font-bold text-secondary font-display">
          {formatPriceWithSuffix(Number(p.price), p.purpose)}
        </div>
      </div>
    </Link>
  );
}
