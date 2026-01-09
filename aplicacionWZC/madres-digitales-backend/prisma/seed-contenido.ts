import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedContenido() {
  console.log('🌱 Iniciando seed de contenido educativo...');

  // Obtener un usuario para asignar como creador
  let adminUser = await prisma.usuario.findFirst({
    where: { rol: 'super_admin' },
  });

  if (!adminUser) {
    // Intentar con cualquier usuario
    adminUser = await prisma.usuario.findFirst();
  }

  if (!adminUser) {
    console.error('❌ No se encontró ningún usuario. Ejecuta el seed principal primero.');
    return;
  }

  console.log(`✅ Usuario encontrado: ${adminUser.email} (${adminUser.rol})`);

  // Contenido educativo de prueba
  const contenidos = [
    // Videos
    {
      titulo: 'Nutrición durante el embarazo',
      descripcion: 'Guía completa sobre alimentación saludable durante el embarazo. Aprende qué alimentos consumir y cuáles evitar para el bienestar de tu bebé.',
      tipo: 'video',
      categoria: 'nutricion',
      nivel: 'basico',
      url_contenido: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      url_imagen: 'https://via.placeholder.com/640x360/4CAF50/FFFFFF?text=Nutrición',
      duracion_minutos: 10,
      semana_gestacion_inicio: 1,
      semana_gestacion_fin: 42,
      tags: ['nutricion', 'embarazo', 'alimentacion', 'salud'],
      destacado: true,
      activo: true,
    },
    {
      titulo: 'Signos de alarma en el embarazo',
      descripcion: 'Identifica los signos de alarma que requieren atención médica inmediata durante el embarazo.',
      tipo: 'video',
      categoria: 'signos_alarma',
      nivel: 'basico',
      url_contenido: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      url_imagen: 'https://via.placeholder.com/640x360/F44336/FFFFFF?text=Signos+Alarma',
      duracion_minutos: 8,
      semana_gestacion_inicio: 1,
      semana_gestacion_fin: 42,
      tags: ['signos', 'alarma', 'emergencia', 'salud'],
      destacado: true,
      activo: true,
    },
    {
      titulo: 'Ejercicios para embarazadas',
      descripcion: 'Rutina de ejercicios seguros y beneficiosos durante el embarazo para mantenerte activa y saludable.',
      tipo: 'video',
      categoria: 'ejercicio',
      nivel: 'intermedio',
      url_contenido: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      url_imagen: 'https://via.placeholder.com/640x360/2196F3/FFFFFF?text=Ejercicios',
      duracion_minutos: 15,
      semana_gestacion_inicio: 1,
      semana_gestacion_fin: 42,
      tags: ['ejercicio', 'actividad', 'salud', 'bienestar'],
      destacado: false,
      activo: true,
    },

    // Audios
    {
      titulo: 'Meditación para embarazadas',
      descripcion: 'Sesión de meditación guiada para reducir el estrés y conectar con tu bebé.',
      tipo: 'audio',
      categoria: 'salud_mental',
      nivel: 'basico',
      url_contenido: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      url_imagen: 'https://via.placeholder.com/640x360/9C27B0/FFFFFF?text=Meditación',
      duracion_minutos: 10,
      semana_gestacion_inicio: 1,
      semana_gestacion_fin: 42,
      tags: ['meditacion', 'relajacion', 'salud mental', 'bienestar'],
      destacado: true,
      activo: true,
    },

    // Artículos
    {
      titulo: 'Preparación para el parto',
      descripcion: 'Todo lo que necesitas saber para prepararte física y emocionalmente para el momento del parto.',
      tipo: 'articulo',
      categoria: 'parto',
      nivel: 'intermedio',
      url_contenido: 'https://example.com/articulos/preparacion-parto.html',
      url_imagen: 'https://via.placeholder.com/640x360/FF9800/FFFFFF?text=Parto',
      semana_gestacion_inicio: 20,
      semana_gestacion_fin: 42,
      tags: ['parto', 'preparacion', 'nacimiento'],
      destacado: false,
      activo: true,
    },
    {
      titulo: 'Lactancia materna exitosa',
      descripcion: 'Guía completa sobre técnicas de lactancia, posiciones, y solución de problemas comunes.',
      tipo: 'articulo',
      categoria: 'lactancia',
      nivel: 'basico',
      url_contenido: 'https://example.com/articulos/lactancia.html',
      url_imagen: 'https://via.placeholder.com/640x360/00BCD4/FFFFFF?text=Lactancia',
      semana_gestacion_inicio: 30,
      semana_gestacion_fin: 42,
      tags: ['lactancia', 'amamantar', 'bebe', 'nutricion'],
      destacado: true,
      activo: true,
    },

    // Infografías
    {
      titulo: 'Calendario de controles prenatales',
      descripcion: 'Infografía visual con el calendario completo de controles prenatales recomendados.',
      tipo: 'infografia',
      categoria: 'cuidado_prenatal',
      nivel: 'basico',
      url_contenido: 'https://via.placeholder.com/1200x1600/4CAF50/FFFFFF?text=Calendario+Controles',
      url_imagen: 'https://via.placeholder.com/640x360/4CAF50/FFFFFF?text=Calendario',
      semana_gestacion_inicio: 1,
      semana_gestacion_fin: 42,
      tags: ['controles', 'calendario', 'prenatal', 'seguimiento'],
      destacado: false,
      activo: true,
    },
    {
      titulo: 'Derechos de la gestante',
      descripcion: 'Conoce tus derechos como gestante en Colombia: licencias, atención médica, y protección laboral.',
      tipo: 'infografia',
      categoria: 'derechos',
      nivel: 'basico',
      url_contenido: 'https://via.placeholder.com/1200x1600/673AB7/FFFFFF?text=Derechos+Gestante',
      url_imagen: 'https://via.placeholder.com/640x360/673AB7/FFFFFF?text=Derechos',
      semana_gestacion_inicio: 1,
      semana_gestacion_fin: 42,
      tags: ['derechos', 'legal', 'proteccion', 'laboral'],
      destacado: true,
      activo: true,
    },

    // Documentos
    {
      titulo: 'Guía de cuidados posparto',
      descripcion: 'Documento completo con recomendaciones para el cuidado de la madre y el bebé después del parto.',
      tipo: 'documento',
      categoria: 'posparto',
      nivel: 'intermedio',
      url_contenido: 'https://example.com/documentos/cuidados-posparto.pdf',
      url_imagen: 'https://via.placeholder.com/640x360/E91E63/FFFFFF?text=Posparto',
      semana_gestacion_inicio: 30,
      semana_gestacion_fin: 42,
      tags: ['posparto', 'cuidados', 'recuperacion', 'bebe'],
      destacado: false,
      activo: true,
    },
    {
      titulo: 'Métodos de planificación familiar',
      descripcion: 'Información detallada sobre los diferentes métodos anticonceptivos disponibles después del parto.',
      tipo: 'documento',
      categoria: 'planificacion',
      nivel: 'intermedio',
      url_contenido: 'https://example.com/documentos/planificacion-familiar.pdf',
      url_imagen: 'https://via.placeholder.com/640x360/009688/FFFFFF?text=Planificación',
      semana_gestacion_inicio: 30,
      semana_gestacion_fin: 42,
      tags: ['planificacion', 'anticonceptivos', 'familia', 'salud'],
      destacado: false,
      activo: true,
    },
  ];

  // Crear contenido
  console.log(`\n📚 Creando ${contenidos.length} contenidos educativos...`);

  for (const contenido of contenidos) {
    try {
      const created = await prisma.contenido.create({
        data: contenido,
      });
      console.log(`✅ Creado: ${created.titulo} (${created.tipo})`);
    } catch (error) {
      console.error(`❌ Error creando "${contenido.titulo}":`, error);
    }
  }

  console.log('\n✅ Seed de contenido educativo completado!');
}

seedContenido()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

