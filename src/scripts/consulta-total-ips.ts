import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Realizando consulta total a la tabla IPS...');
    console.log('📍 Conectando a la base de datos en Vercel...');
    
    try {
        // Consulta total a la tabla IPS
        const ips = await prisma.ips.findMany({
            include: {
                municipios: {
                    select: {
                        nombre: true,
                        departamento: true
                    }
                }
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        console.log(`🏥 Total de IPS encontradas: ${ips.length}`);
        console.log('');

        if (ips.length === 0) {
            console.log('⚠️ No se encontraron IPS en la base de datos');
            return;
        }

        // Mostrar información detallada de cada IPS
        console.log('📋 Detalle de todas las IPS:');
        console.log('=====================================');
        
        ips.forEach((ip, index) => {
            console.log(`${index + 1}. ${ip.nombre}`);
            console.log(`   ID: ${ip.id}`);
            console.log(`   NIT: ${ip.nit || 'No especificado'}`);
            console.log(`   Teléfono: ${ip.telefono || 'No especificado'}`);
            console.log(`   Dirección: ${ip.direccion || 'No especificada'}`);
            console.log(`   Email: ${ip.email || 'No especificado'}`);
            console.log(`   Nivel: ${ip.nivel || 'No especificado'}`);
            console.log(`   Municipio: ${ip.municipios?.nombre || 'No asignado'} (${ip.municipios?.departamento || 'Sin departamento'})`);
            console.log(`   Coordenadas: ${ip.latitud && ip.longitud ? `[${ip.latitud}, ${ip.longitud}]` : 'Sin coordenadas'}`);
            console.log(`   Activa: ${ip.activo ? 'Sí' : 'No'}`);
            console.log(`   Fecha de creación: ${ip.fecha_creacion.toLocaleString('es-CO')}`);
            console.log(`   Última actualización: ${ip.fecha_actualizacion.toLocaleString('es-CO')}`);
            console.log('');
        });

        // Estadísticas adicionales
        console.log('📊 Estadísticas adicionales:');
        console.log('=====================================');
        
        const ipsActivas = ips.filter(ip => ip.activo).length;
        const ipsInactivas = ips.length - ipsActivas;
        const ipsConCoordenadas = ips.filter(ip => ip.latitud && ip.longitud).length;
        const ipsConMunicipio = ips.filter(ip => ip.municipio_id).length;
        
        console.log(`🟢 IPS Activas: ${ipsActivas}`);
        console.log(`🔴 IPS Inactivas: ${ipsInactivas}`);
        console.log(`📍 IPS con coordenadas: ${ipsConCoordenadas}`);
        console.log(`🏘️ IPS con municipio asignado: ${ipsConMunicipio}`);
        
        // Agrupación por nivel
        const porNivel = ips.reduce((acc, ip) => {
            const nivel = ip.nivel || 'Sin nivel';
            acc[nivel] = (acc[nivel] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log('\n📈 Distribución por nivel:');
        Object.entries(porNivel).forEach(([nivel, count]) => {
            console.log(`   ${nivel}: ${count}`);
        });
        
        // Agrupación por departamento
        const porDepartamento = ips.reduce((acc, ip) => {
            const depto = ip.municipios?.departamento || 'Sin departamento';
            acc[depto] = (acc[depto] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log('\n🗺️ Distribución por departamento:');
        Object.entries(porDepartamento).forEach(([depto, count]) => {
            console.log(`   ${depto}: ${count}`);
        });

    } catch (error) {
        console.error('❌ Error al consultar la tabla IPS:', error);
        
        // Análisis de posibles errores
        if (error instanceof Error) {
            if (error.message.includes('relation "ips" does not exist')) {
                console.log('🔍 Posible causa: La tabla "ips" no existe en la base de datos');
                console.log('💡 Solución: Ejecutar migraciones de Prisma con "npx prisma migrate dev"');
            } else if (error.message.includes('connection')) {
                console.log('🔍 Posible causa: Problema de conexión a la base de datos');
                console.log('💡 Solución: Verificar la variable DATABASE_URL en el archivo .env');
            } else if (error.message.includes('permission')) {
                console.log('🔍 Posible causa: Problemas de permisos en la base de datos');
                console.log('💡 Solución: Verificar que el usuario tenga permisos de lectura');
            }
        }
    } finally {
        await prisma.$disconnect();
        console.log('🔚 Conexión a la base de datos cerrada');
    }
}

main();