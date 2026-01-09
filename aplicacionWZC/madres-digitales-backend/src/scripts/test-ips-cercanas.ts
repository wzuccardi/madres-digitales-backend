import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🏥 Probando funcionalidad de IPS cercanas...');
    
    try {
        // Primero, verificar todas las IPS en la base de datos
        const todasLasIPS = await prisma.ips.findMany({
            where: { activa: true },
            select: {
                id: true,
                nombre: true,
                direccion: true,
                coordenadas: true,
                activa: true
            }
        });
        
        console.log(`📊 Total IPS activas: ${todasLasIPS.length}`);
        
        if (todasLasIPS.length > 0) {
            console.log('🏥 Primeras 3 IPS:');
            todasLasIPS.slice(0, 3).forEach((ips, idx) => {
                console.log(`   ${idx + 1}. ${ips.nombre}`);
                console.log(`      Dirección: ${ips.direccion}`);
                console.log(`      Coordenadas: ${ips.coordenadas ? JSON.stringify(ips.coordenadas) : 'Sin coordenadas'}`);
                console.log('');
            });
        }
        
        // Coordenadas de prueba (Centro de Cartagena)
        const latitud = 10.445446959627041;
        const longitud = -75.51771032961585;
        const radioKm = 50;
        
        console.log(`📍 Buscando IPS cerca de [${latitud}, ${longitud}] en radio de ${radioKm}km`);
        
        // Buscar IPS cercanas usando fórmula de Haversine
        const ipsConDistancia = todasLasIPS.map(ips => {
            let ipsLat = 0, ipsLng = 0;
            
            if (ips.coordenadas && typeof ips.coordenadas === 'object') {
                const coords = (ips.coordenadas as any).coordinates;
                if (coords && Array.isArray(coords) && coords.length >= 2) {
                    ipsLng = coords[0]; // Longitud
                    ipsLat = coords[1]; // Latitud
                }
            }
            
            const distancia = calcularDistanciaHaversine(latitud, longitud, ipsLat, ipsLng);
            
            return {
                ...ips,
                latitud: ipsLat,
                longitud: ipsLng,
                distancia_km: distancia
            };
        });
        
        // Filtrar por radio y ordenar por distancia
        const ipsCercanas = ipsConDistancia
            .filter(ips => ips.distancia_km <= radioKm)
            .sort((a, b) => a.distancia_km - b.distancia_km);
        
        console.log(`✅ IPS encontradas dentro del radio: ${ipsCercanas.length}`);
        
        if (ipsCercanas.length > 0) {
            console.log('🎯 IPS cercanas:');
            ipsCercanas.forEach((ips, idx) => {
                console.log(`   ${idx + 1}. ${ips.nombre}`);
                console.log(`      Distancia: ${ips.distancia_km.toFixed(2)} km`);
                console.log(`      Coordenadas: [${ips.latitud}, ${ips.longitud}]`);
                console.log('');
            });
        } else {
            console.log('❌ No se encontraron IPS cercanas');
            console.log('🔍 Verificando coordenadas de las IPS:');
            ipsConDistancia.forEach((ips, idx) => {
                console.log(`   ${idx + 1}. ${ips.nombre}: [${ips.latitud}, ${ips.longitud}] - ${ips.distancia_km.toFixed(2)} km`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Fórmula de Haversine para calcular distancia entre dos puntos
function calcularDistanciaHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en kilómetros
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

main();
