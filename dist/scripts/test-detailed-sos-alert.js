"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testDetailedSOSAlert() {
    try {
        console.log('🚨 Testing detailed SOS Alert...');
        // Obtener una gestante de prueba simple
        const gestante = await prisma.gestante.findFirst();
        if (!gestante) {
            console.log('❌ No se encontraron gestantes de prueba');
            return;
        }
        console.log(`📋 Gestante encontrada: ${gestante.nombre} (${gestante.id})`);
        // Crear alerta SOS con coordenadas de prueba
        const coordenadas = [-75.5171328, 10.4562688];
        // Simular la creación de la alerta SOS
        const alertaService = await Promise.resolve().then(() => __importStar(require('../services/alerta.service')));
        const alertaServiceInstance = new alertaService.AlertaService();
        const alertaSOS = await alertaServiceInstance.notificarEmergencia(gestante.id, coordenadas);
        console.log('\n🎉 ¡Alerta SOS creada exitosamente!');
        console.log(`📋 ID de la alerta: ${alertaSOS.id}`);
        console.log(`🚨 Tipo: ${alertaSOS.tipo_alerta}`);
        console.log(`⚠️ Prioridad: ${alertaSOS.nivel_prioridad}`);
        // Mostrar el mensaje completo
        console.log('\n📝 MENSAJE COMPLETO DE LA ALERTA:');
        console.log('='.repeat(80));
        console.log(alertaSOS.mensaje);
        console.log('='.repeat(80));
        // Obtener la alerta creada
        const alertaCompleta = await prisma.alerta.findUnique({
            where: { id: alertaSOS.id }
        });
        if (alertaCompleta) {
            console.log('\n✅ Verificación de datos de la alerta:');
            console.log(`📍 Coordenadas: ${JSON.stringify(alertaCompleta.coordenadas_alerta)}`);
            console.log(`📅 Fecha creación: ${alertaCompleta.created_at}`);
            console.log(`🔄 Estado: ${alertaCompleta.resuelta ? 'Resuelta' : 'Activa'}`);
        }
    }
    catch (error) {
        console.error('❌ Error testing detailed SOS alert:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testDetailedSOSAlert();
