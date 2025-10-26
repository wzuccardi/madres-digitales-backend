import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticarErroresPostFix() {
  console.log('🔍 DIAGNÓSTICO DE ERRORES DESPUÉS DEL FIX');
  console.log('=============================================\n');

  try {
    // 1. Verificar problemas de autenticación
    console.log('1. 🔐 Verificando problemas de autenticación...');
    
    // Probar getUserForFiltering
    try {
      const mockReq = {
        headers: { authorization: 'Bearer invalid-token' }
      } as any;
      
      const { getUserForFiltering } = await import('../utils/auth.utils');
      const user = await getUserForFiltering(mockReq);
      console.log(`   ✅ getUserForFiltering funciona: ${user.id} (${user.rol})`);
    } catch (error) {
      console.log(`   ❌ Error en getUserForFiltering: ${error}`);
    }

    // 2. Verificar problemas con médicos (TypeError: minified:a6e)
    console.log('\n2. 🩺 Verificando problemas con médicos...');
    
    try {
      // Probar consulta básica a médicos
      const medicos = await prisma.medicos.findMany({
        where: { activo: true },
        take: 5,
        orderBy: { nombre: 'asc' }
      });
      console.log(`   ✅ prisma.medico.findMany funciona: ${medicos.length} médicos`);
      
      // Verificar estructura de datos
      if (medicos.length > 0) {
        const primerMedico = medicos[0];
        console.log(`   📋 Estructura del primer médico:`, {
          id: primerMedico.id,
          nombre: primerMedico.nombre,
          tipo_nombre: typeof primerMedico.nombre,
          documento: primerMedico.documento,
          tipo_documento: typeof primerMedico.documento,
          municipio_id: primerMedico.municipio_id,
          tipo_municipio_id: typeof primerMedico.municipio_id
        });
      }
    } catch (error) {
      console.log(`   ❌ Error en consulta de médicos: ${error}`);
      console.log(`   🔍 Posible causa: El modelo 'medico' no existe en el schema o está mal definido`);
    }

    // 3. Verificar problemas con IPS (TypeError: minified:a6e)
    console.log('\n3. 🏥 Verificando problemas con IPS...');
    
    try {
      // Probar consulta básica a IPS
      const ips = await prisma.ips.findMany({
        where: { activo: true },
        take: 5,
        orderBy: { nombre: 'asc' }
      });
      console.log(`   ✅ prisma.iPS.findMany funciona: ${ips.length} IPS`);
      
      // Verificar estructura de datos
      if (ips.length > 0) {
        const primerIPS = ips[0];
        console.log(`   📋 Estructura de la primera IPS:`, {
          id: primerIPS.id,
          nombre: primerIPS.nombre,
          tipo_nombre: typeof primerIPS.nombre,
          municipio_id: primerIPS.municipio_id,
          tipo_municipio_id: typeof primerIPS.municipio_id
        });
      }
    } catch (error) {
      console.log(`   ❌ Error en consulta de IPS: ${error}`);
      console.log(`   🔍 Posible causa: El modelo 'ips' no existe en el schema o está mal definido`);
    }

    // 4. Verificar problemas con controles (error 400)
    console.log('\n4. 🏥 Verificando problemas con controles...');
    
    try {
      // Probar consulta básica a control_prenatal
      const controles = await prisma.control_prenatal.findMany({
        take: 5,
        orderBy: { fecha_control: 'desc' }
      });
      console.log(`   ✅ prisma.control_prenatal.findMany funciona: ${controles.length} controles`);
      
      // Probar creación de control de prueba
      const testControl = await prisma.control_prenatal.create({
        data: {
          id: `test-control-${Date.now()}`,
          gestante_id: 'test-gestante',
          fecha_control: new Date(),
          semanas_gestacion: 20,
          peso: 65.5,
          presion_sistolica: 120,
          presion_diastolica: 80,
          realizado: true,
          observaciones: 'Control de prueba para diagnóstico'
        }
      });
      console.log(`   ✅ Creación de control funciona: ID ${testControl.id}`);
      
      // Eliminar control de prueba
      await prisma.control_prenatal.delete({
        where: { id: testControl.id }
      });
      console.log(`   ✅ Eliminación de control funciona`);
      
    } catch (error) {
      console.log(`   ❌ Error en operaciones de controles: ${error}`);
      console.log(`   🔍 Posible causa: Problemas con tipos de datos o validaciones`);
    }

    // 5. Verificar problemas con contenidos (error 400)
    console.log('\n5. 📚 Verificando problemas con contenidos...');
    
    try {
      // Probar consulta básica a contenidos
      const contenidos = await prisma.contenidos.findMany({
        where: { activo: true },
        take: 5,
        orderBy: { titulo: 'asc' }
      });
      console.log(`   ✅ prisma.contenidos.findMany funciona: ${contenidos.length} contenidos`);
      
      // Verificar estructura de datos
      if (contenidos.length > 0) {
        const primerContenido = contenidos[0];
        console.log(`   📋 Estructura del primer contenido:`, {
          id: primerContenido.id,
          titulo: primerContenido.titulo,
          tipo_titulo: typeof primerContenido.titulo,
          tipo: primerContenido.tipo,
          tipo_tipo: typeof primerContenido.tipo,
          categoria: primerContenido.categoria,
          tipo_categoria: typeof primerContenido.categoria
        });
      }
    } catch (error) {
      console.log(`   ❌ Error en consulta de contenidos: ${error}`);
      console.log(`   🔍 Posible causa: El modelo 'contenidos' no existe en el schema o está mal definido`);
    }

    // 6. Verificar compatibilidad general con Prisma
    console.log('\n6. 🔧 Verificando compatibilidad general con Prisma...');
    
    try {
      // Listar todos los modelos disponibles
      const modelos = Object.keys(prisma).filter(key => !key.startsWith('_'));
      console.log(`   📋 Modelos Prisma disponibles: ${modelos.join(', ')}`);
      
      // Verificar modelos críticos
      const modelosCriticos = ['usuarios', 'gestantes', 'medicos', 'ips', 'contenidos', 'control_prenatal', 'alertas'];
      const modelosFaltantes = modelosCriticos.filter(modelo => !modelos.includes(modelo));
      
      if (modelosFaltantes.length > 0) {
        console.log(`   ⚠️  Modelos críticos faltantes: ${modelosFaltantes.join(', ')}`);
      } else {
        console.log(`   ✅ Todos los modelos críticos están disponibles`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error verificando modelos Prisma: ${error}`);
    }

    console.log('\n✅ Diagnóstico completado');
    console.log('\n📋 RESUMEN DE PROBLEMAS IDENTIFICADOS:');
    console.log('   1. Errores de autenticación - Revisar middleware y utils');
    console.log('   2. TypeError en médicos - Revisar modelo medico en schema');
    console.log('   3. TypeError en IPS - Revisar modelo ips en schema');
    console.log('   4. Error 400 en controles - Revisar validaciones y tipos');
    console.log('   5. Error 400 en contenidos - Revisar modelo contenidos en schema');
    console.log('   6. Problemas generales de compatibilidad con Prisma');
    
  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar diagnóstico
diagnosticarErroresPostFix()
  .then(() => {
    console.log('\n🎉 Diagnóstico completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en diagnóstico:', error);
    process.exit(1);
  });