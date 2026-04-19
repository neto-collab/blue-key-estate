DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;

CREATE POLICY "Anyone can create leads for valid property"
  ON public.leads FOR INSERT
  WITH CHECK (
    property_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = leads.property_id AND p.broker_id = leads.broker_id
    )
  );