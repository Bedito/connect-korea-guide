
-- Catalog: languages
CREATE TABLE public.languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.languages TO anon, authenticated;
GRANT ALL ON public.languages TO service_role;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Languages are viewable by everyone" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Admins manage languages" ON public.languages FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Catalog: amenities
CREATE TABLE public.amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.amenities TO anon, authenticated;
GRANT ALL ON public.amenities TO service_role;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Amenities are viewable by everyone" ON public.amenities FOR SELECT USING (true);
CREATE POLICY "Admins manage amenities" ON public.amenities FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Catalog: services (scoped by category so options are category-specific)
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Join: business_languages
CREATE TABLE public.business_languages (
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, language_id)
);
GRANT SELECT ON public.business_languages TO anon, authenticated;
GRANT INSERT, DELETE ON public.business_languages TO authenticated;
GRANT ALL ON public.business_languages TO service_role;
ALTER TABLE public.business_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business languages viewable by everyone" ON public.business_languages FOR SELECT USING (true);
CREATE POLICY "Owners manage their business languages" ON public.business_languages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- Join: business_amenities
CREATE TABLE public.business_amenities (
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, amenity_id)
);
GRANT SELECT ON public.business_amenities TO anon, authenticated;
GRANT INSERT, DELETE ON public.business_amenities TO authenticated;
GRANT ALL ON public.business_amenities TO service_role;
ALTER TABLE public.business_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business amenities viewable by everyone" ON public.business_amenities FOR SELECT USING (true);
CREATE POLICY "Owners manage their business amenities" ON public.business_amenities FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- Join: business_services (with per-business price/duration override)
CREATE TABLE public.business_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price_krw integer,
  duration_minutes integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX business_services_business_idx ON public.business_services(business_id);
GRANT SELECT ON public.business_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.business_services TO authenticated;
GRANT ALL ON public.business_services TO service_role;
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business services viewable by everyone" ON public.business_services FOR SELECT USING (true);
CREATE POLICY "Owners manage their business services" ON public.business_services FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE TRIGGER update_business_services_updated_at BEFORE UPDATE ON public.business_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Business photos (relational gallery)
CREATE TABLE public.business_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  kind text NOT NULL DEFAULT 'gallery',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX business_photos_business_idx ON public.business_photos(business_id);
GRANT SELECT ON public.business_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.business_photos TO authenticated;
GRANT ALL ON public.business_photos TO service_role;
ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business photos viewable by everyone" ON public.business_photos FOR SELECT USING (true);
CREATE POLICY "Owners manage their business photos" ON public.business_photos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- Business hours (per-day rows with lunch break)
CREATE TABLE public.business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_closed boolean NOT NULL DEFAULT false,
  open_time time,
  close_time time,
  lunch_start time,
  lunch_end time,
  notes text,
  UNIQUE (business_id, day_of_week)
);
CREATE INDEX business_hours_business_idx ON public.business_hours(business_id);
GRANT SELECT ON public.business_hours TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.business_hours TO authenticated;
GRANT ALL ON public.business_hours TO service_role;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business hours viewable by everyone" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "Owners manage their business hours" ON public.business_hours FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- Seed common languages
INSERT INTO public.languages (code, name, sort_order) VALUES
  ('en','English',1),
  ('ko','Korean',2),
  ('zh','Chinese',3),
  ('ja','Japanese',4),
  ('es','Spanish',5),
  ('fr','French',6),
  ('de','German',7),
  ('ru','Russian',8),
  ('ar','Arabic',9),
  ('vi','Vietnamese',10)
ON CONFLICT (code) DO NOTHING;

-- Seed common amenities
INSERT INTO public.amenities (slug, name, sort_order) VALUES
  ('wifi','Free Wi-Fi',1),
  ('parking','Parking',2),
  ('wheelchair','Wheelchair Accessible',3),
  ('cards','Card Payment',4),
  ('reservations','Reservations',5),
  ('kids','Kid Friendly',6),
  ('pets','Pet Friendly',7),
  ('delivery','Delivery',8),
  ('takeout','Takeout',9),
  ('english_menu','English Menu',10)
ON CONFLICT (slug) DO NOTHING;
