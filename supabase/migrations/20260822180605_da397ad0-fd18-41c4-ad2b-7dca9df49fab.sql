
CREATE TYPE public.app_role AS ENUM ('resident','admin');
CREATE TYPE public.complaint_status AS ENUM ('open','in_progress','resolved');
CREATE TYPE public.complaint_priority AS ENUM ('low','medium','high');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role public.app_role NOT NULL DEFAULT 'resident',
  unit_number TEXT,
  block TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, unit_number, block, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NEW.raw_user_meta_data->>'unit_number',
    NEW.raw_user_meta_data->>'block',
    NEW.raw_user_meta_data->>'phone'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT,
  status public.complaint_status NOT NULL DEFAULT 'open',
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  is_overdue BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints read" ON public.complaints FOR SELECT TO authenticated USING (resident_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "complaints insert" ON public.complaints FOR INSERT TO authenticated WITH CHECK (resident_id = auth.uid());
CREATE POLICY "complaints update admin" ON public.complaints FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.complaint_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.complaint_photos TO authenticated;
GRANT ALL ON public.complaint_photos TO service_role;
ALTER TABLE public.complaint_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos read" ON public.complaint_photos FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.resident_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "photos insert" ON public.complaint_photos FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND c.resident_id = auth.uid()));

CREATE TABLE public.complaint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  old_status public.complaint_status,
  new_status public.complaint_status,
  note TEXT,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaint_history TO authenticated;
GRANT ALL ON public.complaint_history TO service_role;
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history read" ON public.complaint_history FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.resident_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "history insert" ON public.complaint_history FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.resident_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE TABLE public.complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaint_comments TO authenticated;
GRANT ALL ON public.complaint_comments TO service_role;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments read" ON public.complaint_comments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.resident_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "comments insert" ON public.complaint_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.resident_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE TABLE public.overdue_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT UNIQUE,
  days INTEGER NOT NULL DEFAULT 3
);
GRANT SELECT ON public.overdue_thresholds TO authenticated;
GRANT ALL ON public.overdue_thresholds TO service_role;
ALTER TABLE public.overdue_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "thresholds read" ON public.overdue_thresholds FOR SELECT TO authenticated USING (true);
CREATE POLICY "thresholds write" ON public.overdue_thresholds FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT INSERT, UPDATE, DELETE ON public.overdue_thresholds TO authenticated;

CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  is_important BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notices read" ON public.notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "notices write" ON public.notices FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.resolution_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.resolution_feedback TO authenticated;
GRANT ALL ON public.resolution_feedback TO service_role;
ALTER TABLE public.resolution_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback read" ON public.resolution_feedback FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.resident_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "feedback insert" ON public.resolution_feedback FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND c.resident_id = auth.uid()));

INSERT INTO public.overdue_thresholds (category, days) VALUES
  (NULL, 3), ('Security', 1), ('Housekeeping', 5), ('Elevator', 2);

CREATE OR REPLACE FUNCTION public.recalculate_overdue()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.complaints c
  SET is_overdue = (now() > c.created_at + (COALESCE(t.days, g.days) || ' days')::interval)
  FROM (SELECT days FROM public.overdue_thresholds WHERE category IS NULL LIMIT 1) g
  LEFT JOIN public.overdue_thresholds t ON t.category IS NOT NULL AND true
  WHERE c.status <> 'resolved' AND (t.category = c.category OR t.category IS NULL);
END; $$;
