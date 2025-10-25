"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Script para probar los endpoints de reportes
const reporte_service_1 = __importDefault(require("../services/reporte.service"));
async function testReportes() {
    console.log('🧪 Testing Reportes Service...\n');
    try {
        // 1. Resumen General
        console.log('1️⃣  Testing getResumenGeneral...');
        const resumen = await reporte_service_1.default.getResumenGeneral();
        console.log('✅ Resumen General:', JSON.stringify(resumen, null, 2));
        console.log('');
        // 2. Estadísticas de Gestantes
        console.log('2️⃣  Testing getEstadisticasGestantes...');
        const estadisticasGestantes = await reporte_service_1.default.getEstadisticasGestantes();
        console.log(`✅ Estadísticas de Gestantes: ${estadisticasGestantes.length} municipios`);
        console.log('Primeros 3:', JSON.stringify(estadisticasGestantes.slice(0, 3), null, 2));
        console.log('');
        // 3. Estadísticas de Controles
        console.log('3️⃣  Testing getEstadisticasControles...');
        const estadisticasControles = await reporte_service_1.default.getEstadisticasControles();
        console.log('✅ Estadísticas de Controles:', JSON.stringify(estadisticasControles, null, 2));
        console.log('');
        // 4. Estadísticas de Alertas
        console.log('4️⃣  Testing getEstadisticasAlertas...');
        const estadisticasAlertas = await reporte_service_1.default.getEstadisticasAlertas();
        console.log('✅ Estadísticas de Alertas:', JSON.stringify(estadisticasAlertas, null, 2));
        console.log('');
        // 5. Estadísticas de Riesgo
        console.log('5️⃣  Testing getEstadisticasRiesgo...');
        const estadisticasRiesgo = await reporte_service_1.default.getEstadisticasRiesgo();
        console.log('✅ Estadísticas de Riesgo:', JSON.stringify(estadisticasRiesgo, null, 2));
        console.log('');
        // 6. Tendencias
        console.log('6️⃣  Testing getTendencias...');
        const tendencias = await reporte_service_1.default.getTendencias(6);
        console.log(`✅ Tendencias: ${tendencias.length} períodos`);
        console.log('Datos:', JSON.stringify(tendencias, null, 2));
        console.log('');
        console.log('🎉 All tests passed!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error testing reportes:', error);
        process.exit(1);
    }
}
testReportes();
