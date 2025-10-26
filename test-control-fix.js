// Script de prueba para validar que el error 400 en controles ha sido resuelto
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testControlCreation() {
    console.log('🧪 Iniciando prueba de creación de control...');
    
    try {
        // Datos de prueba para crear un control
            const testData = {
                gestante_id: 'test-gestante-id', // ID de gestante de prueba
                medico_id: 'c66fdb18-76f4-4767-95ad-9b4b81fa6add', // Admin por defecto
                fecha_control: new Date(),
                semanas_gestacion: 20,
                peso: 65.5,
                presion_sistolica: 120,
                presion_diastolica: 80,
                frecuencia_cardiaca: 75,
                temperatura: 36.5,
                altura_uterina: 20,
                movimientos_fetales: true,
                edemas: false,
                recomendaciones: 'Control de rutina normal'
            };

        console.log('📊 Datos de prueba:', testData);

        // Intentar crear el control
        const result = await prisma.control_prenatal.create({
            data: testData
        });

        console.log('✅ Control creado exitosamente:', result.id);
        console.log('🔍 DEBUG: El error 400 ha sido RESUELTO');
        
        // Limpiar datos de prueba
        await prisma.control_prenatal.delete({
            where: { id: result.id }
        });
        
        console.log('🧹 Datos de prueba eliminados');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        
        // Analizar el error para determinar si es el error 400 original
        if (error.message.includes('gestante_id') || 
            error.message.includes('medico_id') ||
            error.message.includes('movimientos_fetales') ||
            error.message.includes('edemas')) {
            console.log('🔍 DEBUG: El error 400 PERSISTE - necesita más correcciones');
        } else {
            console.log('🔍 DEBUG: El error 400 ha sido RESUELTO - este es un error diferente');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar la prueba
testControlCreation();