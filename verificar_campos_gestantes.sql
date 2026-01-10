-- Verificar que los campos nuevos existen en la tabla gestantes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'gestantes' 
AND column_name IN ('grupo_sanguineo', 'barrio', 'foto_url', 'factores_riesgo', 'email', 'apellido')
ORDER BY column_name;
