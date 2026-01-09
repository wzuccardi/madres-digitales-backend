import prisma from '../config/database';

async function corregirCampoMadrina() {
  console.log('🔧 CORRECCIÓN: Campo madrina_id en gestantes\n');
  console.log('='.repeat(80));

  try {
    // 1. Verificar estructura actual de la tabla
    console.log('\n📋 Verificando estructura de la tabla gestantes...');
    
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'gestantes'
      AND column_name LIKE '%madrina%' OR column_name LIKE '%user_%'
      ORDER BY column_name;
    `;
    
    console.log('\nColumnas relacionadas con madrina:');
    console.log(result);

    // 2. Verificar si existe el campo incorrecto
    const campoIncorrecto = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'gestantes'
      AND column_name = 'user_1763271159091_icaaa5';
    `;

    if (Array.isArray(campoIncorrecto) && campoIncorrecto.length > 0) {
      console.log('\n⚠️  Se encontró el campo incorrecto: user_1763271159091_icaaa5');
      console.log('Procediendo a corregir...\n');

      // 3. Verificar si ya existe madrina_id
      const madrinaIdExists = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'gestantes'
        AND column_name = 'madrina_id';
      `;

      if (Array.isArray(madrinaIdExists) && madrinaIdExists.length === 0) {
        // Crear columna madrina_id
        console.log('📝 Creando columna madrina_id...');
        await prisma.$executeRaw`
          ALTER TABLE gestantes
          ADD COLUMN madrina_id TEXT;
        `;
        console.log('✅ Columna madrina_id creada');
      }

      // 4. Copiar datos del campo incorrecto a madrina_id
      console.log('\n📋 Copiando datos de user_1763271159091_icaaa5 a madrina_id...');
      await prisma.$executeRaw`
        UPDATE gestantes
        SET madrina_id = "user_1763271159091_icaaa5"
        WHERE "user_1763271159091_icaaa5" IS NOT NULL;
      `;
      console.log('✅ Datos copiados');

      // 5. Crear índice en madrina_id
      console.log('\n📋 Creando índice en madrina_id...');
      try {
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS idx_gestantes_madrina
          ON gestantes(madrina_id);
        `;
        console.log('✅ Índice creado');
      } catch (error) {
        console.log('ℹ️  Índice ya existe o no se pudo crear');
      }

      // 6. Crear foreign key constraint
      console.log('\n📋 Creando foreign key constraint...');
      try {
        await prisma.$executeRaw`
          ALTER TABLE gestantes
          ADD CONSTRAINT fk_gestantes_madrina
          FOREIGN KEY (madrina_id)
          REFERENCES usuarios(id)
          ON DELETE SET NULL;
        `;
        console.log('✅ Foreign key creada');
      } catch (error) {
        console.log('ℹ️  Foreign key ya existe o no se pudo crear');
      }

      // 7. Opcional: Eliminar columna incorrecta (comentado por seguridad)
      console.log('\n⚠️  NOTA: El campo user_1763271159091_icaaa5 NO se eliminará automáticamente');
      console.log('Si deseas eliminarlo, ejecuta manualmente:');
      console.log('ALTER TABLE gestantes DROP COLUMN "user_1763271159091_icaaa5";');

    } else {
      console.log('\n✅ No se encontró el campo incorrecto');
      console.log('Verificando que madrina_id existe y tiene datos...');
      
      const gestantesConMadrina = await prisma.gestantes.count({
        where: {
          madrina_id: {
            not: null
          }
        }
      });
      
      console.log(`\n📊 Gestantes con madrina asignada: ${gestantesConMadrina}`);
    }

    // 8. Verificar resultado final
    console.log('\n\n📊 VERIFICACIÓN FINAL:');
    console.log('='.repeat(80));
    
    const gestantes = await prisma.gestantes.findMany({
      select: {
        id: true,
        nombre: true,
        madrina_id: true,
        madrina: {
          select: {
            id: true,
            nombre: true,
            email: true,
          }
        }
      },
      take: 10
    });

    console.log(`\nPrimeras 10 gestantes:`);
    gestantes.forEach((g, index) => {
      console.log(`\n${index + 1}. ${g.nombre}`);
      console.log(`   madrina_id: ${g.madrina_id || 'NULL'}`);
      if (g.madrina) {
        console.log(`   Madrina: ${g.madrina.nombre} (${g.madrina.email})`);
      } else if (g.madrina_id) {
        console.log(`   ⚠️  madrina_id existe pero no se encuentra el usuario`);
      } else {
        console.log(`   Sin madrina asignada`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Corrección completada\n');

  } catch (error) {
    console.error('\n❌ Error durante la corrección:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

corregirCampoMadrina();
