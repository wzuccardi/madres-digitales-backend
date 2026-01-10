import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🏥 Agregando coordenadas a IPS existentes...');
    
    try {
        // Obtener todas las IPS
        const ipsExistentes = await prisma.iPS.findMany();

        console.log(`📍 Encontradas ${ipsExistentes.length} IPS para actualizar`);

        // Coordenadas de diferentes zonas de Cartagena y Bolívar
        const coordenadasCartagena = [
            { lat: 10.4562688, lng: -75.5171328 }, // Centro Histórico
            { lat: 10.4500000, lng: -75.5100000 }, // Bocagrande
            { lat: 10.4200000, lng: -75.5300000 }, // Manga
            { lat: 10.4800000, lng: -75.5000000 }, // Getsemaní
            { lat: 10.4400000, lng: -75.5400000 }, // San Diego
            { lat: 10.4600000, lng: -75.4900000 }, // Castillogrande
            { lat: 10.4300000, lng: -75.5200000 }, // Centro
            { lat: 10.4700000, lng: -75.5300000 }, // La Matuna
        ];

        // Actualizar cada IPS con coordenadas
        for (let i = 0; i < ipsExistentes.length; i++) {
            const ips = ipsExistentes[i];
            const coordenada = coordenadasCartagena[i % coordenadasCartagena.length];
            
            // Agregar pequeña variación para que no estén exactamente en el mismo punto
            const latVariacion = (Math.random() - 0.5) * 0.01; // ±0.005 grados (~500m)
            const lngVariacion = (Math.random() - 0.5) * 0.01;
            
            const coordenadasFinales = {
                type: 'Point',
                coordinates: [
                    coordenada.lng + lngVariacion,
                    coordenada.lat + latVariacion
                ]
            };

            await prisma.iPS.update({
                where: { id: ips.id },
                data: {
                    latitud: coordenadasFinales.coordinates[1],
                    longitud: coordenadasFinales.coordinates[0]
                }
            });

            console.log(`✅ IPS "${ips.nombre}" actualizada con coordenadas [${coordenadasFinales.coordinates[1].toFixed(6)}, ${coordenadasFinales.coordinates[0].toFixed(6)}]`);
        }

        // Verificar resultados
        const ipsConCoordenadas = await prisma.iPS.count({
            where: {
                latitud: {
                    not: null
                },
                longitud: {
                    not: null
                }
            }
        });

        console.log(`📊 Total IPS con coordenadas: ${ipsConCoordenadas}`);
        console.log('🎉 ¡Coordenadas agregadas exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
