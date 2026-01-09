import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de contenido educativo...');

  // Obtener un usuario super_admin para asignar como creador
  const superAdmin = await prisma.usuario.findFirst({
    where: { rol: 'super_admin' }
  });

  if (!superAdmin) {
    console.error('❌ No se encontró un usuario super_admin');
    return;
  }

  // Contenidos educativos con URLs reales de YouTube y recursos
  const contenidos = [
    // CUIDADO PRENATAL
    {
      titulo: 'Cuidados durante el embarazo',
      descripcion: 'Aprende sobre los cuidados esenciales durante el embarazo, alimentación adecuada y señales de alerta.',
      tipo: 'video',
      categoria: 'cuidado_prenatal',
      nivel: 'basico',
      archivo_url: 'https://www.youtube.com/watch?v=8KM5ZqP9YZQ',
      archivo_nombre: 'cuidados-embarazo.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/8KM5ZqP9YZQ/maxresdefault.jpg',
      duracion: 600,
      autor: 'Ministerio de Salud',
      etiquetas: ['embarazo', 'cuidados', 'salud materna'],
      destacado: true,
      publico: true,
      created_by: superAdmin.id,
    },
    {
      titulo: 'Nutrición en el embarazo',
      descripcion: 'Guía completa sobre alimentación saludable durante el embarazo y suplementos necesarios.',
      tipo: 'video',
      categoria: 'nutricion',
      nivel: 'basico',
      archivo_url: 'https://www.youtube.com/watch?v=2JYT5f2AHNU',
      archivo_nombre: 'nutricion-embarazo.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/2JYT5f2AHNU/maxresdefault.jpg',
      duracion: 480,
      autor: 'Nutricionista Certificada',
      etiquetas: ['nutrición', 'embarazo', 'alimentación'],
      destacado: true,
      publico: true,
      created_by: superAdmin.id,
    },
    {
      titulo: 'Ejercicios seguros durante el embarazo',
      descripcion: 'Rutina de ejercicios seguros y recomendados para cada trimestre del embarazo.',
      tipo: 'video',
      categoria: 'ejercicio',
      nivel: 'intermedio',
      archivo_url: 'https://www.youtube.com/watch?v=OQ8Fqz5u4Yk',
      archivo_nombre: 'ejercicios-embarazo.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/OQ8Fqz5u4Yk/maxresdefault.jpg',
      duracion: 900,
      autor: 'Fisioterapeuta Perinatal',
      etiquetas: ['ejercicio', 'embarazo', 'bienestar'],
      destacado: false,
      publico: true,
      created_by: superAdmin.id,
    },
    // PARTO
    {
      titulo: 'Preparación para el parto',
      descripcion: 'Todo lo que necesitas saber para prepararte física y emocionalmente para el parto.',
      tipo: 'video',
      categoria: 'parto',
      nivel: 'basico',
      archivo_url: 'https://www.youtube.com/watch?v=j7XXZ5OLZ_s',
      archivo_nombre: 'preparacion-parto.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/j7XXZ5OLZ_s/maxresdefault.jpg',
      duracion: 720,
      autor: 'Matrona Certificada',
      etiquetas: ['parto', 'preparación', 'maternidad'],
      destacado: true,
      publico: true,
      created_by: superAdmin.id,
    },
    {
      titulo: 'Técnicas de respiración para el parto',
      descripcion: 'Aprende técnicas de respiración que te ayudarán durante el trabajo de parto.',
      tipo: 'video',
      categoria: 'parto',
      nivel: 'intermedio',
      archivo_url: 'https://www.youtube.com/watch?v=FfgT6zx4k3Q',
      archivo_nombre: 'respiracion-parto.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/FfgT6zx4k3Q/maxresdefault.jpg',
      duracion: 420,
      autor: 'Doula Profesional',
      etiquetas: ['parto', 'respiración', 'técnicas'],
      destacado: false,
      publico: true,
      created_by: superAdmin.id,
    },
    // LACTANCIA
    {
      titulo: 'Lactancia materna: Primeros pasos',
      descripcion: 'Guía completa para iniciar la lactancia materna exitosamente desde el primer día.',
      tipo: 'video',
      categoria: 'lactancia',
      nivel: 'basico',
      archivo_url: 'https://www.youtube.com/watch?v=VCbLDRdOJGE',
      archivo_nombre: 'lactancia-primeros-pasos.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/VCbLDRdOJGE/maxresdefault.jpg',
      duracion: 540,
      autor: 'Consultora de Lactancia',
      etiquetas: ['lactancia', 'bebé', 'alimentación'],
      destacado: true,
      publico: true,
      created_by: superAdmin.id,
    },
    {
      titulo: 'Posiciones para amamantar',
      descripcion: 'Conoce las diferentes posiciones para amamantar y encuentra la más cómoda para ti y tu bebé.',
      tipo: 'video',
      categoria: 'lactancia',
      nivel: 'basico',
      archivo_url: 'https://www.youtube.com/watch?v=wjv_OuzxPCM',
      archivo_nombre: 'posiciones-lactancia.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/wjv_OuzxPCM/maxresdefault.jpg',
      duracion: 360,
      autor: 'Enfermera Pediátrica',
      etiquetas: ['lactancia', 'posiciones', 'técnicas'],
      destacado: false,
      publico: true,
      created_by: superAdmin.id,
    },
    // POSPARTO
    {
      titulo: 'Cuidados en el posparto',
      descripcion: 'Aprende sobre los cuidados necesarios durante las primeras semanas después del parto.',
      tipo: 'video',
      categoria: 'posparto',
      nivel: 'basico',
      archivo_url: 'https://www.youtube.com/watch?v=Xbp_a0MxCLM',
      archivo_nombre: 'cuidados-posparto.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/Xbp_a0MxCLM/maxresdefault.jpg',
      duracion: 480,
      autor: 'Ginecóloga',
      etiquetas: ['posparto', 'recuperación', 'cuidados'],
      destacado: true,
      publico: true,
      created_by: superAdmin.id,
    },
    {
      titulo: 'Salud mental en el posparto',
      descripcion: 'Información sobre la salud mental materna y cómo identificar señales de depresión posparto.',
      tipo: 'video',
      categoria: 'salud_mental',
      nivel: 'intermedio',
      archivo_url: 'https://www.youtube.com/watch?v=BqiNw4q0e1g',
      archivo_nombre: 'salud-mental-posparto.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/BqiNw4q0e1g/maxresdefault.jpg',
      duracion: 600,
      autor: 'Psicóloga Perinatal',
      etiquetas: ['posparto', 'salud mental', 'bienestar'],
      destacado: false,
      publico: true,
      created_by: superAdmin.id,
    },
    // CUIDADO INFANTIL
    {
      titulo: 'Cuidados del recién nacido',
      descripcion: 'Guía completa sobre los cuidados básicos del recién nacido: baño, cambio de pañal, sueño.',
      tipo: 'video',
      categoria: 'higiene',
      nivel: 'basico',
      archivo_url: 'https://www.youtube.com/watch?v=SW_JpKFUkH0',
      archivo_nombre: 'cuidados-recien-nacido.mp4',
      archivo_tipo: 'video/mp4',
      archivo_tamano: 0,
      miniatura_url: 'https://img.youtube.com/vi/SW_JpKFUkH0/maxresdefault.jpg',
      duracion: 720,
      autor: 'Pediatra',
      etiquetas: ['recién nacido', 'cuidados', 'bebé'],
      destacado: true,
      publico: true,
      created_by: superAdmin.id,
    },
  ];

  // Crear contenidos
  for (const contenido of contenidos) {
    try {
      await prisma.contenidoEducativo.create({
        data: contenido,
      });
      console.log(`✅ Contenido creado: ${contenido.titulo}`);
    } catch (error) {
      console.error(`❌ Error creando contenido "${contenido.titulo}":`, error);
    }
  }

  console.log('✅ Seed de contenido educativo completado');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

