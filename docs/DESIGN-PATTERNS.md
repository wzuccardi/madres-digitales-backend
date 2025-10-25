# 🎨 Patrones de Diseño - Madres Digitales

## Índice

1. [Repository Pattern](#repository-pattern)
2. [Use Case Pattern](#use-case-pattern)
3. [DTO Pattern](#dto-pattern)
4. [Dependency Injection](#dependency-injection)
5. [Factory Pattern](#factory-pattern)
6. [Middleware Pattern](#middleware-pattern)
7. [Strategy Pattern](#strategy-pattern)
8. [Observer Pattern](#observer-pattern)

---

## Repository Pattern

### Propósito
Abstraer el acceso a datos y proporcionar una interfaz uniforme para operaciones CRUD.

### Implementación

#### 1. Definir Interface (Domain Layer)
```typescript
// src/core/domain/repositories/gestante.repository.interface.ts
export interface IGestanteRepository {
  // Create
  crear(gestante: GestanteEntity): Promise<GestanteEntity>;
  
  // Read
  buscarPorId(id: string): Promise<GestanteEntity | null>;
  buscarPorDocumento(documento: string): Promise<GestanteEntity | null>;
  listar(filtros?: FiltrosGestante): Promise<GestanteEntity[]>;
  listarPorMadrina(madrinaId: string): Promise<GestanteEntity[]>;
  listarPorMunicipio(municipioId: string): Promise<GestanteEntity[]>;
  
  // Update
  actualizar(id: string, datos: Partial<GestanteEntity>): Promise<GestanteEntity>;
  
  // Delete
  eliminar(id: string): Promise<void>;
  
  // Business queries
  contarPorMunicipio(municipioId: string): Promise<number>;
  buscarAltoRiesgo(): Promise<GestanteEntity[]>;
  buscarCercanas(lat: number, lng: number, radioKm: number): Promise<GestanteEntity[]>;
}
```

#### 2. Implementar Repository (Infrastructure Layer)
```typescript
// src/infrastructure/repositories/gestante.repository.ts
import { IGestanteRepository } from '../../core/domain/repositories/gestante.repository.interface';
import { GestanteEntity } from '../../core/domain/entities/gestante.entity';
import { prisma } from '../database/prisma';

export class GestanteRepository implements IGestanteRepository {
  
  async crear(gestante: GestanteEntity): Promise<GestanteEntity> {
    const data = this.toDatabase(gestante);
    const result = await prisma.gestante.create({ data });
    return this.toDomain(result);
  }

  async buscarPorId(id: string): Promise<GestanteEntity | null> {
    const result = await prisma.gestante.findUnique({ where: { id } });
    return result ? this.toDomain(result) : null;
  }

  async listar(filtros?: FiltrosGestante): Promise<GestanteEntity[]> {
    const where = this.buildWhereClause(filtros);
    const results = await prisma.gestante.findMany({ where });
    return results.map(r => this.toDomain(r));
  }

  // Mappers
  private toDomain(data: any): GestanteEntity {
    return new GestanteEntity(
      data.id,
      data.nombre,
      data.apellido,
      // ... más campos
    );
  }

  private toDatabase(entity: GestanteEntity): any {
    return {
      id: entity.id,
      nombre: entity.nombre,
      apellido: entity.apellido,
      // ... más campos
    };
  }
}
```

### Ventajas
✅ Desacopla lógica de negocio de acceso a datos
✅ Facilita testing con mocks
✅ Permite cambiar ORM sin afectar lógica
✅ Centraliza queries complejas

---

## Use Case Pattern

### Propósito
Encapsular la lógica de aplicación en casos de uso específicos.

### Implementación

```typescript
// src/core/application/use-cases/gestante/crear-gestante.use-case.ts
import { IGestanteRepository } from '../../../domain/repositories/gestante.repository.interface';
import { GestanteEntity } from '../../../domain/entities/gestante.entity';
import { CrearGestanteDTO } from '../../dtos/gestante.dto';
import { ConflictError } from '../../../domain/errors/conflict.error';

export class CrearGestanteUseCase {
  constructor(private readonly repository: IGestanteRepository) {}

  async execute(dto: CrearGestanteDTO): Promise<GestanteEntity> {
    // 1. Validar reglas de negocio
    await this.validarDocumentoUnico(dto.documento);
    
    // 2. Validar edad mínima
    this.validarEdadMinima(dto.fechaNacimiento);
    
    // 3. Crear entidad de dominio
    const gestante = new GestanteEntity(
      this.generarId(),
      dto.nombre,
      dto.apellido,
      dto.documento,
      dto.tipoDocumento,
      dto.fechaNacimiento,
      dto.telefono,
      dto.direccion,
      dto.municipioId,
      dto.ipsId,
      dto.madrinaId,
      dto.fechaUltimaMenstruacion,
      dto.fechaProbableParto,
      dto.numeroEmbarazos,
      dto.numeroPartos,
      dto.numeroAbortos,
      dto.grupoSanguineo,
      dto.factorRh,
      dto.alergias,
      dto.enfermedadesPreexistentes,
      dto.observaciones,
      dto.latitud,
      dto.longitud,
      true, // activo
      new Date(), // createdAt
      new Date()  // updatedAt
    );
    
    // 4. Persistir
    return await this.repository.crear(gestante);
  }

  private async validarDocumentoUnico(documento: string): Promise<void> {
    const existente = await this.repository.buscarPorDocumento(documento);
    if (existente) {
      throw new ConflictError('Ya existe una gestante con ese documento');
    }
  }

  private validarEdadMinima(fechaNacimiento: Date): void {
    const edad = this.calcularEdad(fechaNacimiento);
    if (edad < 10) {
      throw new ValidationError('La edad mínima es 10 años');
    }
  }

  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  private generarId(): string {
    return uuidv4();
  }
}
```

### Ventajas
✅ Encapsula lógica de aplicación
✅ Un caso de uso = Una acción del usuario
✅ Fácil de testear
✅ Reutilizable

---

## DTO Pattern

### Propósito
Transferir datos entre capas y validar entrada.

### Implementación

```typescript
// src/core/application/dtos/gestante.dto.ts
import { z } from 'zod';

// Schema de validación con Zod
export const crearGestanteSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  
  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  
  documento: z.string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'El documento no puede exceder 20 caracteres')
    .regex(/^[0-9]+$/, 'El documento solo puede contener números'),
  
  tipoDocumento: z.enum(['cedula', 'tarjeta_identidad', 'pasaporte', 'registro_civil']),
  
  fechaNacimiento: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha de nacimiento inválida'),
  
  telefono: z.string()
    .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos'),
  
  direccion: z.string().min(5).max(200),
  
  municipioId: z.string().uuid('ID de municipio inválido'),
  
  ipsId: z.string().uuid('ID de IPS inválido').optional(),
  
  madrinaId: z.string().uuid('ID de madrina inválido').optional(),
  
  fechaUltimaMenstruacion: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  
  fechaProbableParto: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  
  numeroEmbarazos: z.number().int().min(1).max(20),
  numeroPartos: z.number().int().min(0).max(20),
  numeroAbortos: z.number().int().min(0).max(20),
  
  grupoSanguineo: z.enum(['A', 'B', 'AB', 'O']),
  factorRh: z.enum(['+', '-']),
  
  alergias: z.string().max(500).optional(),
  enfermedadesPreexistentes: z.string().max(500).optional(),
  observaciones: z.string().max(1000).optional(),
  
  latitud: z.number().min(-90).max(90).optional(),
  longitud: z.number().min(-180).max(180).optional(),
});

// Tipo inferido del schema
export type CrearGestanteDTO = z.infer<typeof crearGestanteSchema>;

// DTO para actualización (todos los campos opcionales)
export const actualizarGestanteSchema = crearGestanteSchema.partial();
export type ActualizarGestanteDTO = z.infer<typeof actualizarGestanteSchema>;

// DTO para filtros
export const filtrosGestanteSchema = z.object({
  municipioId: z.string().uuid().optional(),
  madrinaId: z.string().uuid().optional(),
  ipsId: z.string().uuid().optional(),
  altoRiesgo: z.boolean().optional(),
  activo: z.boolean().optional(),
  busqueda: z.string().optional(),
});
export type FiltrosGestanteDTO = z.infer<typeof filtrosGestanteSchema>;
```

### Uso en Middleware

```typescript
// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../core/domain/errors/validation.error';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        throw new ValidationError('Datos de entrada inválidos', errors);
      }
      
      // Reemplazar body con datos validados
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

### Ventajas
✅ Validación automática de datos
✅ Type-safe con TypeScript
✅ Documentación implícita
✅ Previene inyección de datos

---

## Dependency Injection

### Propósito
Inyectar dependencias en lugar de crearlas internamente.

### Implementación

```typescript
// Sin DI (❌ Mal)
export class CrearGestanteUseCase {
  async execute(dto: CrearGestanteDTO) {
    const repository = new GestanteRepository(); // ❌ Acoplamiento fuerte
    return await repository.crear(dto);
  }
}

// Con DI (✅ Bien)
export class CrearGestanteUseCase {
  constructor(private readonly repository: IGestanteRepository) {} // ✅ Inyección
  
  async execute(dto: CrearGestanteDTO) {
    return await this.repository.crear(dto);
  }
}

// Uso en Controller
const repository = new GestanteRepository();
const useCase = new CrearGestanteUseCase(repository);
const result = await useCase.execute(dto);
```

### Ventajas
✅ Facilita testing con mocks
✅ Reduce acoplamiento
✅ Mejora mantenibilidad
✅ Permite cambiar implementaciones

---

## Factory Pattern

### Propósito
Centralizar la creación de objetos complejos.

### Implementación

```typescript
// src/core/domain/factories/gestante.factory.ts
export class GestanteFactory {
  static crear(dto: CrearGestanteDTO): GestanteEntity {
    const id = uuidv4();
    const fechaProbableParto = this.calcularFechaProbableParto(dto.fechaUltimaMenstruacion);
    
    return new GestanteEntity(
      id,
      dto.nombre,
      dto.apellido,
      dto.documento,
      dto.tipoDocumento,
      new Date(dto.fechaNacimiento),
      dto.telefono,
      dto.direccion,
      dto.municipioId,
      dto.ipsId,
      dto.madrinaId,
      new Date(dto.fechaUltimaMenstruacion),
      fechaProbableParto,
      dto.numeroEmbarazos,
      dto.numeroPartos,
      dto.numeroAbortos,
      dto.grupoSanguineo,
      dto.factorRh,
      dto.alergias,
      dto.enfermedadesPreexistentes,
      dto.observaciones,
      dto.latitud,
      dto.longitud,
      true,
      new Date(),
      new Date()
    );
  }

  private static calcularFechaProbableParto(fum: string): Date {
    const fecha = new Date(fum);
    fecha.setDate(fecha.getDate() + 280); // 40 semanas
    return fecha;
  }
}
```

### Ventajas
✅ Centraliza lógica de creación
✅ Reduce duplicación de código
✅ Facilita cambios en construcción

---

## Middleware Pattern

### Propósito
Procesar requests antes de llegar al controller.

### Implementación

```typescript
// src/middlewares/auth.middleware.ts
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Token no proporcionado');
    }
    
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    
    next();
  } catch (error) {
    next(error);
  }
};

// src/middlewares/role.middleware.ts
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      throw new ForbiddenError('No tienes permisos para esta acción');
    }
    next();
  };
};

// Uso en rutas
router.post('/gestantes',
  authenticateToken,
  requireRole('admin', 'madrina'),
  validate(crearGestanteSchema),
  crearGestante
);
```

### Ventajas
✅ Separa concerns
✅ Reutilizable
✅ Composable
✅ Fácil de testear

---

## Conclusión

Estos patrones de diseño proporcionan:

✅ **Código limpio y mantenible**
✅ **Fácil de testear**
✅ **Bajo acoplamiento**
✅ **Alta cohesión**
✅ **Escalable y flexible**

