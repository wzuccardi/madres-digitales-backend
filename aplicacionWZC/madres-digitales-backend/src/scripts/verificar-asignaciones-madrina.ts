import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarAsignaciones() {
  try {
    console.log('🔍 Verificando asignaciones de madrinas...\n');

    // 1. Buscar usuario crepu@gmail.com
    console.log('1. Buscando usuario crepu@gmail.com...');
    const usuarioCrepu = await prisma.usuarios.findUnique({
      where: { email: 'crepu@gmail.com' },
      select: { id: true, nombre: true, email: true, rol: true, municipio_id: true }
    });

    if (!usuarioCrepu) {
      console.log('❌ Usuario crepu@gmail.com no encontrado');
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   - ID: ${usuarioCrepu.id}`);
    console.log(`   - Nombre: ${usuarioCrepu.nombre}`);
    console.log(`   - Rol: ${usuarioCrepu.rol}`);
    console.log(`   - Municipio ID: ${usuarioCrepu.municipio_id}\n`);

    // 2. Buscar gestante Marilyn Monroe
    console.log('2. Buscando gestante Marilyn Monroe...');
    const gestanteMarilyn = await prisma.gestantes.findFirst({
      where: { 
        nombre: 'Marilyn Monroe',
        documento: '457893215'
      },
      select: { 
        id: true, 
        nombre: true, 
        documento: true, 
        telefono: true, 
        municipio_id: true,
        madrina_id: true,
        activa: true 
      }
    });

    if (!gestanteMarilyn) {
      console.log('❌ Gestante Marilyn Monroe no encontrada');
      return;
    }

    console.log(`✅ Gestante encontrada:`);
    console.log(`   - ID: ${gestanteMarilyn.id}`);
    console.log(`   - Nombre: ${gestanteMarilyn.nombre}`);
    console.log(`   - Documento: ${gestanteMarilyn.documento}`);
    console.log(`   - Teléfono: ${gestanteMarilyn.telefono}`);
    console.log(`   - Municipio ID: ${gestanteMarilyn.municipio_id}`);
    console.log(`   - Madrina asignada: ${gestanteMarilyn.madrina_id || 'No asignada'}`);
    console.log(`   - Activa: ${gestanteMarilyn.activa}\n`);

    // 3. Verificar si están asignados
    if (gestanteMarilyn.madrina_id === usuarioCrepu.id) {
      console.log('✅ Marilyn Monroe ya está asignada a crepu@gmail.com\n');
    } else {
      console.log('⚠️  Marilyn Monroe NO está asignada a crepu@gmail.com\n');
      
      // 4. Asignar si no están asignados
      console.log('3. Asignando Marilyn Monroe a crepu@gmail.com...');
      try {
        await prisma.gestantes.update({
          where: { id: gestanteMarilyn.id },
          data: { 
            madrina_id: usuarioCrepu.id,
            fecha_actualizacion: new Date()
          }
        });
        console.log('✅ Asignación realizada exitosamente\n');
      } catch (error) {
        console.log('❌ Error al asignar:', error);
      }
    }

    // 5. Verificar gestantes asignadas a crepu@gmail.com
    console.log('4. Gestantes asignadas a crepu@gmail.com:');
    const gestantesAsignadas = await prisma.gestantes.findMany({
      where: { madrina_id: usuarioCrepu.id, activa: true },
      select: { 
        id: true, 
        nombre: true, 
        documento: true, 
        telefono: true,
        municipio_id: true,
        fecha_creacion: true
      },
      orderBy: { nombre: 'asc' }
    });

    if (gestantesAsignadas.length === 0) {
      console.log('   No hay gestantes asignadas');
    } else {
      gestantesAsignadas.forEach((gestante, index) => {
        console.log(`   ${index + 1}. ${gestante.nombre} (${gestante.documento}) - ID: ${gestante.id}`);
      });
    }

    console.log(`\n📊 Total de gestantes asignadas: ${gestantesAsignadas.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarAsignaciones();