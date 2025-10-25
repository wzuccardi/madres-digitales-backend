# 📋 MEMORIA COMPLETA DEL ESQUEMA PRISMA - MADRES DIGITALES

## 🔧 CONFIGURACIÓN BÁSICA

### Database Connection
```env
DATABASE_URL="postgresql://postgres:731026@localhost:5432/madres_digitales"
JWT_SECRET="your_jwt_secret"
PORT=3000
```

### Prisma Configuration
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📊 ENUMS DEFINIDOS

### UsuarioRol
```prisma
enum UsuarioRol {
  madrina
  coordinador
  admin
  medico
  super_admin
}
```

### AlertaTipo
```prisma
enum AlertaTipo {
  riesgo_alto
  control_vencido
  sintoma_alarma
  emergencia_obstetrica
  trabajo_parto
  medicacion
  laboratorio
  sos
}
```

### PrioridadNivel
```prisma
enum PrioridadNivel {
  baja
  media
  alta
  critica
}
```

### DispositivoEstado
```prisma
enum DispositivoEstado {
  disponible
  asignado
  activo
  perdido
  danado
  en_reparacion
}
```

### DocumentoTipo
```prisma
enum DocumentoTipo {
  cedula
  tarjeta_identidad
  pasaporte
  registro_civil
}
```

### IpsNivel
```prisma
enum IpsNivel {
  primario
  secundario
  terciario
}
```

### KitEstado
```prisma
enum KitEstado {
  entregado
  devuelto
  perdido
}
```

### RegimenTipo
```prisma
enum RegimenTipo {
  contributivo
  subsidiado
  especial
  no_afiliado
}
```

### UbicacionEvento
```prisma
enum UbicacionEvento {
  control_prenatal
  visita_domiciliaria
  emergencia
  seguimiento_rutinario
}
```

## 🏗️ MODELOS PRINCIPALES

### 1. Municipio
```prisma
model Municipio {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  codigo_dane  String
  nombre       String
  departamento String
  coordenadas  Json? // GeoJSON Point
  geojson      Json? // GeoJSON extra
  activo       Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @default(now())
  @@map("municipios")
}
```

**Relaciones:**
- Tiene muchos usuarios (Usuario.municipio_id)
- Tiene muchas gestantes (Gestante.municipio_id)
- Tiene muchas IPS (Ips.municipio_id)

### 2. Usuario
```prisma
model Usuario {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email             String   @unique
  password_hash     String
  nombre            String
  documento         String?
  telefono          String?
  rol               UsuarioRol
  municipio_id      String?  @db.Uuid
  direccion         String?
  coordenadas       Json? // GeoJSON Point
  zona_cobertura    Json? // GeoJSON Polygon
  activo            Boolean  @default(true)
  ultimo_acceso     DateTime?
  created_at        DateTime @default(now())
  updated_at        DateTime @default(now())
  @@map("usuarios")
}
```

**Relaciones:**
- Pertenece a un municipio (municipio_id -> Municipio.id)
- Puede ser madrina de muchas gestantes (Gestante.madrina_id)
- Puede realizar controles prenatales (ControlPrenatal.realizado_por_id)
- Puede resolver alertas (Alerta.resuelto_por_id)
- Puede generar alertas (Alerta.generado_por_id)
- Puede tener dispositivos asignados (Dispositivo.madrina_id)

### 3. Gestante
```prisma
model Gestante {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  documento               String
  tipo_documento          DocumentoTipo @default(cedula)
  nombre                  String
  fecha_nacimiento        DateTime
  telefono                String?
  direccion               String?
  coordenadas             Json? // GeoJSON Point
  municipio_id            String?  @db.Uuid
  madrina_id              String?  @db.Uuid
  ips_asignada_id         String?  @db.Uuid
  medico_tratante_id      String?  @db.Uuid
  medico_asignado_id      String?  @db.Uuid
  eps                     String?
  regimen_salud           RegimenTipo @default(subsidiado)
  fecha_ultima_menstruacion DateTime?
  fecha_probable_parto    DateTime?
  numero_embarazo         Int?     @default(1)
  riesgo_alto             Boolean  @default(false)
  factores_riesgo         Json? // Array of strings
  grupo_sanguineo         String?
  contacto_emergencia_nombre String?
  contacto_emergencia_telefono String?
  activa                  Boolean  @default(true)
  created_at              DateTime @default(now())
  updated_at              DateTime @default(now())
  @@map("gestantes")
}
```

**Relaciones:**
- Pertenece a un municipio (municipio_id -> Municipio.id)
- Tiene una madrina asignada (madrina_id -> Usuario.id)
- Tiene una IPS asignada (ips_asignada_id -> Ips.id)
- Tiene un médico tratante (medico_tratante_id -> Medico.id)
- Tiene un médico asignado (medico_asignado_id -> Medico.id)
- Tiene muchos controles prenatales (ControlPrenatal.gestante_id)
- Tiene muchas alertas (Alerta.gestante_id)

