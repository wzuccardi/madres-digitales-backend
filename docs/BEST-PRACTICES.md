# ✨ Guía de Buenas Prácticas - Madres Digitales

## Índice

1. [Principios Generales](#principios-generales)
2. [Clean Architecture](#clean-architecture)
3. [TypeScript](#typescript)
4. [Manejo de Errores](#manejo-de-errores)
5. [Validación de Datos](#validación-de-datos)
6. [Seguridad](#seguridad)
7. [Base de Datos](#base-de-datos)
8. [Testing](#testing)
9. [Logging](#logging)
10. [Código Limpio](#código-limpio)

---

## Principios Generales

### SOLID Principles

#### 1. Single Responsibility Principle (SRP)
**Una clase debe tener una sola razón para cambiar**

```typescript
// ❌ Mal: Múltiples responsabilidades
class GestanteService {
  crear(data) { /* ... */ }
  enviarEmail(gestante) { /* ... */ }
  generarPDF(gestante) { /* ... */ }
  calcularRiesgo(gestante) { /* ... */ }
}

// ✅ Bien: Una responsabilidad por clase
class GestanteService {
  crear(data) { /* ... */ }
}

class EmailService {
  enviar(destinatario, mensaje) { /* ... */ }
}

class PDFService {
  generar(datos) { /* ... */ }
}

class RiesgoCalculator {
  calcular(gestante) { /* ... */ }
}
```

#### 2. Open/Closed Principle (OCP)
**Abierto para extensión, cerrado para modificación**

```typescript
// ❌ Mal: Modificar clase existente
class AlertaService {
  enviar(alerta: Alerta) {
    if (alerta.tipo === 'email') {
      // enviar email
    } else if (alerta.tipo === 'sms') {
      // enviar sms
    } else if (alerta.tipo === 'push') {
      // enviar push
    }
  }
}

// ✅ Bien: Extender sin modificar
interface INotificador {
  enviar(mensaje: string): Promise<void>;
}

class EmailNotificador implements INotificador {
  async enviar(mensaje: string) { /* ... */ }
}

class SMSNotificador implements INotificador {
  async enviar(mensaje: string) { /* ... */ }
}

class PushNotificador implements INotificador {
  async enviar(mensaje: string) { /* ... */ }
}
```

#### 3. Liskov Substitution Principle (LSP)
**Los subtipos deben ser sustituibles por sus tipos base**

```typescript
// ✅ Bien: Implementación correcta
interface IRepository<T> {
  buscarPorId(id: string): Promise<T | null>;
  crear(entity: T): Promise<T>;
}

class GestanteRepository implements IRepository<GestanteEntity> {
  async buscarPorId(id: string): Promise<GestanteEntity | null> {
    // Implementación
  }
  
  async crear(entity: GestanteEntity): Promise<GestanteEntity> {
    // Implementación
  }
}
```

#### 4. Interface Segregation Principle (ISP)
**No forzar a implementar interfaces que no se usan**

```typescript
// ❌ Mal: Interface muy grande
interface IRepository {
  crear(entity: any): Promise<any>;
  actualizar(id: string, entity: any): Promise<any>;
  eliminar(id: string): Promise<void>;
  buscarPorId(id: string): Promise<any>;
  listar(): Promise<any[]>;
  buscarPorNombre(nombre: string): Promise<any[]>;
  buscarPorFecha(fecha: Date): Promise<any[]>;
  // ... 20 métodos más
}

// ✅ Bien: Interfaces segregadas
interface IReadRepository<T> {
  buscarPorId(id: string): Promise<T | null>;
  listar(): Promise<T[]>;
}

interface IWriteRepository<T> {
  crear(entity: T): Promise<T>;
  actualizar(id: string, entity: T): Promise<T>;
  eliminar(id: string): Promise<void>;
}

interface IGestanteRepository extends IReadRepository<GestanteEntity>, IWriteRepository<GestanteEntity> {
  buscarPorDocumento(documento: string): Promise<GestanteEntity | null>;
}
```

#### 5. Dependency Inversion Principle (DIP)
**Depender de abstracciones, no de concreciones**

```typescript
// ❌ Mal: Dependencia de implementación concreta
class CrearGestanteUseCase {
  private repository = new GestanteRepository(); // ❌ Acoplamiento fuerte
  
  async execute(dto: CrearGestanteDTO) {
    return await this.repository.crear(dto);
  }
}

// ✅ Bien: Dependencia de abstracción
class CrearGestanteUseCase {
  constructor(private repository: IGestanteRepository) {} // ✅ Inyección de dependencia
  
  async execute(dto: CrearGestanteDTO) {
    return await this.repository.crear(dto);
  }
}
```

---

## Clean Architecture

### Regla de Dependencia

```
┌─────────────────────────────────────┐
│  Presentation (Controllers, Routes) │ ← Depende de
├─────────────────────────────────────┤
│  Application (Use Cases, DTOs)      │ ← Depende de
├─────────────────────────────────────┤
│  Domain (Entities, Interfaces)      │ ← NO depende de nadie
├─────────────────────────────────────┤
│  Infrastructure (Repositories, DB)  │ ← Implementa interfaces del Domain
└─────────────────────────────────────┘
```

### ✅ Buenas Prácticas

1. **Domain Layer NO debe importar nada de otras capas**
```typescript
// ❌ Mal
import { prisma } from '../../infrastructure/database/prisma'; // ❌ Domain importando Infrastructure

// ✅ Bien
// Domain solo define interfaces, no importa implementaciones
```

2. **Use Cases solo dependen de interfaces**
```typescript
// ✅ Bien
import { IGestanteRepository } from '../../domain/repositories/gestante.repository.interface';

export class CrearGestanteUseCase {
  constructor(private repository: IGestanteRepository) {} // ✅ Depende de interface
}
```

3. **Controllers no contienen lógica de negocio**
```typescript
// ❌ Mal
export const crearGestante = async (req: Request, res: Response) => {
  const { nombre, documento } = req.body;
  
  // ❌ Lógica de negocio en controller
  if (documento.length < 5) {
    return res.status(400).json({ error: 'Documento inválido' });
  }
  
  const gestante = await prisma.gestante.create({ data: req.body });
  res.json(gestante);
};

// ✅ Bien
export const crearGestante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body; // Ya validado por middleware
    const useCase = new CrearGestanteUseCase(repository);
    const result = await useCase.execute(dto); // ✅ Lógica en use case
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

---

## TypeScript

### Tipos Explícitos

```typescript
// ❌ Mal: Tipos implícitos
function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  return hoy.getFullYear() - fechaNacimiento.getFullYear();
}

// ✅ Bien: Tipos explícitos
function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  return hoy.getFullYear() - fechaNacimiento.getFullYear();
}
```

### Evitar `any`

```typescript
// ❌ Mal
function procesar(data: any): any {
  return data.map((item: any) => item.nombre);
}

// ✅ Bien
interface Item {
  nombre: string;
  edad: number;
}

function procesar(data: Item[]): string[] {
  return data.map(item => item.nombre);
}
```

### Usar Enums

```typescript
// ❌ Mal: Strings mágicos
if (usuario.rol === 'admin') { /* ... */ }

// ✅ Bien: Enums
enum UsuarioRol {
  ADMIN = 'admin',
  MADRINA = 'madrina',
  COORDINADOR = 'coordinador',
}

if (usuario.rol === UsuarioRol.ADMIN) { /* ... */ }
```

---

## Manejo de Errores

### Usar Clases de Error Personalizadas

```typescript
// ❌ Mal
throw new Error('Usuario no encontrado');

// ✅ Bien
throw new NotFoundError('Usuario no encontrado');
```

### Middleware de Manejo de Errores

```typescript
// ✅ Bien
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof BaseError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.statusCode,
      },
    });
  }
  
  // Error no esperado
  logger.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    error: {
      message: 'Error interno del servidor',
      code: 500,
    },
  });
};
```

### Try/Catch en Async Functions

```typescript
// ❌ Mal: Sin manejo de errores
export const crearGestante = async (req: Request, res: Response) => {
  const result = await gestanteService.crear(req.body); // ❌ Puede fallar
  res.json(result);
};

// ✅ Bien: Con try/catch
export const crearGestante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await gestanteService.crear(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error); // ✅ Pasa al middleware de errores
  }
};
```

---

## Validación de Datos

### Usar Zod para Validación

```typescript
// ✅ Bien
import { z } from 'zod';

