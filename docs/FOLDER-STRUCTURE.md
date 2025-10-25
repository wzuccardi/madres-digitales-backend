# 📁 Estructura de Carpetas - Madres Digitales Backend

## Índice

1. [Visión General](#visión-general)
2. [Estructura Completa](#estructura-completa)
3. [Descripción de Carpetas](#descripción-de-carpetas)
4. [Convenciones de Nombres](#convenciones-de-nombres)
5. [Guía de Ubicación](#guía-de-ubicación)

---

## Visión General

El proyecto sigue **Clean Architecture** con separación clara de responsabilidades:

```
src/
├── core/                    # Capa de Dominio y Aplicación
│   ├── domain/             # Lógica de negocio pura
│   └── application/        # Casos de uso
├── infrastructure/         # Implementaciones de infraestructura
├── controllers/            # Controladores HTTP
├── routes/                 # Definición de rutas
├── middlewares/            # Middlewares Express
├── services/               # Servicios de aplicación
├── config/                 # Configuración
├── scripts/                # Scripts utilitarios
└── app.ts                  # Punto de entrada
```

---

## Estructura Completa

```
madres-digitales-backend/
│
├── src/
│   │
│   ├── core/                           # 🎯 CAPA DE DOMINIO Y APLICACIÓN
│   │   │
│   │   ├── domain/                     # Lógica de negocio pura
│   │   │   ├── entities/              # Entidades de dominio
│   │   │   │   ├── gestante.entity.ts
│   │   │   │   ├── control.entity.ts
│   │   │   │   ├── alerta.entity.ts
│   │   │   │   └── README.md
│   │   │   │
│   │   │   ├── repositories/          # Interfaces de repositorios
│   │   │   │   ├── gestante.repository.interface.ts
│   │   │   │   ├── control.repository.interface.ts
│   │   │   │   └── README.md
│   │   │   │
│   │   │   └── errors/                # Errores de dominio
│   │   │       ├── base.error.ts
│   │   │       ├── validation.error.ts
│   │   │       ├── not-found.error.ts
│   │   │       ├── conflict.error.ts
│   │   │       ├── unauthorized.error.ts
│   │   │       ├── forbidden.error.ts
│   │   │       ├── bad-request.error.ts
│   │   │       └── database.error.ts
│   │   │
│   │   └── application/                # Casos de uso
│   │       ├── use-cases/             # Lógica de aplicación
│   │       │   ├── gestante/
│   │       │   │   ├── crear-gestante.use-case.ts
│   │       │   │   ├── actualizar-gestante.use-case.ts
│   │       │   │   ├── eliminar-gestante.use-case.ts
│   │       │   │   └── listar-gestantes.use-case.ts
│   │       │   │
│   │       │   ├── control/
│   │       │   │   ├── crear-control.use-case.ts
│   │       │   │   └── calcular-riesgo.use-case.ts
│   │       │   │
│   │       │   └── README.md
│   │       │
│   │       └── dtos/                  # Data Transfer Objects
│   │           ├── gestante.dto.ts
│   │           ├── control.dto.ts
│   │           ├── alerta.dto.ts
│   │           └── auth.dto.ts
│   │
│   ├── infrastructure/                 # 🏗️ CAPA DE INFRAESTRUCTURA
│   │   ├── repositories/              # Implementaciones de repositorios
│   │   │   ├── gestante.repository.ts
│   │   │   ├── control.repository.ts
│   │   │   └── README.md
│   │   │
│   │   └── database/                  # Configuración de BD
│   │       ├── prisma.ts
│   │       └── migrations/
│   │
│   ├── controllers/                    # 🎮 CONTROLADORES HTTP
│   │   ├── auth.controller.ts
│   │   ├── gestante.controller.ts
│   │   ├── control.controller.ts
│   │   ├── alerta.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── ips.controller.ts
│   │   ├── medico.controller.ts
│   │   ├── municipio.controller.ts
│   │   ├── usuario.controller.ts
│   │   ├── reporte.controller.ts
│   │   ├── ips-crud.controller.ts
│   │   └── medico-crud.controller.ts
│   │
│   ├── routes/                         # 🛣️ RUTAS
│   │   ├── index.ts                   # Router principal
│   │   ├── auth.routes.ts
│   │   ├── gestantes.routes.ts
│   │   ├── controles.routes.ts
│   │   ├── alertas.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── ips.routes.ts
│   │   ├── medicos.routes.ts
│   │   ├── municipios.routes.ts
│   │   ├── usuarios.routes.ts
│   │   ├── reportes.routes.ts
│   │   ├── ips-crud.routes.ts
│   │   ├── medico-crud.routes.ts
│   │   ├── alertas-automaticas.routes.ts
│   │   └── admin.routes.ts
│   │
│   ├── middlewares/                    # 🛡️ MIDDLEWARES
│   │   ├── auth.middleware.ts         # Autenticación JWT
│   │   ├── validation.middleware.ts   # Validación Zod
│   │   ├── error.middleware.ts        # Manejo de errores
│   │   ├── rate-limit.middleware.ts   # Rate limiting
│   │   ├── sanitize.middleware.ts     # Sanitización XSS
│   │   ├── role.middleware.ts         # Validación de roles
│   │   └── logging.middleware.ts      # Logging HTTP
│   │
│   ├── services/                       # 🔧 SERVICIOS
│   │   ├── auth.service.ts            # Autenticación
│   │   ├── token.service.ts           # Manejo de tokens
│   │   ├── gestante.service.ts        # Lógica de gestantes
│   │   ├── control.service.ts         # Lógica de controles
│   │   ├── alerta.service.ts          # Lógica de alertas
│   │   ├── dashboard.service.ts       # Estadísticas
│   │   ├── ips.service.ts             # Lógica de IPS
│   │   ├── medico.service.ts          # Lógica de médicos
│   │   ├── municipio.service.ts       # Lógica de municipios
│   │   ├── usuario.service.ts         # Lógica de usuarios
│   │   ├── reporte.service.ts         # Reportes y estadísticas
│   │   ├── ips-crud.service.ts        # CRUD IPS
│   │   ├── medico-crud.service.ts     # CRUD Médicos
│   │   ├── alertas-automaticas.service.ts  # Sistema de alertas
│   │   └── assignment.service.ts      # Asignación automática
│   │
│   ├── config/                         # ⚙️ CONFIGURACIÓN
│   │   ├── database.ts                # Config de BD
│   │   ├── jwt.ts                     # Config de JWT
│   │   ├── swagger.ts                 # Config de Swagger
│   │   └── logger.ts                  # Config de Winston
│   │
│   ├── utils/                          # 🛠️ UTILIDADES
│   │   ├── logger.ts                  # Logger Winston
│   │   ├── async-handler.ts           # Wrapper async
│   │   ├── validators.ts              # Validadores custom
│   │   └── helpers.ts                 # Funciones auxiliares
│   │
│   ├── scripts/                        # 📜 SCRIPTS
│   │   ├── seed-database.ts           # Poblar BD
│   │   ├── test-alertas.ts            # Test de alertas
│   │   ├── test-reportes.ts           # Test de reportes
│   │   └── update-password.ts         # Actualizar contraseña
│   │
│   ├── app.ts                          # 🚀 APLICACIÓN PRINCIPAL
│   └── server.ts                       # 🌐 SERVIDOR HTTP
│
├── prisma/                             # 🗄️ PRISMA ORM
│   ├── schema.prisma                  # Esquema de BD
│   ├── migrations/                    # Migraciones
│   └── seed.ts                        # Seed inicial
│
├── docs/                               # 📚 DOCUMENTACIÓN
│   ├── ARCHITECTURE.md                # Arquitectura
│   ├── DESIGN-PATTERNS.md             # Patrones de diseño
│   ├── FOLDER-STRUCTURE.md            # Esta guía
│   ├── DEVELOPMENT.md                 # Guía de desarrollo
│   ├── SISTEMA-ALERTAS-AUTOMATICAS.md # Sistema de alertas
│   └── PRISMA-SCHEMA-MEMORY.md        # Esquema Prisma
│
├── logs/                               # 📝 LOGS
│   ├── error.log                      # Logs de errores
│   ├── combined.log                   # Logs combinados
│   └── http.log                       # Logs HTTP
│
├── dist/                               # 📦 CÓDIGO COMPILADO
│   └── (generado por TypeScript)
│
├── node_modules/                       # 📦 DEPENDENCIAS
│
├── .env                                # 🔐 VARIABLES DE ENTORNO
├── .env.example                        # 📋 Ejemplo de .env
├── .gitignore                          # 🚫 Archivos ignorados
├── package.json                        # 📦 Dependencias npm
├── tsconfig.json                       # ⚙️ Config TypeScript
└── README.md                           # 📖 Documentación principal
```

---

## Descripción de Carpetas

### 🎯 `src/core/` - Capa de Dominio y Aplicación

**Propósito**: Contiene la lógica de negocio pura, independiente de frameworks.

#### `core/domain/entities/`
- **Qué va aquí**: Entidades de dominio con lógica de negocio
- **Ejemplo**: `gestante.entity.ts`, `control.entity.ts`
- **Reglas**:
  - No dependen de frameworks externos
  - Contienen validaciones de negocio
  - Métodos de cálculo y lógica pura

#### `core/domain/repositories/`
- **Qué va aquí**: Interfaces de repositorios (contratos)
- **Ejemplo**: `gestante.repository.interface.ts`
- **Reglas**:
  - Solo interfaces, no implementaciones
  - Definen operaciones CRUD
  - Independientes de ORM

#### `core/domain/errors/`
- **Qué va aquí**: Clases de error personalizadas
- **Ejemplo**: `validation.error.ts`, `not-found.error.ts`
- **Reglas**:
  - Extienden `BaseError`
  - Incluyen código HTTP
  - Mensajes descriptivos

#### `core/application/use-cases/`
- **Qué va aquí**: Casos de uso (lógica de aplicación)
- **Ejemplo**: `crear-gestante.use-case.ts`
- **Reglas**:
  - Un archivo = Un caso de uso
  - Orquestan entidades y repositorios
  - Validan reglas de negocio

#### `core/application/dtos/`
- **Qué va aquí**: Data Transfer Objects con validación
- **Ejemplo**: `gestante.dto.ts`
- **Reglas**:
  - Usan Zod para validación
  - Definen tipos TypeScript
  - Documentan estructura de datos

---

### 🏗️ `src/infrastructure/` - Capa de Infraestructura

**Propósito**: Implementaciones concretas de interfaces.

#### `infrastructure/repositories/`
- **Qué va aquí**: Implementaciones de repositorios
- **Ejemplo**: `gestante.repository.ts`
- **Reglas**:
  - Implementan interfaces del dominio
  - Usan Prisma ORM
  - Mapean entre entidades y modelos de BD

#### `infrastructure/database/`
- **Qué va aquí**: Configuración de base de datos
- **Ejemplo**: `prisma.ts`
- **Reglas**:
  - Cliente Prisma singleton
  - Manejo de conexiones
  - Configuración de pool

---

### 🎮 `src/controllers/` - Controladores

**Propósito**: Manejar requests HTTP y formatear respuestas.

**Qué va aquí**: Controladores HTTP
**Ejemplo**: `gestante.controller.ts`
**Reglas**:
- Parsean request
- Llaman a use cases o services
- Formatean response
- Manejan errores con try/catch

---

### 🛣️ `src/routes/` - Rutas

**Propósito**: Definir endpoints y aplicar middlewares.

**Qué va aquí**: Definición de rutas Express
**Ejemplo**: `gestantes.routes.ts`
**Reglas**:
- Definen métodos HTTP (GET, POST, PUT, DELETE)
- Aplican middlewares (auth, validation)
- Documentan con Swagger
- Exportan router

---

### 🛡️ `src/middlewares/` - Middlewares

**Propósito**: Procesar requests antes de llegar al controller.

**Qué va aquí**: Middlewares Express
**Ejemplo**: `auth.middleware.ts`, `validation.middleware.ts`
**Reglas**:
- Función con firma (req, res, next)
- Llaman a `next()` para continuar
- Llaman a `next(error)` para errores
- Reutilizables

---

### 🔧 `src/services/` - Servicios

**Propósito**: Lógica de aplicación compleja.

**Qué va aquí**: Servicios de aplicación
**Ejemplo**: `gestante.service.ts`
**Reglas**:
- Coordinan múltiples operaciones
- Usan repositorios
- Lógica de negocio compleja
- Transacciones

---

## Convenciones de Nombres

### Archivos
- **Entidades**: `nombre.entity.ts` (ej: `gestante.entity.ts`)
- **Repositorios (Interface)**: `nombre.repository.interface.ts`
- **Repositorios (Impl)**: `nombre.repository.ts`
- **Use Cases**: `verbo-nombre.use-case.ts` (ej: `crear-gestante.use-case.ts`)
- **DTOs**: `nombre.dto.ts`
- **Controllers**: `nombre.controller.ts`
- **Routes**: `nombre.routes.ts`
- **Services**: `nombre.service.ts`
- **Middlewares**: `nombre.middleware.ts`
- **Errors**: `nombre.error.ts`

### Clases
- **Entidades**: `NombreEntity` (ej: `GestanteEntity`)
- **Use Cases**: `VerboNombreUseCase` (ej: `CrearGestanteUseCase`)
- **Repositories**: `NombreRepository`
- **Services**: `NombreService`
- **Errors**: `NombreError` (ej: `ValidationError`)

### Interfaces
- **Repositorios**: `INombreRepository` (ej: `IGestanteRepository`)

---

## Guía de Ubicación

### ¿Dónde poner...?

#### Lógica de negocio pura
→ `src/core/domain/entities/`

#### Validaciones de datos de entrada
→ `src/core/application/dtos/`

#### Casos de uso (acciones del usuario)
→ `src/core/application/use-cases/`

#### Acceso a base de datos
→ `src/infrastructure/repositories/`

#### Endpoints HTTP
→ `src/routes/`

#### Procesamiento de requests
→ `src/controllers/`

#### Lógica de aplicación compleja
→ `src/services/`

#### Autenticación y autorización
→ `src/middlewares/auth.middleware.ts`

#### Validación de entrada
→ `src/middlewares/validation.middleware.ts`

#### Manejo de errores
→ `src/middlewares/error.middleware.ts`

#### Configuración
→ `src/config/`

#### Scripts utilitarios
→ `src/scripts/`

#### Documentación
→ `docs/`

---

## Conclusión

Esta estructura proporciona:

✅ **Separación clara de responsabilidades**
✅ **Fácil navegación**
✅ **Escalabilidad**
✅ **Mantenibilidad**
✅ **Testabilidad**

