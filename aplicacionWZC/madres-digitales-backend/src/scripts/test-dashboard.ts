// Script para probar el funcionamiento del dashboard
import { DashboardService } from '../services/dashboard.service';

async function testDashboard() {
    console.log('🚀 Iniciando pruebas del dashboard...\n');
    
    const dashboardService = new DashboardService();
    
    try {
        // 1. Probar estadísticas generales
        console.log('📊 Probando getEstadisticasGenerales()...');
        const estadisticasGenerales = await dashboardService.getEstadisticasGenerales();
        console.log('✅ Estadísticas generales obtenidas:', JSON.stringify(estadisticasGenerales, null, 2));
        console.log('');
        
        // 2. Probar estadísticas por período (últimos 7 días)
        console.log('📅 Probando getEstadisticasPorPeriodo() (últimos 7 días)...');
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        const fechaFin = new Date();
        
        const estadisticasPeriodo = await dashboardService.getEstadisticasPorPeriodo(
            fechaInicio.toISOString(),
            fechaFin.toISOString()
        );
        console.log('✅ Estadísticas por período obtenidas');
        console.log(`   Período: ${estadisticasPeriodo.periodo}`);
        console.log(`   Nuevas gestantes: ${estadisticasPeriodo.nuevasGestantes}`);
        console.log(`   Controles realizados: ${estadisticasPeriodo.controlesRealizados}`);
        console.log(`   Alertas generadas: ${estadisticasPeriodo.alertasGeneradas}`);
        console.log(`   Promedio tiempo resolución: ${estadisticasPeriodo.promedioTiempoResolucion} horas`);
        console.log('');
        
        // 3. Probar resumen de alertas
        console.log('🚨 Probando getResumenAlertas()...');
        const resumenAlertas = await dashboardService.getResumenAlertas();
        console.log(`✅ Resumen de alertas obtenido: ${resumenAlertas.length} alertas activas`);
        if (resumenAlertas.length > 0) {
            console.log('   Primera alerta:', {
                id: resumenAlertas[0].id,
                tipo: resumenAlertas[0].tipo_alerta,
                prioridad: resumenAlertas[0].nivel_prioridad,
                gestante: resumenAlertas[0].gestante?.nombre
            });
        }
        console.log('');
        
        // 4. Probar resumen de controles
        console.log('🏥 Probando getResumenControles()...');
        const resumenControles = await dashboardService.getResumenControles();
        console.log(`✅ Resumen de controles obtenido: ${resumenControles.length} controles recientes`);
        if (resumenControles.length > 0) {
            console.log('   Primer control:', {
                id: resumenControles[0].id,
                fecha: resumenControles[0].fecha_control,
                semanas: resumenControles[0].semanas_gestacion,
                gestante: resumenControles[0].gestante?.nombre
            });
        }
        console.log('');
        
        // 5. Probar estadísticas geográficas
        console.log('🗺️ Probando getEstadisticasGeograficas()...');
        const estadisticasGeograficas = await dashboardService.getEstadisticasGeograficas();
        console.log('✅ Estadísticas geográficas obtenidas:', {
            region: estadisticasGeograficas.region,
            departamento: estadisticasGeograficas.departamento,
            municipio: estadisticasGeograficas.municipio,
            totalGestantes: estadisticasGeograficas.totalGestantes,
            alertasActivas: estadisticasGeograficas.alertasActivas
        });
        console.log('');
        
        console.log('🎉 Todas las pruebas del dashboard se completaron exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas del dashboard:', error);
        process.exit(1);
    }
}

// Ejecutar las pruebas
testDashboard()
    .then(() => {
        console.log('\n✨ Pruebas finalizadas');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });