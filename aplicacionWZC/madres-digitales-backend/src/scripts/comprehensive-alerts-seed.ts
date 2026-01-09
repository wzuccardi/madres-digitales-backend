import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';

interface SeedAlert {
  id: string;
  gestante_id: string;
  madrina_id: string;
  tipo_alerta: string;
  nivel_prioridad: string;
  mensaje: string;
  sintomas?: any;
  resuelta: boolean;
  estado: string;
  es_automatica: boolean;
  score_riesgo?: number;
  nombre_madrina: string;
  telefono_madrina: string;
  nombre_gestante: string;
  telefono_gestante: string;
  direccion_gestante: string;
  municipio: string;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
  ubicacion_precision?: number;
}

async function comprehensiveAlertsSeed() {
  try {
    console.log('🌱 Iniciando seed completo de alertas...\n');

    // Datos del usuario madrina (crepu@gmail.com)
    const madrinaUser = {
      id: 'user_1763271159091_icaaa5',
      nombre: 'Crepuscula Martinez',
      email: 'crepu@gmail.com',
      telefono: '3017896542'
    };

    // Datos de la gestante Marilyn Monroe
    const gestanteMarilyn = {
      id: 'gestante_1763277531205_ti6w59',
      nombre: 'Marilyn Monroe',
      documento: '457893215',
      telefono: '3017896542',
      direccion: 'Magangue',
      municipio: 'Magangue',
      fecha_nacimiento: '2000-11-22'
    };

    // Verificar que existen el usuario y la gestante
    console.log('🔍 Verificando usuario madrina...');
    const madrinaExists = await prisma.usuarios.findUnique({
      where: { id: madrinaUser.id }
    });

    if (!madrinaExists) {
      console.log('❌ Usuario madrina no encontrado. Creando...');
      await prisma.usuarios.create({
        data: {
          id: madrinaUser.id,
          nombre: madrinaUser.nombre,
          email: madrinaUser.email,
          password_hash: '$2b$12$plIp9cqkdj0gxrcQmSHerugIesszQVr0.rOKTG7zcYeE4Rugd.Xtu',
          tipo_documento: 'cedula',
          rol: 'MADRINA',
          telefono: madrinaUser.telefono,
          activo: true,
          ultimo_acceso: new Date(),
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        }
      });
      console.log('✅ Usuario madrina creado');
    } else {
      console.log('✅ Usuario madrina encontrado');
    }

    console.log('🔍 Verificando gestante Marilyn Monroe...');
    const gestanteExists = await prisma.gestantes.findUnique({
      where: { id: gestanteMarilyn.id }
    });

    if (!gestanteExists) {
      console.log('❌ Gestante Marilyn Monroe no encontrada. Creando...');
      await prisma.gestantes.create({
        data: {
          id: gestanteMarilyn.id,
          nombre: gestanteMarilyn.nombre,
          documento: gestanteMarilyn.documento,
          telefono: gestanteMarilyn.telefono,
          direccion: gestanteMarilyn.direccion,
          fecha_nacimiento: new Date(gestanteMarilyn.fecha_nacimiento),
          tipo_documento: 'cedula',
          regimen_salud: 'subsidiado',
          activa: true,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        }
      });
      console.log('✅ Gestante Marilyn Monroe creada');
    } else {
      console.log('✅ Gestante Marilyn Monroe encontrada');
    }

    // Paso 1: Limpiar alertas incompletas o problemáticas
    console.log('\n🧹 Limpiando alertas incompletas...');
    
    // Marcar alertas antiguas como resueltas (más de 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const resolvedOld = await prisma.alertas.updateMany({
      where: {
        fecha_creacion: { lt: thirtyDaysAgo },
        resuelta: false
      },
      data: {
        resuelta: true,
        fecha_resolucion: new Date(),
        estado: 'resuelta'
      }
    });
    console.log(`✅ Marcadas ${resolvedOld.count} alertas antiguas como resueltas`);

    // Paso 3: Crear nuevas alertas para el usuario y gestante específicos
    console.log('\n🆕 Creando nuevas alertas...');
    
    const newAlerts: SeedAlert[] = [
      {
        id: `alerta_${Date.now()}_1`,
        gestante_id: gestanteMarilyn.id,
        madrina_id: madrinaUser.id,
        tipo_alerta: 'CONTROL_VENCIDO',
        nivel_prioridad: 'ALTA',
        mensaje: 'Control prenatal vencido para Marilyn Monroe. Último control registrado hace más de 30 días.',
        sintomas: { tipo: 'vencimiento_control', dias_vencido: 35 },
        resuelta: false,
        estado: 'pendiente',
        es_automatica: true,
        score_riesgo: 75,
        nombre_madrina: madrinaUser.nombre,
        telefono_madrina: madrinaUser.telefono,
        nombre_gestante: gestanteMarilyn.nombre,
        telefono_gestante: gestanteMarilyn.telefono,
        direccion_gestante: gestanteMarilyn.direccion,
        municipio: gestanteMarilyn.municipio,
        ubicacion_lat: 9.2423,
        ubicacion_lng: -74.7735,
        ubicacion_precision: 100
      },
      {
        id: `alerta_${Date.now()}_2`,
        gestante_id: gestanteMarilyn.id,
        madrina_id: madrinaUser.id,
        tipo_alerta: 'SINTOMAS_PREOCUPANTES',
        nivel_prioridad: 'CRITICA',
        mensaje: 'Marilyn Monroe reporta dolor abdominal severo y sangrado leve. Requiere evaluación médica inmediata.',
        sintomas: {
          dolor_abdominal: 'severo',
          sangrado: 'leve',
          frecuencia_cardiaca: 110,
          presion_arterial: '140/90',
          reportado_por: 'gestante'
        },
        resuelta: false,
        estado: 'pendiente',
        es_automatica: false,
        score_riesgo: 90,
        nombre_madrina: madrinaUser.nombre,
        telefono_madrina: madrinaUser.telefono,
        nombre_gestante: gestanteMarilyn.nombre,
        telefono_gestante: gestanteMarilyn.telefono,
        direccion_gestante: gestanteMarilyn.direccion,
        municipio: gestanteMarilyn.municipio,
        ubicacion_lat: 9.2423,
        ubicacion_lng: -74.7735,
        ubicacion_precision: 50
      },
      {
        id: `alerta_${Date.now()}_3`,
        gestante_id: gestanteMarilyn.id,
        madrina_id: madrinaUser.id,
        tipo_alerta: 'RECORDATORIO_CONTROL',
        nivel_prioridad: 'MEDIA',
        mensaje: 'Recordatorio: Marilyn Monroe tiene control prenatal programado para la próxima semana. Confirmar asistencia.',
        sintomas: { tipo: 'recordatorio', semanas_gestacion: 28, proximo_control: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        resuelta: false,
        estado: 'pendiente',
        es_automatica: true,
        score_riesgo: 30,
        nombre_madrina: madrinaUser.nombre,
        telefono_madrina: madrinaUser.telefono,
        nombre_gestante: gestanteMarilyn.nombre,
        telefono_gestante: gestanteMarilyn.telefono,
        direccion_gestante: gestanteMarilyn.direccion,
        municipio: gestanteMarilyn.municipio,
        ubicacion_lat: 9.2423,
        ubicacion_lng: -74.7735,
        ubicacion_precision: 150
      },
      {
        id: `alerta_${Date.now()}_4`,
        gestante_id: gestanteMarilyn.id,
        madrina_id: madrinaUser.id,
        tipo_alerta: 'preeclampsia',
        nivel_prioridad: 'ALTA',
        mensaje: 'Análisis de presión arterial de Marilyn Monroe sugiere tendencia a preeclampsia. Monitorear signos vitales.',
        sintomas: {
          presion_sistolica: 140,
          presion_diastolica: 90,
          proteinas_orina: '+1',
          edema: 'leve',
          tendencia: 'creciente'
        },
        resuelta: false,
        estado: 'pendiente',
        es_automatica: true,
        score_riesgo: 80,
        nombre_madrina: madrinaUser.nombre,
        telefono_madrina: madrinaUser.telefono,
        nombre_gestante: gestanteMarilyn.nombre,
        telefono_gestante: gestanteMarilyn.telefono,
        direccion_gestante: gestanteMarilyn.direccion,
        municipio: gestanteMarilyn.municipio,
        ubicacion_lat: 9.2423,
        ubicacion_lng: -74.7735,
        ubicacion_precision: 75
      },
      {
        id: `alerta_${Date.now()}_5`,
        gestante_id: gestanteMarilyn.id,
        madrina_id: madrinaUser.id,
        tipo_alerta: 'SOS_MEDICA',
        nivel_prioridad: 'CRITICA',
        mensaje: '🆘 SOS MÉDICO: Marilyn Monroe reporta contracciones fuertes y posible trabajo de parto prematuro.',
        sintomas: {
          contracciones: 'frecuentes',
          duracion_contracciones: '45 segundos',
          frecuencia: 'cada 5 minutos',
          dolor: 'intenso',
          semanas_gestacion: 32,
          tipo_emergencia: 'parto_prematuro'
        },
        resuelta: false,
        estado: 'pendiente',
        es_automatica: false,
        score_riesgo: 95,
        nombre_madrina: madrinaUser.nombre,
        telefono_madrina: madrinaUser.telefono,
        nombre_gestante: gestanteMarilyn.nombre,
        telefono_gestante: gestanteMarilyn.telefono,
        direccion_gestante: gestanteMarilyn.direccion,
        municipio: gestanteMarilyn.municipio,
        ubicacion_lat: 9.2423,
        ubicacion_lng: -74.7735,
        ubicacion_precision: 25
      }
    ];

    // Insertar las nuevas alertas
    let createdCount = 0;
    for (const alert of newAlerts) {
      try {
        await prisma.alertas.create({
          data: {
            id: alert.id,
            gestante_id: alert.gestante_id,
            madrina_id: alert.madrina_id,
            tipo_alerta: alert.tipo_alerta as any,
            nivel_prioridad: alert.nivel_prioridad as any,
            mensaje: alert.mensaje,
            sintomas: alert.sintomas,
            resuelta: alert.resuelta,
            estado: alert.estado,
            es_automatica: alert.es_automatica,
            score_riesgo: alert.score_riesgo,
            nombre_madrina: alert.nombre_madrina,
            telefono_madrina: alert.telefono_madrina,
            nombre_gestante: alert.nombre_gestante,
            telefono_gestante: alert.telefono_gestante,
            direccion_gestante: alert.direccion_gestante,
            municipio: alert.municipio,
            ubicacion_lat: alert.ubicacion_lat,
            ubicacion_lng: alert.ubicacion_lng,
            ubicacion_precision: alert.ubicacion_precision,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
            created_at: new Date()
          }
        });
        createdCount++;
        console.log(`✅ Alerta creada: ${alert.tipo_alerta} - ${alert.nivel_prioridad}`);
      } catch (error) {
        console.log(`⚠️ Alerta duplicada o error: ${alert.tipo_alerta} - ${error.message}`);
      }
    }

    console.log(`\n📊 Resumen del seed:`);
    console.log(`✅ Alertas antiguas resueltas: ${resolvedOld.count}`);
    console.log(`🆕 Nuevas alertas creadas: ${createdCount}`);

    // Verificar el resultado final
    console.log('\n🔍 Verificando alertas finales...');
    const finalAlerts = await prisma.alertas.findMany({
      where: {
        gestante_id: gestanteMarilyn.id,
        resuelta: false
      },
      include: {
        gestante: {
          select: { nombre: true, documento: true }
        },
        madrina: {
          select: { nombre: true, telefono: true }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    console.log(`📋 Alertas activas para ${gestanteMarilyn.nombre}: ${finalAlerts.length}`);
    finalAlerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.tipo_alerta} - ${alert.nivel_prioridad} - ${alert.estado}`);
    });

    console.log('\n✅ Seed completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed
comprehensiveAlertsSeed();