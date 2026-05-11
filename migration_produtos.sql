CREATE TABLE IF NOT EXISTS produtos (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome           text NOT NULL,
  descricao      text,
  categoria      text NOT NULL DEFAULT 'Doce',
  custo          numeric(10,2) NOT NULL DEFAULT 0,
  preco_venda    numeric(10,2) NOT NULL DEFAULT 0,
  estoque_atual  integer NOT NULL DEFAULT 0,
  estoque_min    integer NOT NULL DEFAULT 0,
  unidade        text NOT NULL DEFAULT 'un',
  imagem_url     text,
  created_at     timestamptz DEFAULT now()
);
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'produtos' AND policyname = 'user_owns_produtos'
  ) THEN
    CREATE POLICY user_owns_produtos ON produtos
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('produto-imgs', 'produto-imgs', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'produto_imgs_insert'
  ) THEN
    CREATE POLICY produto_imgs_insert ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'produto-imgs' AND auth.role() = 'authenticated');
    CREATE POLICY produto_imgs_select ON storage.objects
      FOR SELECT USING (bucket_id = 'produto-imgs');
    CREATE POLICY produto_imgs_delete ON storage.objects
      FOR DELETE USING (bucket_id = 'produto-imgs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
