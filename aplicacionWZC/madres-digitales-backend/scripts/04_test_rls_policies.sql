-- =====================================================
-- PASO 4: TESTING DE POLÍTICAS RLS
-- =====================================================
-- Script para verificar que las políticas funcionan correctamente

-- =====================================================
-- PREPARAR DATOS DE PRUEBA
-- =====================================================

-- Crear usuarios de prueba (si no existen)
INSERT INTO public.usuarios (id, nombre, email, password_hash, rol, activo)
VALUES 
    ('test_admin_001', 'Admin Test', 'admin.test@example.com', 'hash_test', 'ADMIN', true),
    ('test_madrina_a', 'Madrina A Test', 'madrina.a@example.com', 'hash_test', 'MADRINA', true),
    ('test_madrina_b', 'Madrina B Test', 'madrina.b@example.com', 'hash_test', 'MADRINA', true)
ON CONFLICT (id) DO NOTHING;

-- Crear gestantes de prueba
INSERT INTO public.gestantes (id, nombre, documento, fecha_nacimiento, regimen_salud, madrina_id, activa)
VALUES
    ('gest_test_a1', 'Gestante A1', '1001', '1990-01-01', 'Contributivo', 'test_madrina_a', true),
    ('gest_test_a2', 'Gestante A2', '1002', '1992-05-15', 'Contributivo', 'test_madrina_a', true),
    ('gest_test_b1', 'Gestante B1', '1003', '1995-03-20', 'Subsidiado', 'test_madrina_b', true)
ON CONFLICT (id) DO NOTHING;

-- Crear controles de prueba
INSERT INTO public.control_prenatal (id, gestante_id, fecha_control, semanas_gestacion, peso)
VALUES
    ('ctrl_test_a1', 'gest_test_a1', NOW(), 12, 65.5),
    ('ctrl_test_a2', 'gest_test_a2', NOW(), 20, 70.0),
    ('ctrl_test_b1', 'gest_test_b1', NOW(), 15, 68.0)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TEST 1: ADMIN - Debe ver TODAS las gestantes
-- =====================================================
SELECT '=== TEST 1: ADMIN - Ver todas las gestantes ===' as test;

-- Establecer contexto de admin
SELECT public.set_app_context('test_admin_001', 'ADMIN');

-- Verificar contexto
SELECT * FROM public.get_app_context();

-- Consultar gestantes (debe retornar 3)
SELECT 
    id, 
    nombre, 
    madrina_id,
    'Admin debe ver esta gestante' as nota
FROM public.gestantes 
WHERE id LIKE 'gest_test_%'
ORDER BY id;

-- Consultar controles (debe retornar 3)
SELECT 
    id, 
    gestante_id,
    'Admin debe ver este control' as nota
FROM public.control_prenatal 
WHERE id LIKE 'ctrl_test_%'
ORDER BY id;

-- Limpiar contexto
SELECT public.clear_app_context();

-- =====================================================
-- TEST 2: MADRINA A - Solo sus gestantes
-- =====================================================
SELECT '=== TEST 2: MADRINA A - Solo sus gestantes ===' as test;

-- Establecer contexto de madrina A
SELECT public.set_app_context('test_madrina_a', 'MADRINA');

-- Verificar contexto
SELECT * FROM public.get_app_context();

-- Consultar gestantes (debe retornar 2: gest_test_a1, gest_test_a2)
SELECT 
    id, 
    nombre, 
    madrina_id,
    'Madrina A debe ver esta gestante' as nota
FROM public.gestantes 
WHERE id LIKE 'gest_test_%'
ORDER BY id;

-- Consultar controles (debe retornar 2: ctrl_test_a1, ctrl_test_a2)
SELECT 
    id, 
    gestante_id,
    'Madrina A debe ver este control' as nota
FROM public.control_prenatal 
WHERE id LIKE 'ctrl_test_%'
ORDER BY id;

-- Intentar ver gestante de otra madrina (debe retornar 0 filas)
SELECT 
    id, 
    nombre,
    'ERROR: Madrina A NO debería ver esto' as nota
FROM public.gestantes 
WHERE id = 'gest_test_b1';

-- Limpiar contexto
SELECT public.clear_app_context();

-- =====================================================
-- TEST 3: MADRINA B - Solo sus gestantes
-- =====================================================
SELECT '=== TEST 3: MADRINA B - Solo sus gestantes ===' as test;

