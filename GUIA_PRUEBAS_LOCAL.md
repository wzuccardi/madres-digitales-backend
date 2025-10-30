# 🧪 GUÍA DE PRUEBAS LOCAL

## 🚀 Estado Actual

✅ **Backend**: Corriendo en http://localhost:54112
✅ **Frontend**: Corriendo en http://localhost:3008
✅ **Base de Datos**: Poblada con datos de prueba
✅ **API Docs**: http://localhost:54112/api-docs

## 📋 Datos de Prueba Disponibles

### Usuarios
```
Email: admin@madresdigitales.com
Rol: ADMIN
Contraseña: password123

Email: madrina@madresdigitales.com
Rol: MADRINA
Contraseña: password123

Email: medico@madresdigitales.com
Rol: MEDICO
Contraseña: password123
```

### Datos Creados
- 3 Municipios (Cartagena, Turbaco, Arjona)
- 2 IPS (Clínica Madres Digitales, Hospital Universitario)
- 2 Médicos (Dr. Carlos Rodríguez, Dra. Ana García)
- 2 Gestantes (María Elena Rodríguez, Ana Sofía Martínez)
- 2 Alertas (Recordatorio de control, Síntomas preocupantes)
- 7 Contenidos educativos

## 🧪 Pruebas Recomendadas

### 1. Verificar Conexión a BD
```bash
node scripts/diagnostico-bd.js
```

### 2. Probar Endpoints Principales

#### Gestantes
```bash
curl http://localhost:54112/api/gestantes
```

#### Médicos
```bash
curl http://localhost:54112/api/medicos
```

#### IPS
```bash
curl http://localhost:54112/api/ips
```

#### Alertas
```bash
curl http://localhost:54112/api/alertas
```

#### Contenido
```bash
curl "http://localhost:54112/api/contenido?categoria=NUTRICION"
```

#### Reportes
```bash
curl "http://localhost:54112/api/reportes/resumen-general"
```

### 3. Descargar Reportes

#### PDF
```bash
curl "http://localhost:54112/api/reportes/descargar/resumen-general/pdf" -o resumen.pdf
```

#### Excel
```bash
curl "http://localhost:54112/api/reportes/descargar/resumen-general/excel" -o resumen.xlsx
```

## 🔍 Problemas Conocidos

### 1. Categorías de Contenido
El frontend envía categorías que no existen en el backend.

**Solución**: Actualizar `lib/services/simple_data_service.dart` para usar:
- NUTRICION
- EJERCICIO
- CUIDADO_PERSONAL
- PREPARACION_PARTO
- LACTANCIA
- SALUD_MENTAL
- DESARROLLO_FETAL

### 2. Rutas de Reportes
El frontend intenta acceder a `/api/reportes/descargar/resumen-general` sin extensión.

**Solución**: Usar `/api/reportes/descargar/resumen-general/pdf` o `/excel`

## 📊 Flujo de Prueba Recomendado

1. **Verificar BD**
   ```bash
   node scripts/diagnostico-bd.js
   ```

2. **Probar Endpoints**
   - Gestantes: ✅
   - Médicos: ✅
   - IPS: ✅
   - Alertas: ✅
   - Contenido: ⏳ (necesita categorías correctas)
   - Reportes: ⏳ (necesita rutas correctas)

3. **Probar Frontend**
   - Login: ✅
   - Dashboard: ⏳ (depende de categorías)
   - Gestantes: ✅
   - Médicos: ✅
   - Alertas: ✅
   - Reportes: ⏳ (depende de rutas)

4. **Desplegar a Vercel**
   - Hacer push a Git
   - Vercel desplegará automáticamente

## 🔧 Comandos Útiles

```bash
# Reiniciar backend
npm run dev

# Ver logs
tail -f logs/error.log

# Limpiar BD (cuidado!)
npx prisma db push --force-reset

# Repoblar BD
node scripts/seed-datos-rapido.js
node scripts/seed-contenido-rapido.js
```

## 📝 Notas

- La BD está en Prisma Cloud (db.prisma.io)
- Los datos de prueba se pueden regenerar en cualquier momento
- El backend está configurado para desarrollo local
- El frontend está en modo desarrollo con hot reload

## ✅ Checklist de Pruebas

- [ ] BD conectada y poblada
- [ ] Endpoints de gestantes funcionan
- [ ] Endpoints de médicos funcionan
- [ ] Endpoints de IPS funcionan
- [ ] Endpoints de alertas funcionan
- [ ] Endpoints de contenido funcionan (con categorías correctas)
- [ ] Endpoints de reportes funcionan (con rutas correctas)
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Dashboard muestra datos
- [ ] Reportes se descargan correctamente

