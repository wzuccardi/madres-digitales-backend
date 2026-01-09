-- =====================================================
-- PASO 2: CREAR POLÍTICAS DE SEGURIDAD (RLS POLICIES)
-- =====================================================
-- Este script crea las políticas que controlan el acceso a nivel de fila

-- =====================================================
-- POLÍTICAS PARA TABLA: gestantes
-- =====================================================

-- Política de lectura (SELECT)
DROP POLICY IF EXISTS gestantes_select_policy ON public.gestantes;
CREATE POLICY gestantes_select_policy ON public.gestantes
    FOR SELECT
    TO public
    USING (
        -- Administradores y super_admin tienen acceso global
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas solo ven sus gestantes asignadas
        (current_setting('app.current_user_rol', true) = 'MADRINA' 
         AND madrina_id = current_setting('app.current_user_id', true))
    );

-- Política de inserción (INSERT)
DROP POLICY IF EXISTS gestantes_insert_policy ON public.gestantes;
CREATE POLICY gestantes_insert_policy ON public.gestantes
    FOR INSERT
    TO public
    WITH CHECK (
        -- Solo administradores y coordinadores pueden crear gestantes
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas pueden crear gestantes asignadas a ellas mismas
        (current_setting('app.current_user_rol', true) = 'MADRINA' 
         AND madrina_id = current_setting('app.current_user_id', true))
    );

-- Política de actualización (UPDATE)
DROP POLICY IF EXISTS gestantes_update_policy ON public.gestantes;
CREATE POLICY gestantes_update_policy ON public.gestantes
    FOR UPDATE
    TO public
    USING (
        -- Administradores y coordinadores pueden actualizar cualquier gestante
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas solo pueden actualizar sus gestantes asignadas
        (current_setting('app.current_user_rol', true) = 'MADRINA' 
         AND madrina_id = current_setting('app.current_user_id', true))
    )
    WITH CHECK (
        -- Asegurar que después de la actualización sigue cumpliendo las reglas
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        (current_setting('app.current_user_rol', true) = 'MADRINA' 
         AND madrina_id = current_setting('app.current_user_id', true))
    );

-- Política de eliminación (DELETE)
DROP POLICY IF EXISTS gestantes_delete_policy ON public.gestantes;
CREATE POLICY gestantes_delete_policy ON public.gestantes
    FOR DELETE
    TO public
    USING (
        -- Solo administradores pueden eliminar gestantes
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN')
    );

-- =====================================================
-- POLÍTICAS PARA TABLA: control_prenatal
-- =====================================================

-- Política de lectura (SELECT)
DROP POLICY IF EXISTS controles_select_policy ON public.control_prenatal;
CREATE POLICY controles_select_policy ON public.control_prenatal
    FOR SELECT
    TO public
    USING (
        -- Administradores y coordinadores tienen acceso global
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas solo ven controles de sus gestantes (con subconsulta)
        (current_setting('app.current_user_rol', true) = 'MADRINA'
         AND gestante_id IN (
             SELECT id FROM public.gestantes 
             WHERE madrina_id = current_setting('app.current_user_id', true)
         ))
        OR
        -- Médicos ven controles que ellos crearon
        (current_setting('app.current_user_rol', true) = 'MEDICO'
         AND medico_id = current_setting('app.current_user_id', true))
    );

-- Política de inserción (INSERT)
DROP POLICY IF EXISTS controles_insert_policy ON public.control_prenatal;
CREATE POLICY controles_insert_policy ON public.control_prenatal
    FOR INSERT
    TO public
    WITH CHECK (
        -- Administradores y coordinadores pueden crear cualquier control
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas solo pueden crear controles de sus gestantes
        (current_setting('app.current_user_rol', true) = 'MADRINA'
         AND gestante_id IN (
             SELECT id FROM public.gestantes 
             WHERE madrina_id = current_setting('app.current_user_id', true)
         ))
        OR
        -- Médicos pueden crear controles
        current_setting('app.current_user_rol', true) = 'MEDICO'
    );

