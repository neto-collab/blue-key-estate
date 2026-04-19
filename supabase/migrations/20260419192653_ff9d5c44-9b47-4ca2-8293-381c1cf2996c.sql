-- Enum para status do lead
CREATE TYPE public.lead_status AS ENUM ('novo', 'em_atendimento', 'finalizado');

-- Tabela leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  broker_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  status public.lead_status NOT NULL DEFAULT 'novo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_broker ON public.leads(broker_id);
CREATE INDEX idx_leads_property ON public.leads(property_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);

-- Trigger updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode criar lead (formulário público)
CREATE POLICY "Anyone can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Corretor vê seus leads
CREATE POLICY "Brokers view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = broker_id);

-- Corretor atualiza seus leads
CREATE POLICY "Brokers update own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = broker_id);

-- Corretor deleta seus leads
CREATE POLICY "Brokers delete own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = broker_id);

-- Admin gerencia tudo
CREATE POLICY "Admins manage all leads"
  ON public.leads FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));