-- Establecer contexto de madrina B
SELECT public.set_app_context('test_madrina_b', 'MADRINA');

-- Verificar contexto
SELECT * FROM public.get_app_context();

-- Consultar gestantes (debe retornar 1: gest_test_b1)
SELECT 
    id, 
    nombre, 
    madrina_id,
    'Madrina B debe ver esta gestante' as nota
FROM public.gestantes 
WHERE id LIKE 'gest_test_%'
ORDER BY id;

-- Consultar controles (debe retornar 1: ctrl_test_b1)
SELECT 
    id, 
    gestante_id,
    'Madrina B debe ver este control' as nota
FROM public.control_prenatal 
WHERE id LIKE 'ctrl_test_%'
ORDER BY id;

-- Intentar ver gestantes de otra madrina (debe retornar 0 filas)
SELECT 
    id, 
    nombre,
    'ERROR: Madrina B NO debería ver esto' as nota
FROM public.gestantes 
WHERE id IN ('gest_test_a1', 'gest_test_a2');

-- Limpiar contexto
SELECT public.clear_app_context();

-- =====================================================
-- TEST 4: UPDATE - Madrina solo puede actualizar sus gestantes
-- =====================================================
SELECT '=== TEST 4: UPDATE - Permisos de actualización ===' as test;

-- Establecer contexto de madrina A
SELECT public.set_app_context('test_madrina_a', 'MADRINA');

-- Intentar actualizar su propia gestante (debe funcionar)
UPDATE public.gestantes 
SET telefono = '3001234567'
WHERE id = 'gest_test_a1';

-- Verificar actualización
SELECT id, nombre, telefono, 'Actualización exitosa' as nota
FROM public.gestantes 
WHERE id = 'gest_test_a1';

-- Intentar actualizar gestante de otra madrina (debe fallar - 0 filas afectadas)
UPDATE public.gestantes 
SET telefono = '3009999999'
WHERE id = 'gest_test_b1';

-- Verificar que NO se actualizó (madrina A no puede ver esta gestante)
SELECT public.clear_app_context();
SELECT public.set_app_context('test_admin_001', 'ADMIN');
SELECT id, nombre, telefono, 
    CASE 
        WHEN telefono = '3009999999' THEN 'ERROR: Se actualizó incorrectamente'
        ELSE 'OK: No se actualizó (correcto)'
    END as resultado
FROM public.gestantes 
WHERE id = 'gest_test_b1';

-- Limpiar contexto
SELECT public.clear_app_context();

-- =====================================================
-- TEST 5: INSERT - Madrina solo puede crear gestantes asignadas a ella
-- =====================================================
SELECT '=== TEST 5: INSERT - Permisos de creación ===' as test;

-- Establecer contexto de madrina A
SELECT public.set_app_context('test_madrina_a', 'MADRINA');

-- Intentar crear gestante asignada a ella misma (debe funcionar)
INSERT INTO public.gestantes (id, nombre, documento, fecha_nacimiento, regimen_salud, madrina_id, activa)
VALUES ('gest_test_a3', 'Gestante A3', '1004', '1993-07-10', 'Contributivo', 'test_madrina_a', true);

-- Verificar creación
SELECT id, nombre, madrina_id, 'Creación exitosa' as nota
FROM public.gestantes 
WHERE id = 'gest_test_a3';

-- Intentar crear gestante asignada a otra madrina (debe fallar)
DO $$
BEGIN
    INSERT INTO public.gestantes (id, nombre, documento, fecha_nacimiento, regimen_salud, madrina_id, activa)
    VALUES ('gest_test_fail', 'Gestante Fail', '1005', '1994-08-15', 'Subsidiado', 'test_madrina_b', true);
    RAISE NOTICE 'ERROR: Se permitió crear gestante de otra madrina';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'OK: Se bloqueó correctamente la creación de gestante de otra madrina';
END $$;

-- Limpiar contexto
SELECT public.clear_app_context();

-- =====================================================
-- TEST 6: DELETE - Solo admin puede eliminar
-- =====================================================
SELECT '=== TEST 6: DELETE - Solo admin puede eliminar ===' as test;

-- Establecer contexto de madrina A
SELECT public.set_app_context('test_madrina_a', 'MADRINA');

-- Intentar eliminar su propia gestante (debe fallar - 0 filas afectadas)
DELETE FROM public.gestantes WHERE id = 'gest_test_a3';

