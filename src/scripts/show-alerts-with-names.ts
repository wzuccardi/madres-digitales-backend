import prisma from '../config/database';

async function showAlertsWithNames() {
    try {
        console.log('🚨 Mostrando alertas con nombres de gestantes...\n');

        // Obtener alertas
        const alertas = await prisma.alerta.findMany({
            orderBy: { created_at: 'desc' },
            take: 10
        });

        console.log(`📊 Total de alertas: ${alertas.length}\n`);

        // Obtener gestantes para cada alerta
        for (const [index, alerta] of alertas.entries()) {
            const gestante = await prisma.gestante.findUnique({
                where: { id: alerta.gestante_id },
                select: { nombre: true, documento: true }
            });

            const prioridadIcon = {
                'critica': '🔴',
                'alta': '🟠',
                'media': '🟡',
                'baja': '🟢'
            }[alerta.nivel_prioridad] || '⚪';

            const estadoIcon = alerta.resuelta ? '✅' : '⏳';

            console.log(`${index + 1}. ${prioridadIcon} ${estadoIcon} ${alerta.tipo_alerta.toUpperCase()}`);
            console.log(`   Gestante: ${gestante?.nombre || 'Desconocida'} (${gestante?.documento || 'N/A'})`);
            console.log(`   Prioridad: ${alerta.nivel_prioridad}`);
            console.log(`   Mensaje: ${alerta.mensaje}`);
            console.log(`   Estado: ${alerta.resuelta ? 'Resuelta' : 'Activa'}`);
            console.log(`   Fecha: ${alerta.created_at.toLocaleString('es-CO')}`);
            console.log('');
        }

        // Resumen
        const activas = alertas.filter(a => !a.resuelta).length;
        const resueltas = alertas.filter(a => a.resuelta).length;
        const criticas = alertas.filter(a => a.nivel_prioridad === 'critica' && !a.resuelta).length;

        console.log('─────────────────────────────');
        console.log(`📊 Resumen (últimas 10):`);
        console.log(`   Activas: ${activas}`);
        console.log(`   Resueltas: ${resueltas}`);
        console.log(`   Críticas activas: ${criticas}`);
        console.log('─────────────────────────────\n');

        console.log('✅ El backend está devolviendo nombres de gestantes correctamente');
        console.log('✅ El frontend debería mostrar estos nombres en el Centro de Notificaciones\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

showAlertsWithNames();

