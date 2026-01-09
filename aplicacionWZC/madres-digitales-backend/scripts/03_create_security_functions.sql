-- =====================================================
-- PASO 3: CREAR FUNCIONES DE SEGURIDAD
-- =====================================================
-- Funciones auxiliares para establecer y gestionar el contexto de seguridad

-- =====================================================
-- FUNCIÓN: Establecer contexto de seguridad
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_app_context(
    user_id text,
    user_rol text
)
RETURNS void AS $$
BEGIN
    -- Validar que el rol sea válido
    IF user_rol NOT IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR', 'MADRINA', 'MEDICO') THEN
        RAISE EXCEPTION 'Rol inválido: %. Roles válidos: SUPER_ADMIN, ADMIN, COORDINADOR, MADRINA, MEDICO', user_rol;
    END IF;

    -- Establecer variables de sesión
    PERFORM set_config('app.current_user_id', user_id, false);
    PERFORM set_config('app.current_user_rol', user_rol, false);
    
    -- Log para debugging (opcional, comentar en producción)
    RAISE NOTICE 'Contexto establecido: user_id=%, rol=%', user_id, user_rol;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Limpiar contexto de seguridad
-- =====================================================
CREATE OR REPLACE FUNCTION public.clear_app_context()
RETURNS void AS $$
BEGIN
    -- Limpiar variables de sesión
    PERFORM set_config('app.current_user_id', '', false);
    PERFORM set_config('app.current_user_rol', '', false);
    
    -- Log para debugging (opcional, comentar en producción)
    RAISE NOTICE 'Contexto limpiado';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Obtener contexto actual
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_app_context()
RETURNS TABLE(user_id text, user_rol text) AS $$
BEGIN
    RETURN QUERY SELECT 
        current_setting('app.current_user_id', true) as user_id,
        current_setting('app.current_user_rol', true) as user_rol;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Verificar si el usuario actual puede ver todos los datos
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_view_all_data()
RETURNS boolean AS $$
BEGIN
    RETURN current_setting('app.current_user_rol', true) IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Obtener gestantes visibles para el usuario actual
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_visible_gestantes()
RETURNS TABLE(
    id text,
    nombre text,
    documento text,
    madrina_id text,
    municipio_id text,
    activa boolean
) AS $$
BEGIN
    -- Si es admin/coordinador, retorna todas
    IF public.can_view_all_data() THEN
        RETURN QUERY SELECT 
            g.id,
            g.nombre,
            g.documento,
            g.madrina_id,
            g.municipio_id,
            g.activa
        FROM public.gestantes g;
    ELSE
        -- Si es madrina, solo sus gestantes
        RETURN QUERY SELECT 
            g.id,
            g.nombre,
            g.documento,
            g.madrina_id,
            g.municipio_id,
            g.activa
        FROM public.gestantes g
        WHERE g.madrina_id = current_setting('app.current_user_id', true);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Contar gestantes visibles para el usuario actual
-- =====================================================
CREATE OR REPLACE FUNCTION public.count_visible_gestantes()
RETURNS integer AS $$
DECLARE
    total integer;
BEGIN
    -- Si es admin/coordinador, cuenta todas
    IF public.can_view_all_data() THEN
        SELECT COUNT(*) INTO total FROM public.gestantes;
    ELSE
        -- Si es madrina, solo sus gestantes
        SELECT COUNT(*) INTO total 
        FROM public.gestantes 
        WHERE madrina_id = current_setting('app.current_user_id', true);
    END IF;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Verificar si el usuario puede acceder a una gestante específica
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_access_gestante(gestante_id_param text)
RETURNS boolean AS $$
DECLARE
    gestante_madrina_id text;
    user_rol text;
    user_id text;
BEGIN
    -- Obtener contexto actual
    user_id := current_setting('app.current_user_id', true);
    user_rol := current_setting('app.current_user_rol', true);
    
    -- Admin/Coordinador puede acceder a todo
    IF user_rol IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR') THEN
        RETURN true;
    END IF;
    
    -- Obtener madrina_id de la gestante
    SELECT madrina_id INTO gestante_madrina_id 
    FROM public.gestantes 
    WHERE id = gestante_id_param;
    
    -- Verificar si la gestante pertenece al usuario
    RETURN gestante_madrina_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- OTORGAR PERMISOS DE EJECUCIÓN
-- =====================================================
GRANT EXECUTE ON FUNCTION public.set_app_context(text, text) TO public;
GRANT EXECUTE ON FUNCTION public.clear_app_context() TO public;
GRANT EXECUTE ON FUNCTION public.get_app_context() TO public;
GRANT EXECUTE ON FUNCTION public.can_view_all_data() TO public;
GRANT EXECUTE ON FUNCTION public.get_visible_gestantes() TO public;
GRANT EXECUTE ON FUNCTION public.count_visible_gestantes() TO public;
GRANT EXECUTE ON FUNCTION public.can_access_gestante(text) TO public;

-- =====================================================
-- VERIFICAR FUNCIONES CREADAS
-- =====================================================
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN (
    'set_app_context',
    'clear_app_context',
    'get_app_context',
    'can_view_all_data',
    'get_visible_gestantes',
    'count_visible_gestantes',
    'can_access_gestante'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
