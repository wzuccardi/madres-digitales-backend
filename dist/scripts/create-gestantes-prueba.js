"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createGestantesPrueba() {
    try {
        console.log('🤰 Creando gestantes de prueba...');
        // Obtener municipios, IPS y médicos para asignar
        const municipios = await prisma.municipio.findMany({
            select: { id: true, nombre: true }
        });
        const ips = await prisma.iPS.findMany({
            select: { id: true, nombre: true }
        });
        const medicos = await prisma.medico.findMany({
            select: { id: true, nombre: true }
        });
        const madrinas = await prisma.usuario.findMany({
            where: { rol: 'madrina' },
            select: { id: true, nombre: true }
        });
        // Lista de gestantes de prueba
        const gestantes = [
            {
                nombre: 'Ana María Pérez García',
                tipo_documento: 'cedula',
                documento: '123456789',
                fecha_nacimiento: '1995-03-15',
                telefono: '3001234567',
                direccion: 'Calle 50 #45-67, Cartagena',
                eps: 'SURA',
                regimen_salud: 'contributivo',
                fecha_ultima_menstruacion: '2024-07-15',
                municipio: 'CARTAGENA DE INDIAS',
                ips: 'Clínica Maternidad Bolívar',
                medico: 'Dr. Carlos Alberto Martínez',
                madrina: null // Sin madrina asignada
            },
            {
                nombre: 'María Fernanda López Torres',
                tipo_documento: 'cedula',
                documento: '987654321',
                fecha_nacimiento: '1992-08-22',
                telefono: '3009876543',
                direccion: 'Carrera 30 #30-40, Cartagena',
                eps: 'COOMEVA',
                regimen_salud: 'subsidiado',
                fecha_ultima_menstruacion: '2024-06-10',
                municipio: 'CARTAGENA DE INDIAS',
                ips: 'Hospital Universitario de Cartagena',
                medico: 'Dra. María Fernanda López',
                madrina: null // Sin madrina asignada
            },
            {
                nombre: 'Patricia Gómez Castro',
                tipo_documento: 'cedula',
                documento: '456789123',
                fecha_nacimiento: '1998-12-05',
                telefono: '3005678901',
                direccion: 'Carrera 25 #15-30, Turbaco',
                eps: 'NUEVA EPS',
                regimen_salud: 'contributivo',
                fecha_ultima_menstruacion: '2024-08-20',
                municipio: 'TURBACO',
                ips: 'IPS Turbaco',
                medico: 'Dra. Patricia Gómez',
                madrina: null // Sin madrina asignada
            },
            {
                nombre: 'Laura Daniela Vargas Sierra',
                tipo_documento: 'cedula',
                documento: '789123456',
                fecha_nacimiento: '1993-05-18',
                telefono: '3002345678',
                direccion: 'Carrera 15 #8-12, Mompox',
                eps: 'SALUD TOTAL',
                regimen_salud: 'contributivo',
                fecha_ultima_menstruacion: '2024-07-25',
                municipio: 'MOMPOX',
                ips: 'IPS Mompox',
                medico: 'Dra. Laura Daniela Vargas',
                madrina: null // Sin madrina asignada
            },
            {
                nombre: 'Sofía Martínez Rodríguez',
                tipo_documento: 'cedula',
                documento: '345678901',
                fecha_nacimiento: '1996-09-30',
                telefono: '3003456789',
                direccion: 'Calle 20 #10-20, San Juan Nepomuceno',
                eps: 'SURA',
                regimen_salud: 'contributivo',
                fecha_ultima_menstruacion: '2024-05-15',
                municipio: 'SAN JUAN NEPOMUCENO',
                ips: 'Hospital San Rafael',
                medico: 'Dra. Sofía Martínez',
                madrina: null // Sin madrina asignada
            }
        ];
        let creadas = 0;
        let yaExisten = 0;
        for (const gestante of gestantes) {
            // Verificar si ya existe
            const existing = await prisma.gestante.findFirst({
                where: { documento: gestante.documento }
            });
            if (!existing) {
                // Buscar el municipio
                const municipio = municipios.find(m => m.nombre === gestante.municipio);
                if (!municipio) {
                    console.log(`⚠️ No se encontró municipio ${gestante.municipio}, omitiendo gestante ${gestante.nombre}`);
                    continue;
                }
                // Buscar la IPS
                const ipsData = ips.find(i => i.nombre === gestante.ips);
                if (!ipsData) {
                    console.log(`⚠️ No se encontró IPS ${gestante.ips}, omitiendo gestante ${gestante.nombre}`);
                    continue;
                }
                // Buscar el médico
                const medico = medicos.find(m => m.nombre === gestante.medico);
                if (!medico) {
                    console.log(`⚠️ No se encontró médico ${gestante.medico}, omitiendo gestante ${gestante.nombre}`);
                    continue;
                }
                // Calcular fecha probable de parto (FUM + 280 días)
                const fum = new Date(gestante.fecha_ultima_menstruacion);
                const fechaProbableParto = new Date(fum.getTime() + (280 * 24 * 60 * 60 * 1000));
                // Crear la gestante
                await prisma.gestante.create({
                    data: {
                        documento: gestante.documento,
                        tipo_documento: gestante.tipo_documento,
                        nombre: gestante.nombre,
                        fecha_nacimiento: new Date(gestante.fecha_nacimiento),
                        telefono: gestante.telefono,
                        direccion: gestante.direccion,
                        municipio_id: municipio.id,
                        ips_asignada_id: ipsData.id,
                        medico_tratante_id: medico.id,
                        eps: gestante.eps,
                        regimen_salud: gestante.regimen_salud,
                        fecha_ultima_menstruacion: fum,
                        fecha_probable_parto: fechaProbableParto,
                        activa: true,
                        fecha_creacion: new Date(),
                        fecha_actualizacion: new Date()
                    }
                });
                console.log(`✅ Creada: ${gestante.nombre} en ${municipio.nombre}`);
                creadas++;
            }
            else {
                console.log(`⚠️ Ya existe: ${gestante.nombre}`);
                yaExisten++;
            }
        }
        console.log('\n📊 Resumen:');
        console.log(`✅ Gestantes creadas: ${creadas}`);
        console.log(`⚠️ Gestantes que ya existían: ${yaExisten}`);
        console.log(`📍 Total gestantes: ${creadas + yaExisten}`);
    }
    catch (error) {
        console.error('❌ Error creando gestantes:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
createGestantesPrueba()
    .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
})
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
});
