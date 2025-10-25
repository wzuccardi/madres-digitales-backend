# 🏗️ Arquitectura del Sistema - Madres Digitales

## Índice

1. [Visión General](#visión-general)
2. [Clean Architecture](#clean-architecture)
3. [Capas del Sistema](#capas-del-sistema)
4. [Flujo de Datos](#flujo-de-datos)
5. [Patrones de Diseño](#patrones-de-diseño)
6. [Seguridad](#seguridad)
7. [Base de Datos](#base-de-datos)

## Visión General

Madres Digitales utiliza **Clean Architecture** (Arquitectura Limpia) para garantizar:

- ✅ **Independencia de frameworks**
- ✅ **Testabilidad**
- ✅ **Independencia de UI**
- ✅ **Independencia de base de datos**
- ✅ **Independencia de agentes externos**

## Clean Architecture

### Principios Fundamentales

1. **Regla de Dependencia**: Las dependencias solo apuntan hacia adentro
2. **Separación de Responsabilidades**: Cada capa tiene un propósito específico
3. **Inversión de Dependencias**: Las capas externas dependen de abstracciones

### Diagrama de Capas

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                   │
│    (Controllers, Routes, Middlewares)        │
├─────────────────────────────────────────────┤
│         Application Layer                    │
│      (Use Cases, DTOs, Services)             │
├─────────────────────────────────────────────┤
│           Domain Layer                       │
│   (Entities, Repositories, Business Logic)   │
├─────────────────────────────────────────────┤
│       Infrastructure Layer                   │
│  (Database, External APIs, File System)      │
└─────────────────────────────────────────────┘
```

## Capas del Sistema

### 1. Domain Layer (Capa de Dominio)

**Ubicación**: `src/core/domain/`

**Responsabilidades**:
- Definir entidades de negocio
- Contener lógica de negocio pura
- Definir interfaces de repositorios
- Definir errores de dominio

**Componentes**:

#### Entities (Entidades)
```typescript
// src/core/domain/entities/gestante.entity.ts
export class GestanteEntity {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    // ... más propiedades
  ) {
    this.validate();
  }

  // Métodos de negocio
  public esAltoRiesgo(): boolean {
    // Lógica de negocio
  }

  public calcularSemanasGestacion(): number {
    // Lógica de negocio
  }
}
```

#### Repository Interfaces
```typescript
// src/core/domain/repositories/gestante.repository.interface.ts
export interface IGestanteRepository {
  crear(gestante: GestanteEntity): Promise<GestanteEntity>;
  buscarPorId(id: string): Promise<GestanteEntity | null>;
  listar(filtros?: Filtros): Promise<GestanteEntity[]>;
  // ... más métodos
}
```

#### Domain Errors
```typescript
// src/core/domain/errors/base.error.ts
export abstract class BaseError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly isOperational: boolean = true
  ) {
    super(message);
  }
}
```

### 2. Application Layer (Capa de Aplicación)

**Ubicación**: `src/core/application/`

**Responsabilidades**:
- Orquestar casos de uso
- Validar datos de entrada
- Coordinar entre dominio e infraestructura

**Componentes**:

#### Use Cases
```typescript
// src/core/application/use-cases/gestante/crear-gestante.use-case.ts
export class CrearGestanteUseCase {
  constructor(private repository: IGestanteRepository) {}

  async execute(dto: CrearGestanteDTO): Promise<GestanteEntity> {
    // 1. Validar datos
    // 2. Verificar reglas de negocio
    // 3. Crear entidad
    // 4. Persistir
    // 5. Retornar resultado
  }
}
```

#### DTOs (Data Transfer Objects)
```typescript
// src/core/application/dtos/gestante.dto.ts
export const crearGestanteSchema = z.object({
  nombre: z.string().min(2).max(100),
  documento: z.string().min(5).max(20),
  // ... más campos con validación
});

export type CrearGestanteDTO = z.infer<typeof crearGestanteSchema>;
```

### 3. Infrastructure Layer (Capa de Infraestructura)

**Ubicación**: `src/infrastructure/` y `src/services/`

**Responsabilidades**:
- Implementar interfaces de repositorios
- Acceso a base de datos
- Integración con servicios externos
- Manejo de archivos

**Componentes**:

#### Repository Implementations
```typescript
// src/infrastructure/repositories/gestante.repository.ts
export class GestanteRepository implements IGestanteRepository {
  async crear(gestante: GestanteEntity): Promise<GestanteEntity> {
    const result = await prisma.gestante.create({
      data: this.toDatabase(gestante)
    });
    return this.toDomain(result);
  }
}
```

#### Services
```typescript
// src/services/token.service.ts
export class TokenService {
  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }
}
```

### 4. Presentation Layer (Capa de Presentación)

**Ubicación**: `src/controllers/`, `src/routes/`, `src/middlewares/`

**Responsabilidades**:
- Manejar requests HTTP
- Validar entrada
- Formatear respuestas
- Aplicar middlewares

**Componentes**:

#### Controllers
```typescript
// src/controllers/gestante.controller.ts
export const crearGestante = async (req: Request, res: Response) => {
  try {
    const dto = req.body;
    const useCase = new CrearGestanteUseCase(repository);
    const result = await useCase.execute(dto);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

#### Routes
```typescript
// src/routes/gestante.routes.ts
router.post('/gestantes',
  authenticateToken,
  validate(crearGestanteSchema),
  crearGestante
);
```

#### Middlewares
```typescript
// src/middlewares/validation.middleware.ts
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error });
    }
    next();
  };
};
```

## Flujo de Datos

### Request Flow (Flujo de Petición)

```
1. HTTP Request
   ↓
2. Middleware (Auth, Validation, Rate Limit)
   ↓
3. Controller (Parse request)
   ↓
4. Use Case (Business logic)
   ↓
5. Repository (Data access)
   ↓
6. Database (Prisma + PostgreSQL)
   ↓
7. Response (JSON)
```

### Ejemplo Completo: Crear Gestante

```typescript
// 1. Request
POST /api/gestantes
{
  "nombre": "María García",
  "documento": "1234567890",
  // ... más datos
}

// 2. Middleware: Autenticación
authenticateToken() → Verifica JWT

// 3. Middleware: Validación
validate(crearGestanteSchema) → Valida datos

// 4. Controller
crearGestante() → Recibe request

// 5. Use Case
CrearGestanteUseCase.execute() → Lógica de negocio

// 6. Repository
GestanteRepository.crear() → Persiste datos

// 7. Database
Prisma → PostgreSQL

// 8. Response
{
  "success": true,
  "data": { /* gestante creada */ }
}
```

## Patrones de Diseño

### 1. Repository Pattern
- Abstrae el acceso a datos
- Permite cambiar la implementación sin afectar la lógica de negocio

### 2. Use Case Pattern
- Encapsula lógica de aplicación
- Un caso de uso = Una acción del usuario

### 3. DTO Pattern
- Transfiere datos entre capas
- Valida datos de entrada

### 4. Dependency Injection
- Inyecta dependencias en constructores
- Facilita testing con mocks

### 5. Factory Pattern
- Crea instancias de entidades
- Centraliza lógica de creación

## Seguridad

### Capas de Seguridad

```
1. Rate Limiting → Previene ataques de fuerza bruta
2. Helmet → Headers de seguridad HTTP
3. CORS → Control de orígenes
4. JWT → Autenticación stateless
5. Validation → Sanitización de entrada
6. Error Handling → No expone información sensible
7. Logging → Auditoría de seguridad
```

### Autenticación JWT

```typescript
// Access Token: 7 días
// Refresh Token: 30 días (almacenado en BD)

Login → Access Token + Refresh Token
Request → Verifica Access Token
Expired → Usa Refresh Token → Nuevo Access Token
Logout → Revoca Refresh Token
```

## Base de Datos

### Tecnologías

- **PostgreSQL 15+**: Base de datos relacional
- **PostGIS**: Extensión geoespacial
- **Prisma ORM**: Abstracción de base de datos

### Esquema Principal

```prisma
model Gestante {
  id                    String   @id @default(uuid())
  nombre                String
  documento             String   @unique
  fechaNacimiento       DateTime
  municipioId           String
  latitud               Float?
  longitud              Float?
  madrinaId             String?
  ipsId                 String?
  controles             Control[]
  alertas               Alerta[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### Índices

- `documento`: Búsqueda rápida por documento
- `madrinaId`: Filtrar por madrina
- `municipioId`: Filtrar por municipio
- `(latitud, longitud)`: Búsquedas geoespaciales

## Testing

### Estrategia de Testing

```
Unit Tests (40%)
  ↓ Entities, Use Cases
Integration Tests (35%)
  ↓ Controllers, Services
E2E Tests (25%)
  ↓ API Endpoints
```

### Cobertura Objetivo

- **Entities**: 90%+
- **Use Cases**: 85%+
- **Controllers**: 75%+
- **Overall**: 80%+

## Escalabilidad

### Horizontal Scaling

- Stateless API (JWT)
- Load balancer compatible
- Database connection pooling

### Vertical Scaling

- Optimización de queries
- Índices de base de datos
- Caching (Redis - futuro)

## Monitoreo

### Métricas Clave

- Response time
- Error rate
- Request rate
- Database connections
- Memory usage

### Logging

- Winston para logs estructurados
- Niveles: error, warn, info, http, debug
- Rotación de archivos
- Logs centralizados (futuro)

## Conclusión

Esta arquitectura proporciona:

✅ **Mantenibilidad**: Código organizado y fácil de entender
✅ **Testabilidad**: Cada capa puede testearse independientemente
✅ **Escalabilidad**: Fácil de escalar horizontal y verticalmente
✅ **Flexibilidad**: Fácil cambiar implementaciones
✅ **Seguridad**: Múltiples capas de protección

