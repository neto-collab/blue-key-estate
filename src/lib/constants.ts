export const BRAND = {
  name: "Da Fonte Imóveis",
  tagline: "Realizando o sonho da casa própria",
  url: "dafonteimoveis.com.br",
  fallbackPhone: "5500000000000",
} as const;

export const PROPERTY_TYPES = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
  { value: "rural", label: "Rural" },
] as const;

export const PROPERTY_PURPOSES = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
] as const;

export const PROPERTY_STATUSES = [
  { value: "disponivel", label: "Disponível" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
  { value: "alugado", label: "Alugado" },
] as const;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

export const formatPriceWithSuffix = (value: number, purpose: string) =>
  `${formatPrice(value)}${purpose === "aluguel" ? "/mês" : ""}`;

export const labelForType = (t: string) =>
  PROPERTY_TYPES.find((p) => p.value === t)?.label ?? t;

export const labelForPurpose = (t: string) =>
  PROPERTY_PURPOSES.find((p) => p.value === t)?.label ?? t;
