# 🤰 Madres Digitales - Backend API

Sistema de monitoreo de salud materna para gestantes en Bolívar, Colombia.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Testing](#testing)
- [Documentación API](#documentación-api)
- [Arquitectura](#arquitectura)
- [Deployment](#deployment)

## ✨ Características

- 🔐 **Autenticación JWT** con refresh tokens
- 🛡️ **Seguridad robusta** con rate limiting y sanitización XSS
- 📊 **Logging estructurado** con Winston
- 🧪 **Testing comprehensivo** con Jest (110+ tests)
- 📝 **Documentación API** con Swagger/OpenAPI
- 🏗️ **Clean Architecture** con separación de capas
- 🗄️ **PostgreSQL + PostGIS** para datos geoespaciales
- 🔄 **Validación** con Zod schemas

## 🛠️ Tecnologías

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Lenguaje**: TypeScript 5.9
- **Base de Datos**: PostgreSQL 15+ con PostGIS
- **ORM**: Prisma 5.22
- **Autenticación**: JWT (jsonwebtoken)
- **Validación**: Zod
- **Testing**: Jest + Supertest
- **Logging**: Winston + Morgan
- **Documentación**: Swagger/OpenAPI

## 📦 Requisitos Previos

- Node.js >= 20.0.0
- PostgreSQL >= 15.0 con extensión PostGIS
- npm >= 10.0.0

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd madres-digitales-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones de base de datos
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate
```

## ⚙️ Configuración

Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/madres_digitales?schema=public"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5000"
```

## 🏃 Ejecución

### Desarrollo

```bash
# Modo desarrollo con hot reload
npm run dev

# El servidor estará disponible en http://localhost:3000
```

### Producción

```bash
# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start
```

### Scripts Disponibles

```bash
npm run dev          # Desarrollo con ts-node-dev
npm run build        # Compilar TypeScript
npm start            # Ejecutar versión compilada
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con cobertura
npm run lint         # Linter
npm run format       # Formatear código
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests específicos
npm test -- --testPathPattern="auth"
```

### Cobertura de Tests

- **Tests Unitarios**: 40+ tests
- **Tests de Integración**: 35+ tests
- **Tests E2E**: 35+ tests
- **Total**: 110+ tests

## 📚 Documentación API

### Swagger UI

Una vez el servidor esté corriendo, accede a:

```
http://localhost:3000/api-docs
```

### Endpoints Principales

#### Autenticación

```http
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/profile
```

#### Gestantes

```http
GET    /api/gestantes
POST   /api/gestantes
GET    /api/gestantes/:id
PUT    /api/gestantes/:id
DELETE /api/gestantes/:id
```

#### Controles Prenatales

```http
GET    /api/controles
POST   /api/controles
GET    /api/controles/:id
PUT    /api/controles/:id
```

## 🏗️ Arquitectura

### Clean Architecture

```
src/
├── core/                    # Capa de dominio
│   ├── domain/
│   │   ├── entities/       # Entidades de negocio
│   │   ├── repositories/   # Interfaces de repositorios
│   │   └── errors/         # Errores de dominio
│   └── application/
│       ├── use-cases/      # Casos de uso
│       └── dtos/           # Data Transfer Objects
├── infrastructure/          # Capa de infraestructura
│   ├── repositories/       # Implementaciones de repositorios
│   └── database/           # Configuración de BD
├── controllers/            # Controladores HTTP
├── routes/                 # Definición de rutas
├── middlewares/            # Middlewares Express
├── services/               # Servicios de aplicación
└── config/                 # Configuración
```

### Capas

1. **Domain Layer**: Lógica de negocio pura
2. **Application Layer**: Casos de uso y DTOs
3. **Infrastructure Layer**: Implementaciones técnicas
4. **Presentation Layer**: Controllers y Routes

## 🔐 Seguridad

- ✅ JWT con refresh tokens
- ✅ Rate limiting por endpoint
- ✅ Sanitización XSS
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de entrada con Zod
- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ Audit logging de eventos de seguridad

## 📊 Logging

### Niveles de Log

- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `http`: Requests HTTP
- `debug`: Debugging

### Archivos de Log

- `logs/error.log`: Solo errores
- `logs/combined.log`: Todos los logs
- `logs/http.log`: Requests HTTP

## 🚢 Deployment

### Variables de Entorno Requeridas

```env
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<strong-secret-key>
JWT_REFRESH_SECRET=<strong-refresh-secret>
NODE_ENV=production
PORT=3000
```

### Pasos de Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Migraciones**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Start**:
   ```bash
   npm start
   ```

### Docker (Opcional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 👥 Roles de Usuario

- `super_admin`: Acceso total al sistema
- `admin`: Administración general
- `coordinador`: Coordinación de madrinas
- `madrina`: Seguimiento de gestantes
- `medico`: Acceso médico

## 📝 Licencia

Privado - Todos los derechos reservados

## 👨‍💻 Equipo

- **Desarrollador Principal**: Wilson Zuccardi
- **Email**: wzuccardi@gmail.com

## 🤝 Contribución

Este es un proyecto privado. Para contribuir, contactar al equipo de desarrollo.

## 📞 Soporte

Para soporte técnico, contactar a: wzuccardi@gmail.com

