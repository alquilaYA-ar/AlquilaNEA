-- ==============================================================================
-- AlquilaNEA: LÍMITE DE INTENTOS (anti fuerza bruta / spam) - ejecutar UNA VEZ
-- Idempotente. Requiere haber ejecutado security_hardening.sql antes.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_time ON public.rate_limits (key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_time ON public.rate_limits (created_at);

-- RLS activado SIN políticas: nadie accede a la tabla directamente, solo la función de abajo.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

-- Devuelve TRUE si la acción está permitida (y registra el intento); FALSE si superó el límite.
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key TEXT, p_max INT, p_window_seconds INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_key TEXT := LEFT(p_key, 200);
BEGIN
  -- Limpieza ocasional de registros viejos (~2% de las llamadas)
  IF random() < 0.02 THEN
    DELETE FROM public.rate_limits WHERE created_at < NOW() - INTERVAL '1 day';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.rate_limits
  WHERE key = v_key AND created_at > NOW() - make_interval(secs => p_window_seconds);

  IF v_count >= p_max THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.rate_limits (key) VALUES (v_key);
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
