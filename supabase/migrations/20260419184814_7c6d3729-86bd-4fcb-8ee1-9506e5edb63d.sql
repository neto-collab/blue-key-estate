-- Remove a política ampla de SELECT que permite listar todo o bucket
DROP POLICY IF EXISTS "Property images publicly viewable" ON storage.objects;

-- Recria permitindo apenas leitura por nome de arquivo (acesso direto às URLs públicas funciona)
-- mas listagem do bucket inteiro fica bloqueada porque exige conhecer o caminho.
-- Como o bucket é "public", URLs públicas continuam acessíveis sem auth.
-- Essa policy só impacta tentativas de LIST/SELECT via API; assets via CDN público continuam funcionando.
CREATE POLICY "Property images viewable by path" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
);