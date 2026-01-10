// Script para corregir la asignación específica de gestantes a madrina
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function correctMadrinaAssignment() {
    console.log('🔧 Corrigiendo asignación específica de gestantes...\n');

    try {
        // 1. Obtener el ID de la madrina logueada actual
        console.log('1. Identificando a la madrina logueada...');
        
        const madrinaLogueada = await prisma.usuarios.findFirst({
            where: {
                id: "user_1763791367449_40gzfw"
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true
            }
        });

        if (!madrinaLogueada) {
            console.log('❌ No se encontró la madrina con ID: user_1763791367449_40gzfw');
            return;
        }

        console.log(`✅ Madrina logueada: ${madrinaLogueada.nombre} (${madrinaLogueada.id})`);

        // 2. Obtener las gestantes que actualmente ve (incorrectas)
        console.log('\n2. Analizando gestantes actualmente asignadas...');
        
        const gestantesIncorrectas = await prisma.gestantes.findMany({
            where: {
                madrina_id: "user_1763791367449_40gzfw",
                activa: true
            },
            select: {
                id: true,
                nombre: true,
                documento: true,
                madrina_id: true
            }
        });

        console.log(`   Gestantes actualmente asignadas: ${gestantesIncorrectas.length}`);
        gestantesIncorrectas.forEach(g => {
            console.log(`     - ${g.nombre} (ID: ${g.id})`);
        });

        // 3. Buscar las gestantes que debería ver (correctas)
        console.log('\n3. Buscando las gestantes correctas...');
        
        const gestantesCorrectas = await prisma.gestantes.findMany({
            where: {
                id: {
                    in: ["gestante_1763277531205_ti6w59", "gestante_1763612771433_jqobr3"]
                },
                activa: true
            },
            select: {
                id: true,
                nombre: true,
                documento: true,
                madrina_id: true
            }
        });

        console.log(`   Gestantes que debería ver: ${gestantesCorrectas.length}`);
        gestantesCorrectas.forEach(g => {
            console.log(`     - ${g.nombre} (ID: ${g.id}, madrina_id_actual: ${g.madrina_id})`);
        });

        // 4. Verificar a qué madrina están asignadas las gestantes correctas
        if (gestantesCorrectas.length > 0) {
            const madrinaIdsCorrectas = [...new Set(gestantesCorrectas.map(g => g.madrina_id).filter(id => id))];
            
            if (madrinaIdsCorrectas.length > 0) {
                console.log('\n4. Verificando madrinas actuales de las gestantes correctas...');
                
                for (const madrinaId of madrinaIdsCorrectas) {
                    const madrina = await prisma.usuarios.findUnique({
                        where: { id: madrinaId },
                        select: { id: true, nombre: true, email: true, rol: true }
                    });
                    
                    if (madrina) {
                        console.log(`   - ${madrina.nombre} (${madrina.id}) - Rol: ${madrina.rol}`);
                    } else {
                        console.log(`   - ID inválido: ${madrinaId} (no existe usuario)`);
                    }
                }
            }
        }

        // 5. Opciones de corrección
        console.log('\n5. OPCIONES DE CORRECCIÓN:');
        console.log('   Opción A: Asignar las gestantes correctas a la madrina logueada');
        console.log('   Opción B: Desasignar las gestantes incorrectas de la madrina logueada');
        console.log('   Opción C: Ambas (asignar correctas y desasignar incorrectas)');

        // 6. Ejecutar corrección (Opción C - la más completa)
        console.log('\n6. Ejecutando corrección completa...');
        
        // 6.1 Asignar las gestantes correctas a la madrina logueada
        if (gestantesCorrectas.length > 0) {
            const updateCorrectas = await prisma.gestantes.updateMany({
                where: {
                    id: {
                        in: ["gestante_1763277531205_ti6w59", "gestante_1763612771433_jqobr3"]
                    }
                },
                data: {
                    madrina_id: "user_1763791367449_40gzfw"
                }
            });
            
            console.log(`   ✅ Asignadas ${updateCorrectas.count} gestantes correctas a la madrina logueada`);
        }

        // 6.2 Desasignar las gestantes incorrectas
        if (gestantesIncorrectas.length > 0) {
            const updateIncorrectas = await prisma.gestantes.updateMany({
                where: {
                    id: {
                        in: gestantesIncorrectas.map(g => g.id)
                    }
                },
                data: {
                    madrina_id: null
                }
            });
            
            console.log(`   ✅ Desasignadas ${updateIncorrectas.count} gestantes incorrectas`);
        }

        // 7. Verificar resultado
        console.log('\n7. Verificando resultado final...');
        
        const gestantesFinales = await prisma.gestantes.findMany({
            where: {
                madrina_id: "user_1763791367449_40gzfw",
                activa: true
            },
            select: {
                id: true,
                nombre: true,
                documento: true
            }
        });

        console.log(`   ✅ Gestantes finales asignadas a la madrina: ${gestantesFinales.length}`);
        gestantesFinales.forEach(g => {
            console.log(`     - ${g.nombre} (ID: ${g.id})`);
        });

        console.log('\n🎉 CORRECCIÓN COMPLETADA');
        console.log('Ahora la madrina debería ver solo las gestantes correctas.');

    } catch (error) {
        console.error('❌ Error durante la corrección:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar la corrección
correctMadrinaAssignment();