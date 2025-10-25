# 🛠️ Guía de Desarrollo - Madres Digitales Backend

## Índice

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Flujo de Desarrollo](#flujo-de-desarrollo)
4. [Convenciones de Código](#convenciones-de-código)
5. [Testing](#testing)
6. [Base de Datos](#base-de-datos)
7. [Debugging](#debugging)
8. [Mejores Prácticas](#mejores-prácticas)

## Configuración del Entorno

### Requisitos

- **Node.js**: 20.x LTS
- **PostgreSQL**: 15+ con PostGIS
- **npm**: 10.x
- **Git**: Para control de versiones
- **VS Code**: Recomendado (con extensiones)

### Extensiones VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "orta.vscode-jest",
    "humao.rest-client"
  ]
}
```

### Setup Inicial

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd madres-digitales-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Configurar base de datos
npx prisma migrate dev
npx prisma generate

# 5. Seed inicial (opcional)
npm run seed

# 6. Ejecutar en desarrollo
npm run dev
```

## Estructura del Proyecto

```
src/
├── core/                           # Capa de dominio y aplicación
│   ├── domain/                     # Lógica de negocio pura
│   │   ├── entities/              # Entidades de dominio
│   │   │   ├── gestante.entity.ts
│   │   │   └── __tests__/         # Tests unitarios
│   │   ├── repositories/          # Interfaces de repositorios
│   │   │   └── gestante.repository.interface.ts
│   │   └── errors/                # Errores de dominio
│   │       ├── base.error.ts
│   │       └── validation.error.ts
│   └── application/               # Casos de uso
│       ├── use-cases/             # Lógica de aplicación
│       │   └── gestante/
│       │       ├── crear-gestante.use-case.ts
│       │       └── __tests__/
│       └── dtos/                  # Data Transfer Objects
│           └── gestante.dto.ts
│
├── infrastructure/                # Implementaciones técnicas
│   ├── repositories/              # Implementaciones de repositorios
│   │   └── gestante.repository.ts
│   └── database/                  # Configuración de BD
│       └── prisma.ts
│
├── controllers/                   # Controladores HTTP
│   ├── auth.controller.ts
│   ├── gestante.controller.ts
│   └── __tests__/                # Tests de integración
│
├── routes/                        # Definición de rutas
│   ├── index.ts
│   ├── auth.routes.ts
│   └── gestante.routes.ts
│
├── middlewares/                   # Middlewares Express
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── __tests__/
│
├── services/                      # Servicios de aplicación
│   ├── token.service.ts
│   ├── email.service.ts
│   └── __tests__/
│
├── config/                        # Configuración
│   ├── database.ts
│   ├── jwt.ts
│   ├── swagger.ts
│   └── logger.ts
│
├── utils/                         # Utilidades
│   ├── calculos-medicos.utils.ts
│   └── date.utils.ts
│
├── scripts/                       # Scripts de utilidad
│   ├── reset-password.ts
│   └── seed.ts
│
└── app.ts                         # Aplicación Express
```

## Flujo de Desarrollo

### 1. Crear una Nueva Funcionalidad

#### Paso 1: Definir la Entidad de Dominio

```typescript
// src/core/domain/entities/ejemplo.entity.ts
export class EjemploEntity {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    // ... más propiedades
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.nombre || this.nombre.length < 2) {
      throw new ValidationError('Nombre inválido');
    }
  }

  // Métodos de negocio
  public metodoDeNegocio(): boolean {
    // Lógica de negocio pura
    return true;
  }
}
```

#### Paso 2: Definir la Interfaz del Repositorio

```typescript
// src/core/domain/repositories/ejemplo.repository.interface.ts
export interface IEjemploRepository {
  crear(ejemplo: EjemploEntity): Promise<EjemploEntity>;
  buscarPorId(id: string): Promise<EjemploEntity | null>;
  listar(): Promise<EjemploEntity[]>;
  actualizar(id: string, ejemplo: Partial<EjemploEntity>): Promise<EjemploEntity>;
  eliminar(id: string): Promise<void>;
}
```

#### Paso 3: Crear DTOs y Validación

```typescript
// src/core/application/dtos/ejemplo.dto.ts
import { z } from 'zod';

export const crearEjemploSchema = z.object({
  nombre: z.string().min(2).max(100),
  // ... más campos
});

export type CrearEjemploDTO = z.infer<typeof crearEjemploSchema>;
```

#### Paso 4: Implementar Caso de Uso

```typescript
// src/core/application/use-cases/ejemplo/crear-ejemplo.use-case.ts
export class CrearEjemploUseCase {
  constructor(private repository: IEjemploRepository) {}

  async execute(dto: CrearEjemploDTO): Promise<EjemploEntity> {
    // 1. Validar datos (ya validado por Zod)
    
    // 2. Verificar reglas de negocio
    const existente = await this.repository.buscarPorNombre(dto.nombre);
    if (existente) {
      throw new ConflictError('Ya existe un ejemplo con ese nombre');
    }

    // 3. Crear entidad
    const ejemplo = new EjemploEntity(
      uuidv4(),
      dto.nombre,
      // ... más campos
    );

    // 4. Persistir
    return await this.repository.crear(ejemplo);
  }
}
```

#### Paso 5: Implementar Repositorio

```typescript
// src/infrastructure/repositories/ejemplo.repository.ts
export class EjemploRepository implements IEjemploRepository {
  async crear(ejemplo: EjemploEntity): Promise<EjemploEntity> {
    const result = await prisma.ejemplo.create({
      data: {
        id: ejemplo.id,
        nombre: ejemplo.nombre,
        // ... más campos
      }
    });
    return this.toDomain(result);
  }

  private toDomain(data: any): EjemploEntity {
    return new EjemploEntity(
      data.id,
      data.nombre,
      // ... más campos
    );
  }
}
```

#### Paso 6: Crear Controlador

```typescript
// src/controllers/ejemplo.controller.ts
export const crearEjemplo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto: CrearEjemploDTO = req.body;
    const repository = new EjemploRepository();
    const useCase = new CrearEjemploUseCase(repository);
    const resultado = await useCase.execute(dto);
    
    res.status(201).json({
      success: true,
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};
```

#### Paso 7: Definir Rutas

```typescript
// src/routes/ejemplo.routes.ts
import { Router } from 'express';
import { crearEjemplo } from '../controllers/ejemplo.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { crearEjemploSchema } from '../core/application/dtos/ejemplo.dto';

const router = Router();

/**
 * @swagger
 * /api/ejemplos:
 *   post:
 *     summary: Crear un nuevo ejemplo
 *     tags: [Ejemplos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ejemplo creado exitosamente
 */
router.post('/',
  authenticateToken,
  validate(crearEjemploSchema),
  crearEjemplo
);

export default router;
```

#### Paso 8: Escribir Tests

```typescript
// src/core/domain/entities/__tests__/ejemplo.entity.test.ts
describe('EjemploEntity', () => {
  it('debe crear una entidad válida', () => {
    const ejemplo = new EjemploEntity('123', 'Test');
    expect(ejemplo.nombre).toBe('Test');
  });

  it('debe lanzar error con nombre inválido', () => {
    expect(() => new EjemploEntity('123', 'A')).toThrow(ValidationError);
  });
});
```

### 2. Trabajar con la Base de Datos

#### Crear una Nueva Migración

```bash
# 1. Modificar schema.prisma
# 2. Crear migración
npx prisma migrate dev --name nombre_descriptivo

# 3. Aplicar migración
npx prisma migrate deploy
```

#### Actualizar Cliente de Prisma

```bash
npx prisma generate
```

#### Ver Base de Datos

```bash
npx prisma studio
```

## Convenciones de Código

### Nomenclatura

- **Archivos**: `kebab-case.ts`
- **Clases**: `PascalCase`
- **Funciones/Variables**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Interfaces**: `IPascalCase`
- **Types**: `PascalCase`

### Estructura de Archivos

```typescript
// 1. Imports externos
import { Request, Response } from 'express';

// 2. Imports internos
import { GestanteEntity } from '../core/domain/entities/gestante.entity';

// 3. Types/Interfaces
interface MiInterface {
  // ...
}

// 4. Constantes
const MI_CONSTANTE = 'valor';

// 5. Funciones/Clases
export class MiClase {
  // ...
}
```

### Comentarios

```typescript
/**
 * Descripción de la función
 * @param param1 - Descripción del parámetro
 * @returns Descripción del retorno
 */
export function miFuncion(param1: string): boolean {
  // Comentario de implementación
  return true;
}
```

## Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm test -- --testPathPattern="gestante"

# Con cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

### Estructura de Tests

```typescript
describe('NombreDelComponente', () => {
  // Setup
  beforeAll(() => {
    // Configuración global
  });

  beforeEach(() => {
    // Configuración por test
  });

  afterEach(() => {
    // Limpieza por test
  });

  afterAll(() => {
    // Limpieza global
  });

  // Tests
  describe('método1', () => {
    it('debe hacer X cuando Y', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = metodo1(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Debugging

### VS Code Launch Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Logs

```typescript
import { logger } from '../config/logger';

// Diferentes niveles
logger.error('Error crítico', { error });
logger.warn('Advertencia');
logger.info('Información general');
logger.http('Request HTTP');
logger.debug('Debugging');
```

## Mejores Prácticas

### 1. Siempre Usar Datos Reales

❌ **NO hacer:**
```typescript
const mockData = { nombre: 'Test' };
```

✅ **SÍ hacer:**
```typescript
const data = await prisma.gestante.findMany();
```

### 2. Validar Entrada

```typescript
// Usar Zod para validación
const schema = z.object({
  email: z.string().email(),
  edad: z.number().min(0).max(120)
});

const validated = schema.parse(input);
```

### 3. Manejo de Errores

```typescript
// Usar errores personalizados
throw new ValidationError('Mensaje descriptivo');
throw new NotFoundError('Recurso no encontrado');
throw new UnauthorizedError('No autorizado');
```

### 4. Async/Await

```typescript
// Siempre usar try-catch con async
async function miFuncion() {
  try {
    const result = await operacionAsincrona();
    return result;
  } catch (error) {
    logger.error('Error en miFuncion', { error });
    throw error;
  }
}
```

### 5. Dependency Injection

```typescript
// Inyectar dependencias en constructores
class MiServicio {
  constructor(
    private repository: IRepository,
    private logger: Logger
  ) {}
}
```

### 6. Documentar APIs

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Descripción breve
 *     description: Descripción detallada
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 */
```

## Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## Contacto

Para dudas o sugerencias, contactar a: wzuccardi@gmail.com

