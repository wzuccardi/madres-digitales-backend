# Sistema de Alertas Automáticas - Madres Digitales

## 📋 Descripción General

El Sistema de Alertas Automáticas es una implementación completa de evaluación de riesgos obstétricos basada en evidencia médica que detecta automáticamente signos de alarma y genera alertas críticas en tiempo real.

## 🎯 Características Principales

### ✅ **Evaluación Automática de Signos de Alarma**
- Detección automática de emergencias obstétricas
- Evaluación de preeclampsia y hipertensión severa
- Identificación de trabajo de parto prematuro
- Análisis de signos vitales alterados
- Detección de síntomas de sepsis materna

### ✅ **Sistema de Puntuación Avanzado (Scoring)**
- Puntuación de riesgo de 0-100 basada en múltiples factores
- Análisis de tendencias históricas
- Multiplicadores por factores de riesgo adicionales
- Perfiles de riesgo completos por gestante

### ✅ **Notificaciones Automáticas**
- Notificaciones inmediatas para alertas críticas
- Múltiples canales: SMS, Email, Push, WhatsApp
- Escalamiento automático según prioridad
- Asignación inteligente de destinatarios

### ✅ **Integración Completa**
- Integración con controles prenatales
- Integración con sistema de alertas manuales
- API REST completa
- Pruebas unitarias exhaustivas

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Flutter)                       │
├─────────────────────────────────────────────────────────────┤
│                    API REST ENDPOINTS                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Controllers   │  │    Services     │  │   Utils      │ │
│  │                 │  │                 │  │              │ │
│  │ • Alertas Auto  │  │ • Control       │  │ • Alarma     │ │
│  │ • Scoring       │  │ • Alerta        │  │ • Scoring    │ │
│  │ • Config        │  │ • Scoring       │  │ • Notification│ │
│  │                 │  │ • Notification  │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    BASE DE DATOS                            │
│              (PostgreSQL + Prisma ORM)                      │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Umbrales Médicos Implementados

### Presión Arterial (mmHg)
- **Hipertensión**: ≥140/90
- **Hipertensión Severa**: ≥160/110
- **Hipotensión**: ≤90/60

### Frecuencia Cardíaca (lpm)
- **Taquicardia**: ≥100
- **Taquicardia Severa**: ≥120
- **Bradicardia**: ≤60

### Temperatura (°C)
- **Fiebre**: ≥38.0
- **Fiebre Alta**: ≥39.0
- **Hipotermia**: ≤36.0

### Obstétricos
- **Parto Prematuro**: <37 semanas
- **Parto Muy Prematuro**: <32 semanas
- **Ganancia de Peso Excesiva**: >1.0 kg/semana

## 🚨 Tipos de Alertas Detectadas

### 1. **Emergencias Obstétricas (Prioridad CRÍTICA)**
- Ausencia de movimientos fetales confirmada
- Convulsiones / Pérdida de conciencia
- Sepsis materna con compromiso hemodinámico
- Hemorragia obstétrica severa
- Preeclampsia severa con síntomas neurológicos

### 2. **Riesgo Alto (Prioridad ALTA)**
- Hipertensión severa sin síntomas
- Trabajo de parto prematuro
- Sospecha de preeclampsia
- Alteraciones severas de signos vitales

### 3. **Síntomas de Alarma (Prioridad MEDIA)**
- Hipertensión leve a moderada
- Alteraciones moderadas de signos vitales
- Edemas significativos
- Movimientos fetales disminuidos

## 🔧 API Endpoints Implementados

### **Controles con Evaluación Automática**
```http
POST /api/alertas-automaticas/controles/con-evaluacion
```
Crea un control prenatal con evaluación automática de alertas.

### **Evaluación de Signos sin Control**
```http
POST /api/alertas-automaticas/alertas/evaluar-signos
```
Evalúa signos de alarma sin crear un control (solo evaluación).

### **Alertas con Evaluación Automática**
```http
POST /api/alertas-automaticas/alertas/con-evaluacion
```
Crea una alerta manual con evaluación automática adicional.

### **Perfil de Riesgo Completo**
```http
GET /api/alertas-automaticas/scoring/perfil-riesgo/:gestanteId
POST /api/alertas-automaticas/scoring/perfil-riesgo/:gestanteId
```
Obtiene el perfil de riesgo completo de una gestante.

### **Configuración del Sistema**
```http
GET /api/alertas-automaticas/configuracion
PUT /api/alertas-automaticas/configuracion
```
Gestiona la configuración del sistema (solo admins).

### **Estadísticas y Monitoreo**
```http
GET /api/alertas-automaticas/estadisticas
GET /api/alertas-automaticas/health
POST /api/alertas-automaticas/test
```

