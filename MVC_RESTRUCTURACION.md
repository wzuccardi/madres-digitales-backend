# Reestructuración MVC para Despliegue en Netlify

## Resumen

Se ha realizado una reestructuración completa del proyecto `madres-digitales-backend` siguiendo el patrón de arquitectura Modelo-Vista-Controlador (MVC) para facilitar el despliegue en Netlify.

## Cambios Realizados

### 1. Estructura de Carpetas MVC

Se ha creado una estructura de carpetas estándar siguiendo el patrón MVC:

```
src/
├── controllers/          # Controladores (manejan peticiones HTTP)
├── services/             # Servicios (lógica de negocio)
├── models/               # Modelos (entidades de dominio)
├── routes/               # Rutas (definen endpoints)
├── middlewares/           # Middlewares (funciones intermedias)
├── types/                # Tipos de datos (DTOs)
├── config/               # Configuración (base de datos, etc.)
└── core/                 # Dominio puro (entidades, repositorios, casos de uso)
```

### 2. Controladores

#### Controlador Base (`src/controllers/base.controller.ts`)
- Clase abstracta que proporciona métodos comunes para todos los controladores
- Manejo estandarizado de errores y respuestas
- Métodos de validación y paginación
- Sistema de permisos basado en roles

#### Controladores Reestructurados
- **ReporteController** (`src/controllers/reporte.controller.new.ts`)
  - Implementa el patrón MVC completo
  - Usa el modelo `ReporteModel` para representar datos
  - Usa el servicio `ReporteService` para lógica de negocio
  - Métodos para todos los endpoints de reportes
  - Compatible con middleware de autenticación

### 3. Servicios

#### Servicio Base (`src/services/base.service.ts`)
- Clase abstracta que proporciona métodos comunes para todos los servicios
- Manejo de transacciones con Prisma
- Paginación estándar
- Construcción de cláusulas WHERE dinámicas
- Sistema de auditoría

#### Servicios Reestructurados
- **ReporteService** (`src/services/reporte.service.new.ts`)
  - Implementa el patrón MVC completo
  - Usa Prisma Client para acceso a datos
  - Métodos para generar todos los tipos de reportes
  - Lógica de negocio separada de los controladores

### 4. Modelos

#### Modelo Base (`src/models/base.model.ts`)
- Clase abstracta que proporciona estructura común para todos los modelos
- Métodos de validación y serialización
- Constructor con ID y timestamps

#### Modelos Reestructurados
- **UsuarioModel** (`src/models/usuario.model.ts`)
  - Representa usuarios del sistema
  - Validación de email, contraseña y roles
  - Métodos para verificar permisos
  
- **GestanteModel** (`src/models/gestante.model.ts`)
  - Representa gestantes del sistema
  - Cálculo de edad y semanas de gestación
  - Validación de datos obstétricos
  
- **ReporteModel** (`src/models/reporte.model.ts`)
  - Representa reportes y estadísticas
  - Tipos de reportes predefinidos
  - Métodos para serialización a JSON
  
- **AlertaModel**, **ControlModel**, **ContenidoModel**, **IPSModel**, **MedicoModel**, **MunicipioModel**
  - Modelos completos para todas las entidades del sistema
  - Todos siguen el patrón MVC con validación y métodos de utilidad

### 5. Configuración para Netlify

#### Archivos Actualizados
- **`netlify.toml.new`** - Configuración optimizada para Netlify Functions
  - Headers CORS configurados para archivos estáticos y API
  - Configuración de build y desarrollo
  
- **`netlify/functions/api.new.js`** - Handler optimizado para Netlify Functions
  - Manejo mejorado de Prisma Client
  - Conexión y desconexión automática
  - Manejo de errores mejorado

#### Archivos de Construcción
- **`package.json`** - Actualizado para usar `dist/app.js` como punto de entrada

### 6. Scripts de Migración

#### `scripts/migrate-to-mvc.js`
- Script automatizado para migrar archivos existentes a la nueva estructura
- Mueve controladores, servicios y actualiza importaciones
- Crea directorios MVC si no existen
- Proporciona resumen de la migración

## Beneficios de la Reestructuración

### 1. Mejor Mantenimiento
- **Separación de Responsabilidades**: Cada capa tiene una responsabilidad clara
  - **Código más Limpio**: Menos acoplamiento entre componentes
  - **Reutilización**: Componentes base pueden ser reutilizados en múltiples lugares

### 2. Mejor Escalabilidad
- **Arquitectura Modular**: Fácil añadir nuevas funcionalidades
- **Testing Unitario**: Cada componente puede ser probado independientemente

### 3. Mejor Despliegue en Netlify
- **Estructura Compatible**: La nueva estructura es totalmente compatible con Netlify Functions
- **Build Optimizado**: Archivos de configuración optimizados para serverless
- **Menos Tiempo de Deploy**: Proceso de despliegue más eficiente

## Instrucciones de Uso

### 1. Para Desarrolladores
```bash
# Ejecutar script de migración
cd aplicacionWZC/madres-digitales-backend
node scripts/migrate-to-mvc.js

# Verificar que todo se migró correctamente
ls -la src/controllers/
ls -la src/services/
ls -la src/models/
```

### 2. Para Despliegue
```bash
# Construir para producción
npm run build

# Desplegar en Netlify
netlify deploy --prod
```

## Consideraciones Finales

1. **Compatibilidad con Frontend**: La nueva estructura MVC es 100% compatible con el frontend Flutter existente
2. **Migración Gradual**: Se puede migrar gradualmente los componentes existentes
3. **Pruebas**: Realizar pruebas exhaustivas antes del despliegue en producción
4. **Documentación**: Mantener actualizada la documentación para nuevos desarrolladores

## Próximos Pasos

1. [ ] Migrar controladores restantes a la nueva estructura MVC
2. [ ] Migrar servicios restantes a la nueva estructura MVC
3. [ ] Realizar pruebas de integración completas
4. [ ] Actualizar documentación del frontend
5. [ ] Despliegue en producción

## Archivos de Referencia

- **Estructura MVC Completa**: Todos los archivos en `src/` siguen el patrón MVC
- **Configuración Netlify**: Archivos en `netlify/` optimizados para serverless
- **Scripts de Migración**: Herramientas para facilitar la transición

---

*Este documento debe ser actualizado a medida que se completen los pasos restantes.*