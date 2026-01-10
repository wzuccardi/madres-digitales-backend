#!/bin/bash

# =====================================================
# Script de Instalación Rápida de RLS
# =====================================================
# Este script ejecuta todos los pasos necesarios para
# implementar Row Level Security en la base de datos

echo "🔐 =========================================="
echo "🔐 INSTALACIÓN DE ROW LEVEL SECURITY (RLS)"
echo "🔐 =========================================="
echo ""

# Verificar que se proporcionó la URL de la base de datos
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: Variable DATABASE_URL no está definida"
    echo "💡 Uso: DATABASE_URL='postgresql://user:pass@host:port/db' ./install_rls.sh"
    exit 1
fi

echo "✅ DATABASE_URL detectada"
echo ""

# Función para ejecutar un script SQL
execute_sql() {
    local script_name=$1
    local script_path="./scripts/$script_name"
    
    echo "📄 Ejecutando: $script_name"
    
    if [ ! -f "$script_path" ]; then
        echo "❌ Error: No se encontró el archivo $script_path"
        return 1
    fi
    
    psql "$DATABASE_URL" -f "$script_path"
    
    if [ $? -eq 0 ]; then
        echo "✅ $script_name ejecutado exitosamente"
        echo ""
        return 0
    else
        echo "❌ Error ejecutando $script_name"
        echo ""
        return 1
    fi
}

# Paso 1: Habilitar RLS
echo "🔒 PASO 1: Habilitando Row Level Security..."
execute_sql "01_enable_rls.sql"
if [ $? -ne 0 ]; then
    echo "❌ Falló el Paso 1. Abortando instalación."
    exit 1
fi

# Paso 2: Crear políticas
echo "📋 PASO 2: Creando políticas de seguridad..."
execute_sql "02_create_rls_policies.sql"
if [ $? -ne 0 ]; then
    echo "❌ Falló el Paso 2. Abortando instalación."
    exit 1
fi

# Paso 3: Crear funciones
echo "⚙️ PASO 3: Creando funciones de seguridad..."
execute_sql "03_create_security_functions.sql"
if [ $? -ne 0 ]; then
    echo "❌ Falló el Paso 3. Abortando instalación."
    exit 1
fi

# Paso 4: Ejecutar tests (opcional)
echo "🧪 PASO 4: Ejecutando tests de verificación..."
echo "⚠️ Los tests crearán y eliminarán datos de prueba"
read -p "¿Desea ejecutar los tests? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    execute_sql "04_test_rls_policies.sql"
    if [ $? -eq 0 ]; then
        echo "✅ Tests completados exitosamente"
    else
        echo "⚠️ Algunos tests fallaron. Revise los resultados."
    fi
else
    echo "⏭️ Tests omitidos"
fi

echo ""
echo "🎉 =========================================="
echo "🎉 INSTALACIÓN COMPLETADA"
echo "🎉 =========================================="
echo ""
echo "📝 Próximos pasos:"
echo "   1. Reiniciar el servidor backend"
echo "   2. Verificar logs de aplicación"
echo "   3. Probar con diferentes roles de usuario"
echo ""
echo "📚 Documentación: IMPLEMENTACION_RLS.md"
echo ""