### 4. ControlPrenatal
```prisma
model ControlPrenatal {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  gestante_id             String   @db.Uuid
  realizado_por_id        String   @db.Uuid
  fecha_control           DateTime
  semanas_gestacion       Int?
  peso                    Decimal? @db.Decimal(5, 2)
  talla                   Decimal? @db.Decimal(5, 2)
  presion_sistolica       Int?
  presion_diastolica      Int?
  frecuencia_cardiaca     Int?
  frecuencia_respiratoria Int?
  temperatura             Decimal? @db.Decimal(4, 2)
  altura_uterina          Decimal? @db.Decimal(4, 1)
  presentacion_fetal      String?
  movimientos_fetales     Boolean?
  edemas                  Boolean?
  observaciones           String?
  recomendaciones         String?
  proxima_cita            DateTime?
  lugar_control           String?
  coordenadas_control     Json? // GeoJSON Point
  medico_id               String?  @db.Uuid
  ips_id                  String?  @db.Uuid
  sincronizado            Boolean  @default(false)
  created_at              DateTime @default(now())
  @@map("controles_prenatales")
}
```

**Relaciones:**
- Pertenece a una gestante (gestante_id -> Gestante.id)
- Realizado por un usuario (realizado_por_id -> Usuario.id)
- Puede tener un médico asociado (medico_id -> Medico.id)
- Puede tener una IPS asociada (ips_id -> Ips.id)

### 5. Ips
```prisma
model Ips {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  codigo_habilitacion String
  nombre             String
  nit                String?
  direccion          String
  telefono           String?
  email              String?
  municipio_id       String?  @db.Uuid
  coordenadas        Json? // GeoJSON Point
  nivel_atencion     IpsNivel
  servicios_disponibles Json? // Array of strings
  horario_atencion   Json?
  activa             Boolean  @default(true)
  created_at         DateTime @default(now())
  updated_at         DateTime @default(now())
  @@map("ips")
}
```

**Relaciones:**
- Pertenece a un municipio (municipio_id -> Municipio.id)
- Tiene muchos médicos (Medico.ips_id)
- Puede ser asignada a gestantes (Gestante.ips_asignada_id)
- Puede ser derivada en alertas (Alerta.ips_derivada_id)

### 6. Medico
```prisma
model Medico {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nombre            String
  documento         String
  registro_medico   String
  especialidad      String?
  telefono          String?
  email             String?
  ips_id            String?  @db.Uuid
  activo            Boolean  @default(true)
  created_at        DateTime @default(now())
  updated_at        DateTime @default(now())
  @@map("medicos")
}
```

**Relaciones:**
- Pertenece a una IPS (ips_id -> Ips.id)
- Puede ser médico tratante de gestantes (Gestante.medico_tratante_id)
- Puede ser médico asignado de gestantes (Gestante.medico_asignado_id)
- Puede ser asignado a alertas (Alerta.medico_asignado_id)

### 7. Alerta
```prisma
model Alerta {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  gestante_id       String   @db.Uuid
  tipo_alerta       AlertaTipo
  nivel_prioridad   PrioridadNivel
  mensaje           String
  sintomas          Json? // Array of strings
  coordenadas_alerta Json? // GeoJSON Point
  madrina_id        String?  @db.Uuid
  medico_asignado_id String? @db.Uuid
  ips_derivada_id   String?  @db.Uuid
  resuelta          Boolean  @default(false)
  resuelto_por_id   String?  @db.Uuid
  fecha_resolucion  DateTime?
  tiempo_respuesta  Int?
  generado_por_id   String?  @db.Uuid
  es_automatica     Boolean  @default(false)
  control_origen_id String?  @db.Uuid
  algoritmo_version String?
  created_at        DateTime @default(now())
  @@map("alertas")
}
```

**Relaciones:**
- Pertenece a una gestante (gestante_id -> Gestante.id)
- Asignada a una madrina (madrina_id -> Usuario.id)
- Asignada a un médico (medico_asignado_id -> Medico.id)
- Derivada a una IPS (ips_derivada_id -> Ips.id)
- Resuelta por un usuario (resuelto_por_id -> Usuario.id)
- Generada por un usuario (generado_por_id -> Usuario.id)
- Puede originarse de un control (control_origen_id -> ControlPrenatal.id)

### 8. Dispositivo
```prisma
model Dispositivo {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  serial_number     String
  modelo            String
  madrina_id        String?  @db.Uuid
  estado            DispositivoEstado @default(disponible)
  fecha_asignacion  DateTime?
  fecha_ultima_sincronizacion DateTime?
  version_app       String?
  nivel_bateria     Int?
  ubicacion_gps     Json? // GeoJSON Point
  created_at        DateTime @default(now())
  updated_at        DateTime @default(now())
  @@map("dispositivos")
}
```

**Relaciones:**
- Asignado a una madrina (madrina_id -> Usuario.id)

## 🔗 FOREIGN KEYS ESTABLECIDAS

