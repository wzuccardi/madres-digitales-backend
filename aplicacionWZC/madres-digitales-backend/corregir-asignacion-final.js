const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Corrigiendo asignación de gestantes a la madrina Crepu...');
    
    // ID de la madrina Crepu
    const madrinaId = 'user_1763791367449_40gzfw';
    
    // Verificar que la madrina existe
    const madrina = await prisma.usuarios.findUnique({
      where: { id: madrinaId },
      select: { id: true, nombre: true, email: true, rol: true }
    });
    
    if (!madrina) {
      console.log('❌ La madrina Crepu no existe');
      return;
    }
    
    console.log(`👤 Madrina encontrada: ${madrina.nombre} (${madrina.email}) - Rol: ${madrina.rol}`);
    
    // 1. Corregir Marilyn Monroe (gestante_1763277531205_ti6w59)
    console.log('\n🔧 Procesando Marilyn Monroe...');
    
    const marilyn = await prisma.gestantes.findUnique({
      where: { id: 'gestante_1763277531205_ti6w59' },
      select: { id: true, nombre: true, madrina_id: true, activa: true }
    });
    
    if (marilyn) {
      console.log(`   📋 Estado actual: madrina_id: ${marilyn.madrina_id || 'NULL'}, activa: ${marilyn.activa}`);
      
      if (marilyn.madrina_id !== madrinaId) {
        const marilynActualizada = await prisma.gestantes.update({
          where: { id: 'gestante_1763277531205_ti6w59' },
          data: { 
            madrina_id: madrinaId,
            activa: true
          }
        });
        console.log(`   ✅ Marilyn Monroe asignada a Crepu (ID: ${marilynActualizada.id})`);
      } else {
        console.log(`   ✅ Marilyn Monroe ya está asignada correctamente a Crepu`);
      }
    } else {
      console.log('   ❌ Marilyn Monroe no encontrada en la BD');
    }
    
    // 2. Corregir malinda (gestante_1763612771433_jqobr3)
    console.log('\n🔧 Procesando malinda...');
    
    const malinda = await prisma.gestantes.findUnique({
      where: { id: 'gestante_1763612771433_jqobr3' },
      select: { id: true, nombre: true, madrina_id: true, activa: true }
    });
    
    if (malinda) {
      console.log(`   📋 Estado actual: madrina_id: ${malinda.madrina_id || 'NULL'}, activa: ${malinda.activa}`);
      
      if (malinda.madrina_id !== madrinaId || !malinda.activa) {
        const malindaActualizada = await prisma.gestantes.update({
          where: { id: 'gestante_1763612771433_jqobr3' },
          data: { 
            madrina_id: madrinaId,
            activa: true
          }
        });
        console.log(`   ✅ malinda asignada a Crepu y activada (ID: ${malindaActualizada.id})`);
      } else {
        console.log(`   ✅ malinda ya está asignada correctamente a Crepu`);
      }
    } else {
      console.log('   ❌ malinda no encontrada en la BD');
    }
    
    // 3. Verificar resultado final
    console.log('\n🎉 Verificando resultado final...');
    const gestantesFinales = await prisma.gestantes.findMany({
      where: { 
        madrina_id: madrinaId, 
        activa: true 
      },
      select: { 
        id: true, 
        nombre: true,
        documento: true,
        telefono: true
      },
      orderBy: { nombre: 'asc' }
    });
    
    console.log(`\n🤰 Total de gestantes asignadas a Crepu: ${gestantesFinales.length}`);
    gestantesFinales.forEach((g, index) => {
      console.log(`   ${index + 1}. ${g.nombre} (ID: ${g.id}) - Doc: ${g.documento || 'N/A'}`);
    });
    
    // 4. Probar el endpoint
    console.log('\n🌐 Probando endpoint /api/gestantes...');
    const http = require('http');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTc2Mzc5MTM2NzQ0OV80MGd6ZnciLCJlbWFpbCI6ImNyZXB1QGdtYWlsLmNvbSIsInJvbCI6Ik1BRFJJTkEiLCJpYXQiOjE3NjM4NzE0NTIsImV4cCI6MTc2Mzk1Nzg1MiwiYXVkIjoibWFkcmVzLWRpZ2l0YWxlcy11c2VycyIsImlzcyI6Im1hZHJlcy1kaWdpdGFsZXMifQ.oNbKoHAtSbADjSD9_cV9HqCHXqlvze2b0adRPGOi9qc';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/gestantes',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`\n📋 Respuesta del endpoint - Status: ${res.statusCode}`);
          
          if (response.success && response.data && response.data.gestantes) {
            console.log(`\n🤰 Gestantes encontradas en el endpoint: ${response.data.gestantes.length}`);
            response.data.gestantes.forEach((g, index) => {
              console.log(`   ${index + 1}. ${g.nombre} (ID: ${g.id})`);
            });
            
            if (response.data.gestantes.length === gestantesFinales.length) {
              console.log('\n✅ ¡El filtrado funciona correctamente! La madrina Crepu ve sus gestantes asignadas.');
            } else {
              console.log('\n⚠️ Hay una discrepancia entre la BD y el endpoint');
            }
          } else {
            console.log('\n❌ Error en la respuesta del endpoint');
          }
        } catch (error) {
          console.error('❌ Error parseando respuesta:', error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Error en la petición:', error);
    });
    
    req.end();
    
    console.log('\n✅ ¡Proceso completado con éxito!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();