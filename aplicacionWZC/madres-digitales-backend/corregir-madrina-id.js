const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Corrigiendo madrina_id de las gestantes...');
    
    // ID correcto de la madrina Crepu
    const madrinaId = 'user_1763791367449_40gzfw';
    
    // 1. Corregir Marilyn Monroe
    console.log('\n🔧 Corrigiendo Marilyn Monroe...');
    const marilyn = await prisma.gestantes.update({
      where: { id: 'gestante_1763277531205_ti6w59' },
      data: { 
        madrina_id: madrinaId,
        activa: true
      }
    });
    console.log(`   ✅ Marilyn Monroe asignada a Crepu (ID: ${marilyn.id})`);
    
    // 2. Corregir malinda (cambiar de "13052" a ID correcto de Crepu)
    console.log('\n🔧 Corrigiendo malinda...');
    const malinda = await prisma.gestantes.update({
      where: { id: 'gestante_1763612771433_jqobr3' },
      data: { 
        madrina_id: madrinaId,
        activa: true
      }
    });
    console.log(`   ✅ malinda asignada a Crepu (ID: ${malinda.id})`);
    
    // 3. Verificar resultado
    console.log('\n🎉 Verificando resultado final...');
    const gestantesFinales = await prisma.gestantes.findMany({
      where: { 
        madrina_id: madrinaId,
        activa: true 
      },
      select: { 
        id: true, 
        nombre: true,
        documento: true
      },
      orderBy: { nombre: 'asc' }
    });
    
    console.log(`\n🤰 Total de gestantes asignadas a Crepu: ${gestantesFinales.length}`);
    gestantesFinales.forEach((g, index) => {
      console.log(`   ${index + 1}. ${g.nombre} (ID: ${g.id}) - Doc: ${g.documento}`);
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
            
            if (response.data.gestantes.length === 2) {
              console.log('\n✅ ¡ÉXITO! La madrina Crepu ahora ve sus 2 gestantes correctamente.');
            } else {
              console.log('\n⚠️ La madrina Crepu no ve las 2 gestantes esperadas.');
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
    
    console.log('\n✅ ¡Proceso completado!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();