-- Política de actualización (UPDATE)
DROP POLICY IF EXISTS controles_update_policy ON public.control_prenatal;
CREATE POLICY controles_update_policy ON public.control_prenatal
    FOR UPDATE
    TO public
    USING (
        -- Administradores y coordinadores pueden actualizar cualquier control
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas solo pueden actualizar controles de sus gestantes
        (current_setting('app.current_user_rol', true) = 'MADRINA'
         AND gestante_id IN (
             SELECT id FROM public.gestantes 
             WHERE madrina_id = current_setting('app.current_user_id', true)
         ))
        OR
        -- Médicos pueden actualizar sus propios controles
        (current_setting('app.current_user_rol', true) = 'MEDICO'
         AND medico_id = current_setting('app.current_user_id', true))
    )
    WITH CHECK (
        -- Asegurar que después de la actualización sigue cumpliendo las reglas
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        (current_setting('app.current_user_rol', true) = 'MADRINA'
         AND gestante_id IN (
             SELECT id FROM public.gestantes 
             WHERE madrina_id = current_setting('app.current_user_id', true)
         ))
        OR
        (current_setting('app.current_user_rol', true) = 'MEDICO'
         AND medico_id = current_setting('app.current_user_id', true))
    );

-- Política de eliminación (DELETE)
DROP POLICY IF EXISTS controles_delete_policy ON public.control_prenatal;
CREATE POLICY controles_delete_policy ON public.control_prenatal
    FOR DELETE
    TO public
    USING (
        -- Solo administradores pueden eliminar controles
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN')
    );

-- =====================================================
-- POLÍTICAS PARA TABLA: alertas (OPCIONAL)
-- =====================================================

-- Política de lectura (SELECT)
DROP POLICY IF EXISTS alertas_select_policy ON public.alertas;
CREATE POLICY alertas_select_policy ON public.alertas
    FOR SELECT
    TO public
    USING (
        -- Administradores y coordinadores tienen acceso global
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas solo ven alertas de sus gestantes
        (current_setting('app.current_user_rol', true) = 'MADRINA'
         AND gestante_id IN (
             SELECT id FROM public.gestantes 
             WHERE madrina_id = current_setting('app.current_user_id', true)
         ))
        OR
        -- Médicos ven alertas asignadas a ellos
        (current_setting('app.current_user_rol', true) = 'MEDICO'
         AND medico_asignado_id = current_setting('app.current_user_id', true))
    );

-- Política de inserción (INSERT)
DROP POLICY IF EXISTS alertas_insert_policy ON public.alertas;
CREATE POLICY alertas_insert_policy ON public.alertas
    FOR INSERT
    TO public
    WITH CHECK (
        -- Administradores y coordinadores pueden crear cualquier alerta
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas solo pueden crear alertas de sus gestantes
        (current_setting('app.current_user_rol', true) = 'MADRINA'
         AND gestante_id IN (
             SELECT id FROM public.gestantes 
             WHERE madrina_id = current_setting('app.current_user_id', true)
         ))
        OR
        -- Médicos pueden crear alertas
        current_setting('app.current_user_rol', true) = 'MEDICO'
    );

-- Política de actualización (UPDATE)
DROP POLICY IF EXISTS alertas_update_policy ON public.alertas;
CREATE POLICY alertas_update_policy ON public.alertas
    FOR UPDATE
    TO public
    USING (
        -- Administradores y coordinadores pueden actualizar cualquier alerta
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR')
        OR
        -- Madrinas solo pueden actualizar alertas de sus gestantes
        (current_setting('app.current_user_rol', true) = 'MADRINA'
         AND gestante_id IN (
             SELECT id FROM public.gestantes 
             WHERE madrina_id = current_setting('app.current_user_id', true)
         ))
        OR
        -- Médicos pueden actualizar alertas asignadas a ellos
        (current_setting('app.current_user_rol', true) = 'MEDICO'
         AND medico_asignado_id = current_setting('app.current_user_id', true))
    );

-- Política de eliminación (DELETE)
DROP POLICY IF EXISTS alertas_delete_policy ON public.alertas;
CREATE POLICY alertas_delete_policy ON public.alertas
    FOR DELETE
    TO public
    USING (
        -- Solo administradores pueden eliminar alertas
        current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN')
    );

-- =====================================================
-- VERIFICAR POLÍTICAS CREADAS
-- =====================================================
SELECT 
    schemaname, 
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas')
    AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Resultado esperado:
-- Debe mostrar todas las políticas creadas para cada tabla