-- Verificar que NO se eliminó
SELECT public.clear_app_context();
SELECT public.set_app_context('test_admin_001', 'ADMIN');
SELECT id, nombre, 
    CASE 
        WHEN id IS NOT NULL THEN 'OK: No se eliminó (correcto)'
        ELSE 'ERROR: Se eliminó incorrectamente'
    END as resultado
FROM public.gestantes 
WHERE id = 'gest_test_a3';

-- Admin sí puede eliminar
DELETE FROM public.gestantes WHERE id = 'gest_test_a3';

-- Verificar eliminación
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'OK: Admin eliminó correctamente'
        ELSE 'ERROR: No se eliminó'
    END as resultado
FROM public.gestantes 
WHERE id = 'gest_test_a3';

-- Limpiar contexto
SELECT public.clear_app_context();

-- =====================================================
-- TEST 7: Sin contexto - No debe retornar datos
-- =====================================================
SELECT '=== TEST 7: Sin contexto - No debe retornar datos ===' as test;

-- Limpiar contexto completamente
SELECT public.clear_app_context();

-- Intentar consultar sin contexto (debe retornar 0 filas)
SELECT 
    COUNT(*) as total_gestantes,
    CASE 
        WHEN COUNT(*) = 0 THEN 'OK: Sin contexto no retorna datos'
        ELSE 'ERROR: Retorna datos sin contexto'
    END as resultado
FROM public.gestantes 
WHERE id LIKE 'gest_test_%';

-- =====================================================
-- TEST 8: Funciones auxiliares
-- =====================================================
SELECT '=== TEST 8: Funciones auxiliares ===' as test;

-- Test can_view_all_data()
SELECT public.set_app_context('test_admin_001', 'ADMIN');
SELECT public.can_view_all_data() as admin_can_view_all;

SELECT public.set_app_context('test_madrina_a', 'MADRINA');
SELECT public.can_view_all_data() as madrina_can_view_all;

-- Test count_visible_gestantes()
SELECT public.set_app_context('test_admin_001', 'ADMIN');
SELECT public.count_visible_gestantes() as admin_count;

SELECT public.set_app_context('test_madrina_a', 'MADRINA');
SELECT public.count_visible_gestantes() as madrina_a_count;

SELECT public.set_app_context('test_madrina_b', 'MADRINA');
SELECT public.count_visible_gestantes() as madrina_b_count;

-- Test can_access_gestante()
SELECT public.set_app_context('test_madrina_a', 'MADRINA');
SELECT 
    public.can_access_gestante('gest_test_a1') as puede_acceder_a1,
    public.can_access_gestante('gest_test_b1') as puede_acceder_b1;

-- Limpiar contexto
SELECT public.clear_app_context();

-- =====================================================
-- LIMPIAR DATOS DE PRUEBA
-- =====================================================
SELECT '=== LIMPIANDO DATOS DE PRUEBA ===' as test;

-- Establecer contexto de admin para poder eliminar
SELECT public.set_app_context('test_admin_001', 'ADMIN');

-- Eliminar controles de prueba
DELETE FROM public.control_prenatal WHERE id LIKE 'ctrl_test_%';

-- Eliminar gestantes de prueba
DELETE FROM public.gestantes WHERE id LIKE 'gest_test_%';

-- Eliminar usuarios de prueba
DELETE FROM public.usuarios WHERE id LIKE 'test_%';

-- Limpiar contexto
SELECT public.clear_app_context();

SELECT 'TESTS COMPLETADOS' as resultado;

-- =====================================================
-- RESUMEN DE RESULTADOS ESPERADOS
-- =====================================================
/*
TEST 1 (ADMIN): Debe ver 3 gestantes y 3 controles
TEST 2 (MADRINA A): Debe ver 2 gestantes y 2 controles
TEST 3 (MADRINA B): Debe ver 1 gestante y 1 control
TEST 4 (UPDATE): Madrina A actualiza su gestante, no puede actualizar de otra madrina
TEST 5 (INSERT): Madrina A crea gestante para ella, falla al crear para otra madrina
TEST 6 (DELETE): Madrina no puede eliminar, Admin sí puede
TEST 7 (SIN CONTEXTO): No retorna datos
TEST 8 (FUNCIONES): Todas las funciones auxiliares funcionan correctamente
*/
