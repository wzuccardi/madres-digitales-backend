import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticoBDCompleto() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          DIAGNÓSTICO COMPLETO DE BASE DE DATOS                 ║');
    console.log('║                  Madres Digitales                              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // 1. USUARIOS
    console.log('📋 TABLA: USUARIOS');
    console.log('─'.repeat(70));
    const usuarios = await prisma.usuarios.findMany();
    console.log(`Total: ${usuarios.length} registros\n`);
    usuarios.forEach((u, i) => {
      console.log(`${i + 1}. ${u.nombre} (${u.email})`);
      console.log(`   - ID: ${u.id}`);
      console.log(`   - Rol: ${u.rol}`);
      console.log(`   - Documento: ${u.documento} (${u.tipo_documento})`);
      console.log(`   - Activo: ${u.activo}\n`);
    });

    // 2. GESTANTES
    console.log('\n📋 TABLA: GESTANTES');
    console.log('─'.repeat(70));
    const gestantes = await prisma.gestantes.findMany();
    console.log(`Total: ${gestantes.length} registros\n`);
    gestantes.forEach((g, i) => {
      console.log(`${i + 1}. ${g.nombre}`);
      console.log(`   - ID: ${g.id}`);
      console.log(`   - Teléfono: ${g.telefono}`);
      console.log(`   - Documento: ${g.documento}`);
      console.log(`   - Municipio ID: ${g.municipio_id}`);
      console.log(`   - Madrina Asignada: ${g.madrina_id || 'No asignada'}`);
      console.log(`   - Activa: ${g.activa}\n`);
    });

    // 3. MADRINAS CON GESTANTES ASIGNADAS
    console.log('\n📋 MADRINAS CON GESTANTES ASIGNADAS');
    console.log('─'.repeat(70));
    const madrinas = usuarios.filter(u => u.rol === 'MADRINA');
    console.log(`Total de Madrinas: ${madrinas.length}\n`);

    for (const madrina of madrinas) {
      const gestantesAsignadas = gestantes.filter(g => g.madrina_id === madrina.id);

      console.log(`👩 ${madrina.nombre} (${madrina.email})`);
      console.log(`   - ID: ${madrina.id}`);
      console.log(`   - Gestantes Asignadas: ${gestantesAsignadas.length}`);
      if (gestantesAsignadas.length > 0) {
        gestantesAsignadas.forEach((g, i) => {
          console.log(`     ${i + 1}. ${g.nombre} (${g.documento})`);
        });
      }
      console.log();
    }

    // 4. MÉDICOS
    console.log('\n📋 TABLA: MÉDICOS');
    console.log('─'.repeat(70));
    const medicos = await prisma.medicos.findMany();
    console.log(`Total: ${medicos.length} registros\n`);
    medicos.forEach((m, i) => {
      console.log(`${i + 1}. ${m.nombre}`);
      console.log(`   - ID: ${m.id}`);
      console.log(`   - Email: ${m.email}`);
      console.log(`   - Especialidad: ${m.especialidad}`);
      console.log(`   - Documento: ${m.documento}`);
      console.log(`   - Activo: ${m.activo}\n`);
    });

    // 5. IPS
    console.log('\n📋 TABLA: IPS');
    console.log('─'.repeat(70));
    const ips_list = await prisma.ips.findMany();
    console.log(`Total: ${ips_list.length} registros\n`);
    ips_list.forEach((ip, i) => {
      console.log(`${i + 1}. ${ip.nombre}`);
      console.log(`   - ID: ${ip.id}`);
      console.log(`   - Municipio ID: ${ip.municipio_id}`);
      console.log(`   - Dirección: ${ip.direccion}`);
      console.log(`   - Teléfono: ${ip.telefono}`);
      console.log(`   - Activo: ${ip.activo}\n`);
    });

    // 6. CONTROLES PRENATALES
    console.log('\n📋 TABLA: CONTROLES PRENATALES');
    console.log('─'.repeat(70));
    const controles = await prisma.control_prenatal.findMany();
    console.log(`Total: ${controles.length} registros\n`);
    controles.forEach((c, i) => {
      console.log(`${i + 1}. Control Prenatal`);
      console.log(`   - ID: ${c.id}`);
      console.log(`   - Gestante ID: ${c.gestante_id}`);
      console.log(`   - Médico ID: ${c.medico_id}`);
      console.log(`   - Fecha: ${c.fecha_control}`);
      console.log(`   - Semanas de Gestación: ${c.semanas_gestacion}`);
      console.log(`   - Realizado: ${c.realizado}\n`);
    });

    // 7. ALERTAS
    console.log('\n📋 TABLA: ALERTAS');
    console.log('─'.repeat(70));
    const alertas = await prisma.alertas.findMany();
    console.log(`Total: ${alertas.length} registros\n`);
    alertas.forEach((a, i) => {
      console.log(`${i + 1}. Alerta ${a.tipo_alerta}`);
      console.log(`   - ID: ${a.id}`);
      console.log(`   - Gestante ID: ${a.gestante_id}`);
      console.log(`   - Prioridad: ${a.nivel_prioridad}`);
      console.log(`   - Estado: ${a.estado}`);
      console.log(`   - Fecha: ${a.fecha_creacion}\n`);
    });

    // 8. MUNICIPIOS
    console.log('\n📋 TABLA: MUNICIPIOS');
    console.log('─'.repeat(70));
    const municipios = await prisma.municipios.findMany();
    console.log(`Total: ${municipios.length} registros\n`);
    municipios.forEach((m, i) => {
      console.log(`${i + 1}. ${m.nombre}`);
      console.log(`   - ID: ${m.id}`);
      console.log(`   - Departamento: ${m.departamento}`);
      console.log(`   - Código DANE: ${m.codigo_dane}`);
      console.log(`   - Activo: ${m.activo}\n`);
    });

    // 9. RESUMEN ESTADÍSTICO
    console.log('\n📊 RESUMEN ESTADÍSTICO');
    console.log('─'.repeat(70));
    console.log(`Usuarios: ${usuarios.length}`);
    console.log(`Gestantes: ${gestantes.length}`);
    console.log(`Madrinas: ${madrinas.length}`);
    console.log(`Médicos: ${medicos.length}`);
    console.log(`IPS: ${ips_list.length}`);
    console.log(`Controles Prenatales: ${controles.length}`);
    console.log(`Alertas: ${alertas.length}`);
    console.log(`Municipios: ${municipios.length}`);

    // 10. GESTANTES SIN ASIGNAR
    console.log('\n\n📋 GESTANTES SIN MADRINA ASIGNADA');
    console.log('─'.repeat(70));
    const gestantesSinAsignar = gestantes.filter(g => !g.madrina_id);
    console.log(`Total: ${gestantesSinAsignar.length}\n`);
    gestantesSinAsignar.forEach((g, i) => {
      console.log(`${i + 1}. ${g.nombre} (${g.documento})`);
    });

    // 11. USUARIOS POR ROL
    console.log('\n\n📋 USUARIOS POR ROL');
    console.log('─'.repeat(70));
    const roles = [...new Set(usuarios.map(u => u.rol))];
    roles.forEach(rol => {
      const usuariosRol = usuarios.filter(u => u.rol === rol);
      console.log(`\n${rol}: ${usuariosRol.length}`);
      usuariosRol.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.nombre} (${u.email})`);
      });
    });

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  DIAGNÓSTICO COMPLETADO                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticoBDCompleto();

