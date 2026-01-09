// Script para corregir el filtrado de gestantes por madrina
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMadrinaFiltering() {
    console.log('🔧 Iniciando corrección del filtrado de gestantes por madrina...\n');

    try {
        // 1. Verificar todas las madrinas y sus gestantes asignadas
        console.log('1. Analizando estado actual de asignaciones...');
        
        const madrinas = await prisma.usuarios.findMany({
            where: {
                rol: {
                    in: ['MADRINA']
                },
                activo: true
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true
            }
        });

        console.log(`✅ Encontradas ${madrinas.length} madrinas activas`);

        // 2. Para cada madrina, verificar sus gestantes asignadas
        for (const madrina of madrinas) {
            console.log(`\n📊 Analizando madrina: ${madrina.nombre} (${madrina.email})`);
            console.log(`   ID: ${madrina.id}`);
            
            const gestantesAsignadas = await prisma.gestantes.findMany({
                where: {
                    madrina_id: madrina.id,
                    activa: true
                },
                select: {
                    id: true,
                    nombre: true,
                    documento: true,
                    madrina_id: true
                }
            });

            console.log(`   Gestantes asignadas: ${gestantesAsignadas.length}`);
            gestantesAsignadas.forEach(g => {
                console.log(`     - ${g.nombre} (ID: ${g.id}, Doc: ${g.documento})`);
            });

            // 3. Verificar si hay gestantes con IDs similares que podrían causar confusión
            const gestantesConIdsSimilares = await prisma.gestantes.findMany({
                where: {
                    activa: true,
                    OR: [
                        { madrina_id: { contains: madrina.id.substring(0, 8) } },
                        { madrina_id: { startsWith: madrina.id.substring(0, 10) } }
                    ]
                },
                select: {
                    id: true,
                    nombre: true,
                    documento: true,
                    madrina_id: true
                }
            });

            if (gestantesConIdsSimilares.length > gestantesAsignadas.length) {
                console.log(`   ⚠️ Se encontraron ${gestantesConIdsSimilares.length - gestantesAsignadas.length} gestantes con IDs similares`);
                gestantesConIdsSimilares.forEach(g => {
                    const esAsignadaCorrectamente = g.madrina_id === madrina.id;
                    console.log(`     - ${g.nombre} (ID: ${g.id}, madrina_id: ${g.madrina_id}) ${esAsignadaCorrectamente ? '✅' : '❌'}`);
                });
            }
        }

        // 4. Verificar si hay gestantes con madrina_id nulo o inválido
        console.log('\n2. Verificando gestantes con asignaciones problemáticas...');
        
        const gestantesSinMadrina = await prisma.gestantes.findMany({
            where: {
                activa: true,
                OR: [
                    { madrina_id: null },
                    { madrina_id: '' }
                ]
            },
            select: {
                id: true,
                nombre: true,
                documento: true,
                madrina_id: true
            }
        });

        console.log(`   Gestantes sin madrina asignada: ${gestantesSinMadrina.length}`);

        // 5. Verificar madrina_ids que no corresponden a usuarios válidos
        const todasLasMadrinas = await prisma.usuarios.findMany({
            where: { rol: 'MADRINA', activo: true },
            select: { id: true }
        });
        const madrinaIdsValidas = todasLasMadrinas.map(m => m.id);

        const gestantesConMadrinaInvalida = await prisma.gestantes.findMany({
            where: {
                activa: true,
                NOT: {
                    madrina_id: { in: madrinaIdsValidas }
                }
            },
            select: {
                id: true,
                nombre: true,
                documento: true,
                madrina_id: true
            }
        });

        console.log(`   Gestantes con madrina_id inválido: ${gestantesConMadrinaInvalida.length}`);
        if (gestantesConMadrinaInvalida.length > 0) {
            console.log('   ⚠️ Gestantes con madrina_id inválido:');
            gestantesConMadrinaInvalida.forEach(g => {
                console.log(`     - ${g.nombre} (madrina_id: ${g.madrina_id})`);
            });
        }

        // 6. Generar reporte de estado
        console.log('\n📋 RESUMEN DEL ESTADO:');
        console.log(`   - Madrinas activas: ${madrinas.length}`);
        console.log(`   - Gestantes sin madrina: ${gestantesSinMadrina.length}`);
        console.log(`   - Gestantes con madrina inválida: ${gestantesConMadrinaInvalida.length}`);

        // 7. Sugerencias de corrección
        if (gestantesConMadrinaInvalida.length > 0) {
            console.log('\n💡 SUGERENCIAS DE CORRECCIÓN:');
            console.log('   1. Las gestantes con madrina_id inválido deberían:');
            console.log('      - Asignarse a una madrina válida, o');
            console.log('      - Dejarse sin madrina (madrina_id = null)');
            
            console.log('\n   2. Para corregir, ejecuta:');
            console.log('      // Desasignar gestantes con madrina inválida');
            console.log(`      await prisma.gestantes.updateMany({`);
            console.log(`        where: { id: { in: [${gestantesConMadrinaInvalida.map(g => `'${g.id}'`).join(', ')}] } },`);
            console.log(`        data: { madrina_id: null }`);
            console.log(`      });`);
        }

    } catch (error) {
        console.error('❌ Error durante el diagnóstico:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar el diagnóstico
fixMadrinaFiltering();