1. **Usuario.municipio_id** -> Municipio.id (SET NULL)
2. **Gestante.municipio_id** -> Municipio.id (SET NULL)
3. **Gestante.madrina_id** -> Usuario.id (SET NULL)
4. **Gestante.ips_asignada_id** -> Ips.id (SET NULL)
5. **Gestante.medico_tratante_id** -> Medico.id (SET NULL)
6. **Gestante.medico_asignado_id** -> Medico.id (SET NULL)
7. **ControlPrenatal.gestante_id** -> Gestante.id (RESTRICT)
8. **ControlPrenatal.realizado_por_id** -> Usuario.id (RESTRICT)
9. **Ips.municipio_id** -> Municipio.id (SET NULL)
10. **Medico.ips_id** -> Ips.id (SET NULL)
11. **Alerta.gestante_id** -> Gestante.id (RESTRICT)
12. **Alerta.madrina_id** -> Usuario.id (SET NULL)
13. **Alerta.medico_asignado_id** -> Medico.id (SET NULL)
14. **Alerta.ips_derivada_id** -> Ips.id (SET NULL)
15. **Alerta.resuelto_por_id** -> Usuario.id (SET NULL)
16. **Alerta.generado_por_id** -> Usuario.id (SET NULL)
17. **Dispositivo.madrina_id** -> Usuario.id (SET NULL)

## 🔑 UNIQUE CONSTRAINTS

1. **Usuario.email** - UNIQUE
2. **Usuario.documento** - UNIQUE
3. **Gestante.documento** - UNIQUE
4. **Municipio.codigo_dane** - UNIQUE
5. **Ips.codigo_habilitacion** - UNIQUE
6. **Medico.documento** - UNIQUE
7. **Medico.registro_medico** - UNIQUE
8. **Dispositivo.serial_number** - UNIQUE

## 📍 CAMPOS GEOESPACIALES (JSON)

Todos los campos de coordenadas usan formato **GeoJSON Point**:
```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

### Campos con coordenadas:
- **Municipio.coordenadas** - Ubicación del municipio
- **Municipio.geojson** - Geometría completa del municipio
- **Usuario.coordenadas** - Ubicación del usuario
- **Usuario.zona_cobertura** - Polígono de cobertura (GeoJSON Polygon)
- **Gestante.coordenadas** - Ubicación de la gestante
- **ControlPrenatal.coordenadas_control** - Ubicación donde se realizó el control
- **Ips.coordenadas** - Ubicación de la IPS
- **Alerta.coordenadas_alerta** - Ubicación donde se generó la alerta
- **Dispositivo.ubicacion_gps** - Última ubicación conocida del dispositivo

## 🚨 CAMPOS CRÍTICOS PARA ALERTAS AUTOMÁTICAS

### En ControlPrenatal (para evaluación médica):
- **presion_sistolica** / **presion_diastolica** - Para detectar hipertensión
- **frecuencia_cardiaca** - Para detectar taquicardia
- **temperatura** - Para detectar fiebre
- **movimientos_fetales** - Para detectar ausencia de movimientos
- **edemas** - Para detectar preeclampsia
- **semanas_gestacion** - Para calcular riesgos por edad gestacional

### En Gestante (para factores de riesgo):
- **riesgo_alto** - Marcador de alto riesgo
- **factores_riesgo** - Array JSON con factores específicos
- **fecha_ultima_menstruacion** - Para calcular edad gestacional
- **numero_embarazo** - Para evaluar riesgo por multiparidad

### En Alerta (para seguimiento):
- **es_automatica** - Distingue alertas automáticas vs manuales
- **algoritmo_version** - Versión del algoritmo que generó la alerta
- **control_origen_id** - Control que originó la alerta automática

## 📊 DATOS EXISTENTES

### Municipios de Bolívar
- **46 municipios** importados con códigos DANE
- Incluye coordenadas geográficas
- Departamento: "Bolívar"

### Usuarios de prueba
- Usuarios con diferentes roles (madrina, coordinador, admin, medico)
- Contraseñas hasheadas con bcrypt

## 🔧 COMANDOS PRISMA IMPORTANTES

```bash
# Generar cliente
npx prisma generate

# Aplicar migraciones
npx prisma db push

# Ver estado de la BD
npx prisma studio

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Reset completo
npx prisma migrate reset
```

## ⚠️ PROBLEMAS CONOCIDOS

1. **Campos faltantes en código vs esquema:**
   - `medico_tratante_id` existe en esquema pero TypeScript no lo reconoce
   - `estado` campo faltante en modelo Alerta
   - `descripcion_detallada` campo faltante en modelo Alerta

2. **Relaciones no reconocidas por TypeScript:**
   - Include clauses devuelven `never`
   - Propiedades de relaciones no accesibles

3. **Campos de coordenadas:**
   - `latitud` y `longitud` no existen como campos separados
   - Se usa `coordenadas` JSON con formato GeoJSON

## 🎯 PRÓXIMOS PASOS PARA ARREGLAR

1. **Regenerar cliente Prisma** con permisos correctos
2. **Verificar sincronización** entre esquema y base de datos
3. **Agregar campos faltantes** al esquema si es necesario
4. **Actualizar tipos TypeScript** para reconocer relaciones
5. **Probar queries** con include para verificar relaciones