export const crearGestanteSchema = z.object({
  nombre: z.string().min(2).max(100),
  documento: z.string().regex(/^[0-9]{5,20}$/),
  fechaNacimiento: z.string().refine((val) => !isNaN(Date.parse(val))),
  telefono: z.string().regex(/^[0-9]{10}$/),
});

export type CrearGestanteDTO = z.infer<typeof crearGestanteSchema>;
```

### Validar en Middleware

```typescript
// ✅ Bien
router.post('/gestantes',
  authenticateToken,
  validate(crearGestanteSchema), // ✅ Validación antes del controller
  crearGestante
);
```

---

## Seguridad

### Nunca Exponer Información Sensible

```typescript
// ❌ Mal
res.json({
  usuario: {
    id: usuario.id,
    email: usuario.email,
    password_hash: usuario.password_hash, // ❌ Nunca exponer hash
  },
});

// ✅ Bien
res.json({
  usuario: {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  },
});
```

### Usar Bcrypt para Passwords

```typescript
// ✅ Bien
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Hash password
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

// Verificar password
const isValid = await bcrypt.compare(password, passwordHash);
```

### Rate Limiting

```typescript
// ✅ Bien
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login',
});

router.post('/auth/login', loginLimiter, login);
```

---

## Base de Datos

### Usar Transacciones para Operaciones Múltiples

```typescript
// ✅ Bien
async crearGestanteConControl(dto: CrearGestanteDTO) {
  return await prisma.$transaction(async (tx) => {
    const gestante = await tx.gestante.create({ data: dto });
    const control = await tx.control.create({
      data: {
        gestanteId: gestante.id,
        fecha: new Date(),
      },
    });
    return { gestante, control };
  });
}
```

### Evitar N+1 Queries

```typescript
// ❌ Mal: N+1 queries
const gestantes = await prisma.gestante.findMany();
for (const gestante of gestantes) {
  const controles = await prisma.control.findMany({
    where: { gestanteId: gestante.id },
  }); // ❌ Query por cada gestante
}

