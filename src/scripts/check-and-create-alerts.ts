import prisma from '../config/database';

async function checkAndCreateAlerts() {
    try {
        console.log('🔍 Verificando estado de alertas...\n');

        // 1. Contar alertas actuales
        const totalAlertas = await prisma.alerta.count();
        console.log(`📊 Total de alertas en BD: ${totalAlertas}`);

        // 2. Contar gestantes
        const totalGestantes = await prisma.gestante.count();
        console.log(`🤰 Total de gestantes en BD: ${totalGestantes}`);

        // 3. Contar controles
        const totalControles = await prisma.controlPrenatal.count();
        console.log(`🏥 Total de controles en BD: ${totalControles}\n`);

        if (totalGestantes === 0) {
            console.log('⚠️  No hay gestantes en la base de datos');
            console.log('💡 Primero debes crear gestantes antes de crear alertas\n');
            return;
        }

        // 4. Obtener una gestante para crear alertas de prueba
        const gestante = await prisma.gestante.findFirst({
            select: {
                id: true,
                nombre: true,
                documento: true
            }
        });

        if (!gestante) {
            console.log('❌ No se encontró ninguna gestante');
            return;
        }

        console.log(`👤 Gestante seleccionada: ${gestante.nombre} (${gestante.documento})\n`);

        // 5. Crear alertas de prueba si no hay ninguna
        if (totalAlertas === 0) {
            console.log('🚨 Creando alertas de prueba...\n');

            // Alerta crítica
            const alertaCritica = await prisma.alerta.create({
                data: {
                    gestante_id: gestante.id,
                    tipo_alerta: 'emergencia_obstetrica',
                    nivel_prioridad: 'critica',
                    mensaje: 'Presión arterial muy alta detectada - Requiere atención inmediata',
                    es_automatica: false,
                    resuelta: false
                }
            });
            console.log('✅ Alerta CRÍTICA creada:', alertaCritica.id);

            // Alerta alta
            const alertaAlta = await prisma.alerta.create({
                data: {
                    gestante_id: gestante.id,
                    tipo_alerta: 'sintoma_alarma',
                    nivel_prioridad: 'alta',
                    mensaje: 'Síntomas de alarma: dolor de cabeza intenso y visión borrosa',
                    es_automatica: false,
                    resuelta: false
                }
            });
            console.log('✅ Alerta ALTA creada:', alertaAlta.id);

            // Alerta media
            const alertaMedia = await prisma.alerta.create({
                data: {
                    gestante_id: gestante.id,
                    tipo_alerta: 'control_vencido',
                    nivel_prioridad: 'media',
                    mensaje: 'Control prenatal vencido - Más de 30 días sin control',
                    es_automatica: false,
                    resuelta: false
                }
            });
            console.log('✅ Alerta MEDIA creada:', alertaMedia.id);

            // Alerta baja
            const alertaBaja = await prisma.alerta.create({
                data: {
                    gestante_id: gestante.id,
                    tipo_alerta: 'riesgo_alto',
                    nivel_prioridad: 'baja',
                    mensaje: 'Recordatorio: Próximo control prenatal en 7 días',
                    es_automatica: false,
                    resuelta: false
                }
            });
            console.log('✅ Alerta BAJA creada:', alertaBaja.id);

            // Alerta resuelta (para pruebas)
            const alertaResuelta = await prisma.alerta.create({
                data: {
                    gestante_id: gestante.id,
                    tipo_alerta: 'control_vencido',
                    nivel_prioridad: 'media',
                    mensaje: 'Control prenatal realizado exitosamente',
                    es_automatica: false,
                    resuelta: true,
                    fecha_resolucion: new Date()
                }
            });
            console.log('✅ Alerta RESUELTA creada:', alertaResuelta.id);

            console.log('\n🎉 5 alertas de prueba creadas exitosamente!\n');
        }

        // 6. Mostrar resumen final
        const alertasActivas = await prisma.alerta.count({ where: { resuelta: false } });
        const alertasResueltas = await prisma.alerta.count({ where: { resuelta: true } });
        const alertasCriticas = await prisma.alerta.count({ 
            where: { nivel_prioridad: 'critica', resuelta: false } 
        });
        const alertasAltas = await prisma.alerta.count({ 
            where: { nivel_prioridad: 'alta', resuelta: false } 
        });
        const alertasMedias = await prisma.alerta.count({ 
            where: { nivel_prioridad: 'media', resuelta: false } 
        });
        const alertasBajas = await prisma.alerta.count({ 
            where: { nivel_prioridad: 'baja', resuelta: false } 
        });

        console.log('📊 RESUMEN DE ALERTAS:');
        console.log('─────────────────────────────');
        console.log(`Total alertas:      ${alertasActivas + alertasResueltas}`);
        console.log(`Activas:            ${alertasActivas}`);
        console.log(`Resueltas:          ${alertasResueltas}`);
        console.log('');
        console.log('Por prioridad (activas):');
        console.log(`  🔴 Críticas:      ${alertasCriticas}`);
        console.log(`  🟠 Altas:         ${alertasAltas}`);
        console.log(`  🟡 Medias:        ${alertasMedias}`);
        console.log(`  🟢 Bajas:         ${alertasBajas}`);
        console.log('─────────────────────────────\n');

        console.log('✅ Ahora puedes ver las alertas en:');
        console.log('   - Frontend: http://localhost:3008 (sección Alertas)');
        console.log('   - API: GET http://localhost:3000/api/alertas');
        console.log('   - Swagger: http://localhost:3000/api-docs\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndCreateAlerts();

