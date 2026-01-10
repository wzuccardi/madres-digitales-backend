import prisma from '../config/database';

async function diagnosticarGestantesMadrina() {
  console.log('🔍 DIAGNÓSTICO: Gestantes por Madrina\n');
  console.log('='.repeat(80));

  try {
    // 1. Listar todas las gestantes con sus madrinas
    console.log('\n📋 TODAS LAS GESTANTES:');
    const todasGestantes = await prisma.gestantes.findMany({
      select: {
        id: true,
        nombre: true,
        documento: true,
        madrina_id: true,
        madrina: {
          select: {
            id: true,
            nombre: true,
            email: true,
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log(`\nTotal de gestantes: ${todasGestantes.length}\n`);
    
    todasGestantes.forEach((g, index) => {
      console.log(`${index + 1}. ${g.nombre} (${g.documento})`);
      console.log(`   ID Gestante: ${g.id}`);
      console.log(`   Madrina ID: ${g.madrina_id || 'SIN ASIGNAR'}`);
      if (g.madrina) {
        console.log(`   Madrina: ${g.madrina.nombre} (${g.madrina.email})`);
      } else {
        console.log(`   Madrina: ❌ NO ASIGNADA`);
      }
      console.log('');
    });

    // 2. Agrupar por madrina
    console.log('\n📊 GESTANTES POR MADRINA:');
    console.log('='.repeat(80));
    
    const gestantesPorMadrina = todasGestantes.reduce((acc: any, g) => {
      const madrinaId = g.madrina_id || 'sin_asignar';
      if (!acc[madrinaId]) {
        acc[madrinaId] = {
          madrina: g.madrina,
          gestantes: []
        };
      }
      acc[madrinaId].gestantes.push(g);
      return acc;
    }, {});

    Object.entries(gestantesPorMadrina).forEach(([madrinaId, data]: [string, any]) => {
      console.log(`\n👩‍⚕️ Madrina: ${data.madrina ? `${data.madrina.nombre} (${data.madrina.email})` : 'SIN ASIGNAR'}`);
      console.log(`   ID: ${madrinaId}`);
      console.log(`   Gestantes asignadas: ${data.gestantes.length}`);
      data.gestantes.forEach((g: any, index: number) => {
        console.log(`   ${index + 1}. ${g.nombre} (${g.documento})`);
      });
    });

    // 3. Listar todas las madrinas
    console.log('\n\n👥 TODAS LAS MADRINAS:');
    console.log('='.repeat(80));
    
    const madrinas = await prisma.usuarios.findMany({
      where: {
        rol: 'madrina'
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        _count: {
          select: {
            gestantes_asignadas: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log(`\nTotal de madrinas: ${madrinas.length}\n`);
    
    madrinas.forEach((m, index) => {
      console.log(`${index + 1}. ${m.nombre}`);
      console.log(`   ID: ${m.id}`);
      console.log(`   Email: ${m.email}`);
      console.log(`   Gestantes asignadas: ${m._count.gestantes_asignadas}`);
      console.log('');
    });

    // 4. Verificar inconsistencias
    console.log('\n⚠️  VERIFICACIÓN DE INCONSISTENCIAS:');
    console.log('='.repeat(80));
    
    const gestantesSinMadrina = todasGestantes.filter(g => !g.madrina_id);
    console.log(`\n❌ Gestantes sin madrina asignada: ${gestantesSinMadrina.length}`);
    if (gestantesSinMadrina.length > 0) {
      gestantesSinMadrina.forEach(g => {
        console.log(`   - ${g.nombre} (${g.documento})`);
      });
    }

    const gestantesConMadrinaInvalida = todasGestantes.filter(g => g.madrina_id && !g.madrina);
    console.log(`\n❌ Gestantes con madrina_id pero madrina no existe: ${gestantesConMadrinaInvalida.length}`);
    if (gestantesConMadrinaInvalida.length > 0) {
      gestantesConMadrinaInvalida.forEach(g => {
        console.log(`   - ${g.nombre} (${g.documento}) - madrina_id: ${g.madrina_id}`);
      });
    }

    // 5. Probar consulta con filtro
    console.log('\n\n🧪 PRUEBA DE CONSULTA CON FILTRO:');
    console.log('='.repeat(80));
    
    if (madrinas.length > 0) {
      const primeraMadrina = madrinas[0];
      console.log(`\nProbando filtro para madrina: ${primeraMadrina.nombre} (${primeraMadrina.id})`);
      
      const gestantesFiltradas = await prisma.gestantes.findMany({
        where: {
          madrina_id: primeraMadrina.id
        },
        select: {
          id: true,
          nombre: true,
          documento: true,
          madrina_id: true,
        }
      });
      
      console.log(`\nResultado: ${gestantesFiltradas.length} gestantes encontradas`);
      gestantesFiltradas.forEach((g, index) => {
        console.log(`${index + 1}. ${g.nombre} (${g.documento})`);
        console.log(`   madrina_id: ${g.madrina_id}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Diagnóstico completado\n');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticarGestantesMadrina();