### **Utilidades**
```http
GET /api/alertas-automaticas/sintomas-disponibles
GET /api/alertas-automaticas/umbrales
```

## 📝 Ejemplos de Uso

### 1. **Crear Control con Evaluación Automática**

```javascript
const response = await fetch('/api/alertas-automaticas/controles/con-evaluacion', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    gestante_id: 'gestante-123',
    fecha_control: '2024-01-15T10:00:00Z',
    presion_sistolica: 165,
    presion_diastolica: 105,
    frecuencia_cardiaca: 95,
    temperatura: 36.8,
    semanas_gestacion: 34,
    movimientos_fetales: true,
    edemas: true,
    sintomas: ['dolor_cabeza_severo', 'vision_borrosa'],
    evaluar_automaticamente: true,
    incluir_historial: true
  })
});

const resultado = await response.json();
// resultado.data.evaluacion contiene la evaluación automática
// resultado.data.alertas_generadas contiene alertas automáticas creadas
```

### 2. **Evaluar Signos de Alarma**

```javascript
const response = await fetch('/api/alertas-automaticas/alertas/evaluar-signos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    presion_sistolica: 170,
    presion_diastolica: 110,
    frecuencia_cardiaca: 125,
    temperatura: 38.5,
    semanas_gestacion: 32,
    movimientos_fetales: false,
    sintomas: ['dolor_cabeza_severo', 'escalofrios']
  })
});

const evaluacion = await response.json();
// evaluacion.data contiene el resultado completo de la evaluación
```

### 3. **Obtener Perfil de Riesgo**

```javascript
const response = await fetch('/api/alertas-automaticas/scoring/perfil-riesgo/gestante-123', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    datos_actuales: {
      presion_sistolica: 145,
      presion_diastolica: 92,
      frecuencia_cardiaca: 105
    },
    sintomas: ['edema_facial']
  })
});

const perfil = await response.json();
// perfil.data contiene el perfil completo de riesgo
```

## 🧪 Pruebas Implementadas

### **Pruebas Unitarias**
- `src/tests/alarma-utils.test.ts`: 25+ pruebas de reglas médicas
- `src/tests/scoring.service.test.ts`: 15+ pruebas del sistema de scoring

### **Casos de Prueba Cubiertos**
- ✅ Emergencias obstétricas críticas
- ✅ Detección de preeclampsia
- ✅ Trabajo de parto prematuro
- ✅ Alteraciones de signos vitales
- ✅ Sistema de puntuación
- ✅ Generación de recomendaciones
- ✅ Casos límite y validaciones
- ✅ Integración completa

### **Ejecutar Pruebas**
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas específicas
npm test -- --testPathPattern=alarma-utils
npm test -- --testPathPattern=scoring.service
```

## 🔧 Configuración

### **Variables de Entorno**
```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/madres_digitales"

# JWT
JWT_SECRET="your_jwt_secret"

# Notificaciones (opcional)
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
SENDGRID_API_KEY="your_sendgrid_key"
```

### **Configuración del Sistema**
El sistema permite configurar:
- Pesos de factores de riesgo
- Umbrales de puntuación
- Multiplicadores por factores adicionales
- Configuración de notificaciones
- Canales de notificación habilitados

## 📈 Monitoreo y Estadísticas

### **Métricas Disponibles**
- Total de alertas generadas
- Distribución por nivel de prioridad
- Efectividad del sistema (precisión, recall)
- Tiempos de respuesta
- Estadísticas de notificaciones

### **Health Check**
```http
GET /api/alertas-automaticas/health
```
Verifica el estado de todos los componentes del sistema.

## 🚀 Despliegue

### **Requisitos**
- Node.js 18+
- PostgreSQL 14+
- Redis (opcional, para cache)

### **Instalación**
```bash
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma generate
npx prisma db push

# Ejecutar pruebas
npm test

# Iniciar servidor
npm run dev
```

## 📚 Documentación Médica

El sistema está basado en:
- Guías de la OMS para atención prenatal
- Protocolos ACOG (American College of Obstetricians and Gynecologists)
- Guías NICE (National Institute for Health and Care Excellence)
- Protocolos del Ministerio de Salud de Colombia

## 🔒 Seguridad

- ✅ Autenticación JWT requerida
- ✅ Autorización por roles
- ✅ Validación de datos de entrada
- ✅ Logs de auditoría
- ✅ Manejo seguro de datos médicos

## 📞 Soporte

Para soporte técnico o consultas médicas sobre el algoritmo:
- Email: soporte@madresdigitales.com
- Documentación: `/docs/`
- Issues: GitHub Issues

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Desarrollado por**: Equipo Madres Digitales
