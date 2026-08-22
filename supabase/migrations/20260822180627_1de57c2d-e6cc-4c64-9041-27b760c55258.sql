
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_overdue() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.recalculate_overdue()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  default_days integer;
BEGIN
  SELECT days INTO default_days FROM public.overdue_thresholds WHERE category IS NULL LIMIT 1;
  default_days := COALESCE(default_days, 3);
  UPDATE public.complaints c
  SET is_overdue = now() > c.created_at + (
    COALESCE((SELECT t.days FROM public.overdue_thresholds t WHERE t.category = c.category), default_days) || ' days'
  )::interval
  WHERE c.status <> 'resolved';
END; $$;
REVOKE ALL ON FUNCTION public.recalculate_overdue() FROM PUBLIC, anon, authenticated;
