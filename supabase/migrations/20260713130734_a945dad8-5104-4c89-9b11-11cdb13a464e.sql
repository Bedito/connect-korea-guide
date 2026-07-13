
-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text NOT NULL,
  photos text[] NOT NULL DEFAULT '{}',
  owner_reply text,
  owner_reply_at timestamptz,
  status text NOT NULL DEFAULT 'approved', -- approved | hidden
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users can create their own review"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Business owner can reply"
  ON public.reviews FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));

CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recalc rating & review_count on the business
CREATE OR REPLACE FUNCTION public.recalc_business_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  bid uuid;
BEGIN
  bid := COALESCE(NEW.business_id, OLD.business_id);
  UPDATE public.businesses b SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE business_id = bid AND status='approved'), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE business_id = bid AND status='approved')
  WHERE b.id = bid;
  RETURN NULL;
END; $$;

CREATE TRIGGER reviews_recalc_ins AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalc_business_rating();
CREATE TRIGGER reviews_recalc_upd AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalc_business_rating();
CREATE TRIGGER reviews_recalc_del AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalc_business_rating();

-- ============ BUSINESS CLAIMS ============
CREATE TABLE public.business_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  proof_url text,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_claims TO authenticated;
GRANT ALL ON public.business_claims TO service_role;

ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own claims" ON public.business_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own claims" ON public.business_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage claims" ON public.business_claims FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER business_claims_updated_at BEFORE UPDATE ON public.business_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BUSINESS OWNER + ADMIN POLICIES ============
CREATE POLICY "Owners can update their business"
  ON public.businesses FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id AND status <> 'approved' OR auth.uid() = owner_id);

CREATE POLICY "Owners can read their business regardless of status"
  ON public.businesses FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins manage businesses"
  ON public.businesses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ STORAGE BUCKETS handled by tool ============
