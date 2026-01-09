#!/usr/bin/env node

/**
 * Script simple para probar permisos sin complicaciones de TypeScript
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPermissions() {
  console.log('🔍 INICIANDO PRUEBA SIMPLE DE PERMISOS\n');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('📋 TEST 1: Verificando conexión a la base de datos...');
    const userCount = await prisma.usuarios.count();
    console.log(`✅ Conexión exitosa. Usuarios encontrados: ${userCount}`);

    // 2. Verificar usuarios y roles
    console.log('\n👥 TEST 2: Verificando usuarios y roles...');
    const users = await prisma.usuarios.findMany({
      select: {
        id: true,
        email: true,
        rol: true,
        municipio_id: true,
        activo: true
      },
      take: 5
    });

    const roles = users.map(u => u.rol);
    const uniqueRoles = [...new Set(roles)];
    console.log(`✅ Roles encontrados: ${uniqueRoles.join(', ')}`);

    // 3. Verificar si los roles coinciden con los esperados por el controlador
    console.log('\n🔐 TEST 3: Verificando compatibilidad de roles...');
    const rolesPermitidosPorControlador = ['ADMIN', 'SUPER_ADMIN', 'COORDINADOR', 'MADRINA', 'MEDICO'];
    
    let roleIssues = [];
    for (const user of users) {
      const upperRole = user.rol ? user.rol.toUpperCase() : 'NO_ROLE';
      if (!rolesPermitidosPorControlador.includes(upperRole)) {
        roleIssues.push(`Usuario ${user.email}: Rol '${user.rol}' no está en la lista permitida`);
      }
    }

    if (roleIssues.length === 0) {
      console.log('✅ Todos los roles son compatibles con el controlador');
    } else {
      console.log(`❌ Problemas de compatibilidad encontrados:`);
      roleIssues.forEach(issue => console.log(`   - ${issue}`));
    }

    // 4. Verificar gestantes asignadas
    console.log('\n🤰 TEST 4: Verificando gestantes asignadas...');
    for (const user of users.slice(0, 2)) { // Solo probar 2 usuarios
      const gestantesCount = await prisma.gestantes.count({
        where: {
          madrina_id: user.id,
          activa: true
        }
      });
      
      console.log(`   Usuario ${user.email} (${user.rol}): ${gestantesCount} gestantes asignadas`);
    }

    // 5. Resumen
    console.log('\n📊 RESUMEN DE DIAGNÓSTICO');
    console.log(`   - Usuarios totales: ${userCount}`);
    console.log(`   - Roles únicos: ${uniqueRoles.join(', ')}`);
    console.log(`   - Problemas de roles: ${roleIssues.length}`);
    console.log(`   - Roles esperados por controlador: ${rolesPermitidosPorControlador.join(', ')}`);

    // 6. Recomendaciones
    if (roleIssues.length > 0) {
      console.log('\n💡 RECOMENDACIONES:');
      console.log('1. Los roles en la base de datos deben coincidir exactamente con los roles del enum');
      console.log('2. El controlador debe manejar todos los roles del enum RolUsuario');
      console.log('3. Verificar que los roles estén en mayúsculas en el enum');
    }

    console.log('\n🎯 Prueba completada');

  } catch (error) {
    console.error('❌ Error en prueba de permisos:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión a base de datos cerrada');
  }
}

// Ejecutar prueba
testPermissions()
  .then(() => {
    console.log('\n✅ Prueba de permisos completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en prueba de permisos:', error);
    process.exit(1);
  });