// ✅ Bien: Una sola query
const gestantes = await prisma.gestante.findMany({
  include: {
    controles: true, // ✅ Join en una query
  },
});
```

---

## Testing

### Estructura de Tests

```typescript
// ✅ Bien
describe('CrearGestanteUseCase', () => {
  let useCase: CrearGestanteUseCase;
  let mockRepository: jest.Mocked<IGestanteRepository>;

  beforeEach(() => {
    mockRepository = {
      crear: jest.fn(),
      buscarPorDocumento: jest.fn(),
    } as any;
    
    useCase = new CrearGestanteUseCase(mockRepository);
  });

  it('debe crear una gestante válida', async () => {
    const dto = { /* ... */ };
    mockRepository.buscarPorDocumento.mockResolvedValue(null);
    mockRepository.crear.mockResolvedValue(new GestanteEntity(/* ... */));

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(mockRepository.crear).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar error si el documento ya existe', async () => {
    const dto = { /* ... */ };
    mockRepository.buscarPorDocumento.mockResolvedValue(new GestanteEntity(/* ... */));

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictError);
  });
});
```

---

## Logging

### Usar Winston para Logging

```typescript
// ✅ Bien
import { logger } from '../utils/logger';

// Diferentes niveles
logger.error('Error crítico', { error, userId });
logger.warn('Advertencia', { data });
logger.info('Información', { message });
logger.http('HTTP request', { method, url });
logger.debug('Debug info', { details });
```

### No Usar console.log en Producción

```typescript
// ❌ Mal
console.log('Usuario creado:', usuario);

// ✅ Bien
logger.info('Usuario creado', { userId: usuario.id, email: usuario.email });
```

---

## Código Limpio

### Nombres Descriptivos

```typescript
// ❌ Mal
const d = new Date();
const u = await getU(id);
function calc(a, b) { return a + b; }

// ✅ Bien
const fechaActual = new Date();
const usuario = await buscarUsuarioPorId(id);
function calcularEdad(fechaNacimiento: Date, fechaActual: Date): number {
  return fechaActual.getFullYear() - fechaNacimiento.getFullYear();
}
```

### Funciones Pequeñas

```typescript
// ❌ Mal: Función muy grande
async function procesarGestante(data) {
  // 200 líneas de código
}

// ✅ Bien: Funciones pequeñas
async function validarDatos(data) { /* ... */ }
async function crearGestante(data) { /* ... */ }
async function enviarNotificacion(gestante) { /* ... */ }
async function registrarAuditoria(gestante) { /* ... */ }

async function procesarGestante(data) {
  validarDatos(data);
  const gestante = await crearGestante(data);
  await enviarNotificacion(gestante);
  await registrarAuditoria(gestante);
  return gestante;
}
```

### Comentarios Solo Cuando Sea Necesario

```typescript
// ❌ Mal: Comentarios obvios
// Crear una gestante
const gestante = await crearGestante(data);

// ✅ Bien: Código auto-explicativo
const gestante = await crearGestante(data);

// ✅ Bien: Comentario útil
// Usamos Haversine para calcular distancia en esfera (Tierra)
const distancia = calcularDistanciaHaversine(lat1, lng1, lat2, lng2);
```

---

## Conclusión

Estas buenas prácticas garantizan:

✅ **Código mantenible y escalable**
✅ **Fácil de testear**
✅ **Seguro y robusto**
✅ **Fácil de entender**
✅ **Profesional y de calidad**

