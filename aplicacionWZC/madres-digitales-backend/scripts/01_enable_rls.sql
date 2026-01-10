-- =====================================================
-- PASO 1: ACTIVAR ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Este script habilita RLS en las tablas críticas del sistema
-- para garantizar que las madrinas solo puedan acceder a sus propias gestantes

-- Tabla principal de gestantes
ALTER TABLE public.gestantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestantes FORCE ROW LEVEL SECURITY;

-- Tabla de controles prenatales
ALTER TABLE public.control_prenatal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_prenatal FORCE ROW LEVEL SECURITY;

-- Tabla de alertas (opcional pero recomendado)
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas FORCE ROW LEVEL SECURITY;

-- Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas')
    AND schemaname = 'public';

-- Resultado esperado:
-- Todas las tablas deben tener rowsecurity = true y forcerowsecurity = true
