-- Script para configurar PostGIS en la base de datos
-- Ejecutar como superusuario de PostgreSQL

-- 1. Crear la extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Crear la extensión PostGIS Topology (opcional pero recomendada)
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 3. Crear la extensión PostGIS SFCGAL (opcional, para funciones 3D)
-- CREATE EXTENSION IF NOT EXISTS postgis_sfcgal;

-- 4. Verificar que PostGIS se instaló correctamente
SELECT PostGIS_Version();

-- 5. Crear índices espaciales para las tablas existentes
-- Índice espacial para municipios
CREATE INDEX IF NOT EXISTS idx_municipios_coordenadas_gist 
ON "Municipio" USING GIST (coordenadas);

-- Índice espacial para gestantes
CREATE INDEX IF NOT EXISTS idx_gestantes_coordenadas_gist 
ON "Gestante" USING GIST (coordenadas);

-- Índice espacial para IPS
CREATE INDEX IF NOT EXISTS idx_ips_coordenadas_gist 
ON "IPS" USING GIST (coordenadas);

-- Índice espacial para alertas
CREATE INDEX IF NOT EXISTS idx_alertas_coordenadas_gist 
ON "Alerta" USING GIST (coordenadas_alerta);

-- 6. Crear funciones auxiliares para cálculos geoespaciales

-- Función para calcular distancia en metros entre dos puntos
CREATE OR REPLACE FUNCTION calcular_distancia_metros(
    punto1 geometry,
    punto2 geometry
) RETURNS double precision AS $$
BEGIN
    -- Usar ST_Distance con proyección apropiada para Colombia (EPSG:3116)
    RETURN ST_Distance(
        ST_Transform(punto1, 3116),
        ST_Transform(punto2, 3116)
    );
END;
$$ LANGUAGE plpgsql;

-- Función para encontrar municipios cercanos
CREATE OR REPLACE FUNCTION encontrar_municipios_cercanos(
    latitud double precision,
    longitud double precision,
    radio_metros double precision DEFAULT 50000
) RETURNS TABLE(
    id text,
    nombre text,
    departamento text,
    distancia_metros double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.nombre,
        m.departamento,
        calcular_distancia_metros(
            ST_SetSRID(ST_MakePoint(longitud, latitud), 4326),
            m.coordenadas
        ) as distancia_metros
    FROM "Municipio" m
    WHERE m.activo = true
    AND m.coordenadas IS NOT NULL
    AND ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(longitud, latitud), 4326), 3116),
        ST_Transform(m.coordenadas, 3116),
        radio_metros
    )
    ORDER BY distancia_metros;
END;
$$ LANGUAGE plpgsql;

-- Función para encontrar IPS cercanas
CREATE OR REPLACE FUNCTION encontrar_ips_cercanas(
    latitud double precision,
    longitud double precision,
    radio_metros double precision DEFAULT 50000
) RETURNS TABLE(
    id text,
    nombre text,
    direccion text,
    telefono text,
    municipio_nombre text,
    distancia_metros double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.nombre,
        i.direccion,
        i.telefono,
        m.nombre as municipio_nombre,
        calcular_distancia_metros(
            ST_SetSRID(ST_MakePoint(longitud, latitud), 4326),
            i.coordenadas
        ) as distancia_metros
    FROM "IPS" i
    LEFT JOIN "Municipio" m ON i.municipio_id = m.id
    WHERE i.activo = true
    AND i.coordenadas IS NOT NULL
    AND ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(longitud, latitud), 4326), 3116),
        ST_Transform(i.coordenadas, 3116),
        radio_metros
    )
    ORDER BY distancia_metros;
END;
$$ LANGUAGE plpgsql;

