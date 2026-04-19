-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'corretor');
CREATE TYPE public.property_type AS ENUM ('casa', 'apartamento', 'terreno', 'comercial', 'rural');
CREATE TYPE public.property_purpose AS ENUM ('venda', 'aluguel');
CREATE TYPE public.property_status AS ENUM ('disponivel', 'vendido', 'alugado', 'reservado');

-- ========== UPDATED_AT TRIGGER FN ==========
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  creci TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== USER ROLES ==========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========== AUTO-CREATE PROFILE ON SIGNUP ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  );
  -- First user becomes admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  -- Everyone gets corretor role by default
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'corretor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== PROPERTIES ==========
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type public.property_type NOT NULL,
  purpose public.property_purpose NOT NULL,
  price NUMERIC(14,2) NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  garages INT DEFAULT 0,
  area NUMERIC(10,2),
  status public.property_status NOT NULL DEFAULT 'disponivel',
  featured BOOLEAN NOT NULL DEFAULT false,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties publicly readable" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Brokers insert own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = broker_id);
CREATE POLICY "Brokers update own properties" ON public.properties FOR UPDATE USING (auth.uid() = broker_id);
CREATE POLICY "Brokers delete own properties" ON public.properties FOR DELETE USING (auth.uid() = broker_id);
CREATE POLICY "Admins manage all properties" ON public.properties FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_purpose ON public.properties(purpose);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_broker ON public.properties(broker_id);

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== PROPERTY IMAGES ==========
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Images publicly readable" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Brokers insert images for own properties" ON public.property_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.broker_id = auth.uid()));
CREATE POLICY "Brokers update images for own properties" ON public.property_images FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.broker_id = auth.uid()));
CREATE POLICY "Brokers delete images for own properties" ON public.property_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.broker_id = auth.uid()));

CREATE INDEX idx_property_images_property ON public.property_images(property_id);

-- ========== STORAGE BUCKET ==========
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

CREATE POLICY "Property images publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Authenticated users can upload property images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their property images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their property images" ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);