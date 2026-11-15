-- ==============================================================================
-- CONTADOR DE VISITAS EN TIEMPO REAL (SECURITY DEFINER)
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.increment_visitas(prop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.propiedades
  SET visitas_count = COALESCE(visitas_count, 0) + 1
  WHERE id = prop_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_visitas(UUID) TO anon, authenticated, service_role;
