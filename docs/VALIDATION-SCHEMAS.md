# 📋 Schemas de Validación - Madres Digitales

## Índice

1. [Introducción](#introducción)
2. [Schemas de Gestante](#schemas-de-gestante)
3. [Schemas de Control Prenatal](#schemas-de-control-prenatal)
4. [Schemas de Alerta](#schemas-de-alerta)
5. [Schemas de Autenticación](#schemas-de-autenticación)
6. [Schemas de Usuario](#schemas-de-usuario)
7. [Schemas de IPS](#schemas-de-ips)
8. [Schemas de Médico](#schemas-de-médico)
9. [Uso de Schemas](#uso-de-schemas)
10. [Casos de Error Comunes](#casos-de-error-comunes)

---

## Introducción

Este documento describe todos los schemas de validación implementados con **Zod** en el sistema Madres Digitales.

### ¿Qué es Zod?

Zod es una librería de validación y parsing de datos con TypeScript-first. Proporciona:

- ✅ Validación de tipos en runtime
- ✅ Inferencia automática de tipos TypeScript
- ✅ Mensajes de error descriptivos
- ✅ Composición de schemas
- ✅ Transformaciones de datos

### Convenciones

- **Schemas de creación**: `crear[Entidad]Schema`
- **Schemas de actualización**: `actualizar[Entidad]Schema`
- **Schemas de filtros**: `filtros[Entidad]Schema`
- **Tipos inferidos**: `[Nombre]DTO`

---

## Schemas de Gestante

### CrearGestanteSchema

**Ubicación**: `src/core/application/dtos/gestante.dto.ts`

**Propósito**: Validar datos para crear una nueva gestante.

```typescript
export const crearGestanteSchema = z.object({
  // Información Personal
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  
  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  
  // Documento de Identidad
  documento: z.string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'El documento no puede exceder 20 caracteres')
    .regex(/^[0-9]+$/, 'El documento solo puede contener números'),
  
  tipoDocumento: z.enum(['cedula', 'tarjeta_identidad', 'pasaporte', 'registro_civil'], {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),
  
  // Fechas
  fechaNacimiento: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha de nacimiento inválida')
    .refine((val) => {
      const fecha = new Date(val);
      const edad = new Date().getFullYear() - fecha.getFullYear();
      return edad >= 10 && edad <= 60;
    }, 'La edad debe estar entre 10 y 60 años'),
  
  // Contacto
  telefono: z.string()
    .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos'),
  
  direccion: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  
  // Relaciones
  municipioId: z.string()
    .uuid('ID de municipio inválido'),
  
  ipsId: z.string()
    .uuid('ID de IPS inválido')
    .optional(),
  
  madrinaId: z.string()
    .uuid('ID de madrina inválido')
    .optional(),
  
  // Información Obstétrica
  fechaUltimaMenstruacion: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida')
    .refine((val) => {
      const fecha = new Date(val);
      const hoy = new Date();
      return fecha <= hoy;
    }, 'La fecha no puede ser futura'),
  
  fechaProbableParto: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida')
    .refine((val) => {
      const fecha = new Date(val);
      const hoy = new Date();
      return fecha >= hoy;
    }, 'La fecha debe ser futura'),
  
  numeroEmbarazos: z.number()
    .int('Debe ser un número entero')
    .min(1, 'Debe ser al menos 1')
    .max(20, 'No puede exceder 20'),
  
  numeroPartos: z.number()
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo')
    .max(20, 'No puede exceder 20'),
  
  numeroAbortos: z.number()
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo')
    .max(20, 'No puede exceder 20'),
  
  // Información Médica
  grupoSanguineo: z.enum(['A', 'B', 'AB', 'O'], {
    errorMap: () => ({ message: 'Grupo sanguíneo inválido' }),
  }),
  
  factorRh: z.enum(['+', '-'], {
    errorMap: () => ({ message: 'Factor Rh inválido' }),
  }),
  
  alergias: z.string()
    .max(500, 'No puede exceder 500 caracteres')
    .optional(),
  
  enfermedadesPreexistentes: z.string()
    .max(500, 'No puede exceder 500 caracteres')
    .optional(),
  
  observaciones: z.string()
    .max(1000, 'No puede exceder 1000 caracteres')
    .optional(),
  
  // Geolocalización
  latitud: z.number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida')
    .optional(),
  
  longitud: z.number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida')
    .optional(),
});

export type CrearGestanteDTO = z.infer<typeof crearGestanteSchema>;
```

### ActualizarGestanteSchema

```typescript
export const actualizarGestanteSchema = crearGestanteSchema.partial();
export type ActualizarGestanteDTO = z.infer<typeof actualizarGestanteSchema>;
```

### FiltrosGestanteSchema

```typescript
export const filtrosGestanteSchema = z.object({
  municipioId: z.string().uuid().optional(),
  madrinaId: z.string().uuid().optional(),
  ipsId: z.string().uuid().optional(),
  altoRiesgo: z.boolean().optional(),
  activo: z.boolean().optional(),
  busqueda: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type FiltrosGestanteDTO = z.infer<typeof filtrosGestanteSchema>;
```

---

## Schemas de Control Prenatal

### CrearControlSchema

**Ubicación**: `src/core/application/dtos/control.dto.ts`

```typescript
export const crearControlSchema = z.object({
  gestanteId: z.string().uuid('ID de gestante inválido'),
  
  fecha: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  
  semanasGestacion: z.number()
    .int('Debe ser un número entero')
    .min(1, 'Debe ser al menos 1')
    .max(42, 'No puede exceder 42 semanas'),
  
  peso: z.number()
    .min(30, 'El peso debe ser al menos 30 kg')
    .max(200, 'El peso no puede exceder 200 kg'),
  
  presionArterialSistolica: z.number()
    .int('Debe ser un número entero')
    .min(60, 'Valor muy bajo')
    .max(250, 'Valor muy alto'),
  
  presionArterialDiastolica: z.number()
    .int('Debe ser un número entero')
    .min(40, 'Valor muy bajo')
    .max(150, 'Valor muy alto'),
  
  alturaUterinaFundal: z.number()
    .min(0, 'No puede ser negativo')
    .max(50, 'Valor muy alto')
    .optional(),
  
  frecuenciaCardiacaFetal: z.number()
    .int('Debe ser un número entero')
    .min(100, 'Valor muy bajo')
    .max(200, 'Valor muy alto')
    .optional(),
  
  movimientosFetales: z.boolean().optional(),
  
  edema: z.boolean().optional(),
  
  proteinuria: z.boolean().optional(),
  
  glucosuria: z.boolean().optional(),
  
  observaciones: z.string()
    .max(1000, 'No puede exceder 1000 caracteres')
    .optional(),
  
  proximaCita: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida')
    .optional(),
});

export type CrearControlDTO = z.infer<typeof crearControlSchema>;
```

---

## Schemas de Alerta

### CrearAlertaSchema

**Ubicación**: `src/core/application/dtos/alerta.dto.ts`

```typescript
export const crearAlertaSchema = z.object({
  gestanteId: z.string().uuid('ID de gestante inválido'),
  
  tipo: z.enum([
    'riesgo_alto',
    'control_vencido',
    'sintoma_alarma',
    'emergencia_obstetrica',
    'trabajo_parto',
    'medicacion',
    'laboratorio',
    'sos',
  ], {
    errorMap: () => ({ message: 'Tipo de alerta inválido' }),
  }),
  
  prioridad: z.enum(['baja', 'media', 'alta', 'critica'], {
    errorMap: () => ({ message: 'Prioridad inválida' }),
  }),
  
  titulo: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  descripcion: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  
  recomendaciones: z.string()
    .max(1000, 'No puede exceder 1000 caracteres')
    .optional(),
  
  activa: z.boolean().default(true),
});

export type CrearAlertaDTO = z.infer<typeof crearAlertaSchema>;
```

---

## Schemas de Autenticación

### LoginSchema

**Ubicación**: `src/core/application/dtos/auth.dto.ts`

```typescript
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
```

### RegisterSchema

```typescript
export const registerSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  
  rol: z.enum(['madrina', 'coordinador', 'admin', 'medico', 'super_admin'], {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
  
  municipioId: z.string()
    .uuid('ID de municipio inválido')
    .optional(),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
```

---

## Uso de Schemas

### En Middleware

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
      
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

### En Rutas

```typescript
// src/routes/gestantes.routes.ts
import { Router } from 'express';
import { crearGestanteSchema } from '../core/application/dtos/gestante.dto';
import { validate } from '../middlewares/validation.middleware';
import { crearGestante } from '../controllers/gestante.controller';

const router = Router();

router.post('/',
  authenticateToken,
  validate(crearGestanteSchema),
  crearGestante
);

export default router;
```

---

## Casos de Error Comunes

### Error de Tipo

```json
{
  "success": false,
  "error": {
    "message": "Datos de entrada inválidos",
    "code": 400,
    "details": [
      {
        "field": "edad",
        "message": "Expected number, received string"
      }
    ]
  }
}
```

### Error de Validación

```json
{
  "success": false,
  "error": {
    "message": "Datos de entrada inválidos",
    "code": 400,
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      },
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ]
  }
}
```

### Error de Enum

```json
{
  "success": false,
  "error": {
    "message": "Datos de entrada inválidos",
    "code": 400,
    "details": [
      {
        "field": "rol",
        "message": "Rol inválido"
      }
    ]
  }
}
```

---

## Conclusión

Los schemas de validación proporcionan:

✅ **Validación automática de datos**
✅ **Type-safety con TypeScript**
✅ **Mensajes de error descriptivos**
✅ **Documentación implícita**
✅ **Prevención de inyección de datos**