-- Función para encontrar gestantes en un área
CREATE OR REPLACE FUNCTION encontrar_gestantes_en_area(
    latitud double precision,
    longitud double precision,
    radio_metros double precision DEFAULT 10000
) RETURNS TABLE(
    id text,
    nombre text,
    documento text,
    riesgo_alto boolean,
    municipio_nombre text,
    distancia_metros double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.nombre,
        g.documento,
        g.riesgo_alto,
        m.nombre as municipio_nombre,
        calcular_distancia_metros(
            ST_SetSRID(ST_MakePoint(longitud, latitud), 4326),
            g.coordenadas
        ) as distancia_metros
    FROM "Gestante" g
    LEFT JOIN "Municipio" m ON g.municipio_id = m.id
    WHERE g.activa = true
    AND g.coordenadas IS NOT NULL
    AND ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(longitud, latitud), 4326), 3116),
        ST_Transform(g.coordenadas, 3116),
        radio_metros
    )
    ORDER BY g.riesgo_alto DESC, distancia_metros;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un punto está dentro de un municipio
CREATE OR REPLACE FUNCTION punto_en_municipio(
    latitud double precision,
    longitud double precision,
    municipio_id text
) RETURNS boolean AS $$
DECLARE
    municipio_coords geometry;
    punto geometry;
    distancia double precision;
BEGIN
    -- Obtener coordenadas del municipio
    SELECT coordenadas INTO municipio_coords
    FROM "Municipio"
    WHERE id = municipio_id AND activo = true;
    
    IF municipio_coords IS NULL THEN
        RETURN false;
    END IF;
    
    -- Crear punto
    punto := ST_SetSRID(ST_MakePoint(longitud, latitud), 4326);
    
    -- Calcular distancia (consideramos que está "dentro" si está a menos de 5km del centro)
    distancia := calcular_distancia_metros(punto, municipio_coords);
    
    RETURN distancia <= 5000; -- 5km de tolerancia
END;
$$ LANGUAGE plpgsql;

-- 7. Crear vista para estadísticas geoespaciales
CREATE OR REPLACE VIEW vista_estadisticas_geoespaciales AS
SELECT 
    m.id as municipio_id,
    m.nombre as municipio_nombre,
    m.departamento,
    COUNT(DISTINCT g.id) as total_gestantes,
    COUNT(DISTINCT CASE WHEN g.riesgo_alto = true THEN g.id END) as gestantes_alto_riesgo,
    COUNT(DISTINCT i.id) as total_ips,
    COUNT(DISTINCT u.id) FILTER (WHERE u.rol = 'madrina') as total_madrinas,
    COUNT(DISTINCT u.id) FILTER (WHERE u.rol = 'medico') as total_medicos,
    ST_X(m.coordenadas) as longitud,
    ST_Y(m.coordenadas) as latitud
FROM "Municipio" m
LEFT JOIN "Gestante" g ON g.municipio_id = m.id AND g.activa = true
LEFT JOIN "IPS" i ON i.municipio_id = m.id AND i.activo = true
LEFT JOIN "Usuario" u ON u.municipio_id = m.id AND u.activo = true
WHERE m.activo = true
GROUP BY m.id, m.nombre, m.departamento, m.coordenadas;

-- 8. Comentarios sobre el uso
COMMENT ON FUNCTION calcular_distancia_metros IS 'Calcula la distancia en metros entre dos puntos geométricos usando proyección apropiada para Colombia';
COMMENT ON FUNCTION encontrar_municipios_cercanos IS 'Encuentra municipios cercanos a una coordenada dada dentro de un radio específico';
COMMENT ON FUNCTION encontrar_ips_cercanas IS 'Encuentra IPS cercanas a una coordenada dada dentro de un radio específico';
COMMENT ON FUNCTION encontrar_gestantes_en_area IS 'Encuentra gestantes en un área específica, priorizando las de alto riesgo';
COMMENT ON FUNCTION punto_en_municipio IS 'Verifica si un punto geográfico está dentro del área de influencia de un municipio';
COMMENT ON VIEW vista_estadisticas_geoespaciales IS 'Vista con estadísticas geoespaciales por municipio';

-- 9. Verificación final
SELECT 
    'PostGIS instalado correctamente' as mensaje,
    PostGIS_Version() as version_postgis,
    PostGIS_GEOS_Version() as version_geos,
    PostGIS_Proj_Version() as version_proj;
