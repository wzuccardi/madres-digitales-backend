# 🚀 Guía Rápida: Ejecutar Localmente sin Perder Configuración de Producción

## ✅ Lo que ya está hecho

```
✅ .env                    → Configuración de PRODUCCIÓN (Vercel)
✅ .env.local              → Configuración de DESARROLLO (Local)
✅ .env.example            → Plantilla para otros desarrolladores
✅ .gitignore              → Ambos archivos están ignorados (seguros)
✅ ENV_SETUP.md            → Documentación completa
```

## 🎯 Próximos Pasos para Ejecutar Localmente

### 1️⃣ Instala PostgreSQL (si no lo tienes)

**Opción A: Instalación local**
- Descarga desde: https://www.postgresql.org/download/
- Usuario: `postgres`
- Contraseña: `postgres`
- Puerto: `5432`

**Opción B: Docker (más fácil)**
```bash
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 2️⃣ Verifica que `.env.local` existe

```bash
# En la carpeta del backend
ls -la .env.local

# Deberías ver:
# -rw-r--r--  1 user  group  1234 Oct 30 10:00 .env.local
```

### 3️⃣ Instala dependencias

```bash
cd aplicacionWZC/madres-digitales-backend
npm install
```

### 4️⃣ Sincroniza la base de datos

```bash
# Crea las tablas en tu BD local
npx prisma migrate dev

# O si prefieres:
npx prisma db push
```

### 5️⃣ Ejecuta el servidor

```bash
# Modo desarrollo (con hot reload)
npm run dev

# O modo producción
npm start
```

### 6️⃣ Verifica que funciona

```bash
# En otra terminal
curl http://localhost:3000/api/health

# Deberías ver:
# {"status":"ok","timestamp":"2025-10-30T..."}
```

## 📊 Comparación de Configuraciones

```
┌─────────────────────────────────────────────────────────────┐
│                    DESARROLLO LOCAL                         │
├─────────────────────────────────────────────────────────────┤
│ Archivo:        .env.local                                  │
│ Base de datos:  PostgreSQL local (localhost:5432)           │
│ Puerto:         3000                                        │
│ NODE_ENV:       development                                 │
│ CORS:           http://localhost:3000, 3001, 8080          │
│ URLs:           http://localhost:3000/3001                 │
│ JWT:            Simples (dev_secret_key_12345)             │
│ Logs:           debug                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN (VERCEL)                      │
├─────────────────────────────────────────────────────────────┤
│ Archivo:        .env                                        │
│ Base de datos:  Prisma Cloud (db.prisma.io)               │
│ Puerto:         3000                                        │
│ NODE_ENV:       production                                  │
│ CORS:           https://madres-digitales-frontend.vercel.. │
│ URLs:           https://madres-digitales-backend.vercel... │
│ JWT:            Complejos (M4dr3sD1g1t4l3s...)             │
│ Logs:           info                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Seguridad

✅ **Tus configuraciones de producción están seguras**
- `.env` NO se sube a Git (está en `.gitignore`)
- `.env.local` NO se sube a Git (está en `.gitignore`)
- Solo `.env.example` se sube (sin valores sensibles)

✅ **Puedes cambiar entre ambientes sin problemas**
- Desarrollo: Node.js carga `.env.local`
- Producción: Vercel carga variables de entorno

## 🆘 Solución de Problemas

### Error: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Error: "Connection refused" (BD)
```bash
# Verifica que PostgreSQL está corriendo
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### Error: "Port 3000 already in use"
```bash
# Cambia el puerto en .env.local
PORT="3001"
```

### Error: "Prisma migrations failed"
```bash
# Resetea la BD (CUIDADO: borra datos)
npx prisma migrate reset

# O sincroniza sin migrar
npx prisma db push
```

## 📝 Checklist Final

- [ ] PostgreSQL está corriendo
- [ ] `.env.local` existe en la carpeta del backend
- [ ] `npm install` completado
- [ ] `npx prisma migrate dev` ejecutado
- [ ] `npm run dev` inicia sin errores
- [ ] `curl http://localhost:3000/api/health` responde
- [ ] `.env` de producción está intacto
- [ ] Puedes hacer cambios locales sin afectar producción

## 🎉 ¡Listo!

Ahora puedes:
- ✅ Probar la aplicación localmente
- ✅ Hacer cambios sin afectar producción
- ✅ Mantener configuraciones de Vercel seguras
- ✅ Cambiar entre ambientes fácilmente

## 📞 Preguntas Frecuentes

**P: ¿Pierdo mis configuraciones de producción?**
R: No. El `.env` está intacto y en `.gitignore`. Vercel seguirá usando esas variables.

**P: ¿Puedo usar la BD de Prisma Cloud en desarrollo?**
R: Sí. Edita `.env.local` y descomenta la línea de DATABASE_URL de Prisma Cloud.

**P: ¿Qué pasa si elimino `.env.local`?**
R: Node.js usará `.env` por defecto. Puedes recrear `.env.local` en cualquier momento.

**P: ¿Cómo cambio entre desarrollo y producción?**
R: Automáticamente. Node.js carga `.env.local` si existe, sino usa `.env`.

