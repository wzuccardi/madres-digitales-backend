const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creando y asignando gestantes a la madrina Crepu...');
    
    // Verificar que la madrina Crepu existe
    const madrina = await prisma.usuarios.findUnique({
      where: { id: 'user_1763791367449_40gzfw' },
      select: { id: true, nombre: true, email: true, rol: true }
    });
    
    if (!madrina) {
      console.log('❌ La madrina Crepu no existe');
      return;
    }
    
    console.log(`👤 Madrina encontrada: ${madrina.nombre} (${madrina.email}) - Rol: ${madrina.rol}`);
    
    // Crear gestantes si no existen
    console.log('\n🔧 Creando gestantes...');
    
    // Gestante 1: Marilyn Monroe
    const marilyn = await prisma.gestantes.upsert({
      where: { id: 'gestante_1763277531205_ti6w59' },
      update: { 
        madrina_id: madrina.id,
        activa: true
      },
      create: {
        id: 'gestante_1763277531205_ti6w59',
        nombre: 'Marilyn Monroe',
        documento: '457893215',
        telefono: '3017896542',
        direccion: 'Magangue',
        fecha_nacimiento: new Date('2000-11-22'),
        fecha_probable_parto: new Date('2026-07-24'),
        madrina_id: madrina.id,
        regimen_salud: 'subsidiado',
        activa: true
      }
    });
    
    console.log(`   ✅ Marilyn Monroe (ID: ${marilyn.id})`);
    
    // Gestante 2: malinda
    const malinda = await prisma.gestantes.upsert({
      where: { id: 'gestante_1763612771433_jqobr3' },
      update: { 
        madrina_id: madrina.id,
        activa: true
      },
      create: {
        id: 'gestante_1763612771433_jqobr3',
        nombre: 'malinda',
        documento: '456321789',
        telefono: '3001239875',
        direccion: 'casa',
        fecha_nacimiento: new Date('2007-11-24'),
        fecha_probable_parto: new Date('2026-08-26'),
        madrina_id: madrina.id,
        eps: 'sanitas',
        regimen_salud: 'subsidiado',
        activa: true
      }
    });
    
    console.log(`   ✅ malinda (ID: ${malinda.id})`);
    
    // Verificar resultado final
    console.log('\n🎉 Verificando resultado final...');
    const gestantesFinales = await prisma.gestantes.findMany({
      where: { 
        madrina_id: madrina.id,
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
      console.log(`   ${index + 1}. ${g.nombre} (ID: ${g.id}) - Doc: ${g.documento}`);
    });
    
    // Probar el endpoint
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