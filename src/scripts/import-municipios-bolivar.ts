import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MunicipioData {
  codigoDepartamento: string;
  nombreDepartamento: string;
  codigoMunicipio: string;
  nombreMunicipio: string;
  tipo: string;
  longitud: number;
  latitud: number;
}

async function importMunicipiosBolivar() {
  try {
    console.log('🏛️ Iniciando importación de municipios de Bolívar...');

    // Leer archivo de municipios - usar ruta absoluta desde C:\Madrinas
    const filePath = path.resolve('C:/Madrinas/genio/Bolivar.txt');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    console.log(`📊 Total líneas en archivo: ${lines.length}`);

    // Filtrar líneas que contengan datos válidos
    // Usar un filtro más flexible: 7 partes y que las coordenadas sean números válidos
    const dataLines = lines.filter(line => {
      const parts = line.split('\t');
      if (parts.length !== 7) return false;

      // Limpiar y verificar que las últimas dos partes sean coordenadas válidas
      const longStr = parts[5].replace(',', '.').replace(/[^\d.-]/g, ''); // Remover caracteres no numéricos
      const latStr = parts[6].replace(',', '.').replace(/[^\d.-]/g, ''); // Remover caracteres no numéricos
      const long = parseFloat(longStr);
      const lat = parseFloat(latStr);

      return !isNaN(long) && !isNaN(lat) && long < 0 && lat > 0; // Colombia tiene longitud negativa y latitud positiva
    });

    console.log(`📊 Procesando ${dataLines.length} municipios válidos de Bolívar...`);

    const municipios: MunicipioData[] = [];

    for (const line of dataLines) {
      if (line.trim() === '') continue;

      // Parsear línea separada por TAB: 13 BOL�VAR 13001 CARTAGENA DE INDIAS Municipio -75,496269 10,385126
      const parts = line.split('\t').map(part => part.trim());

      if (parts.length === 7) {
        const codigoDepartamento = parts[0]; // 13
        const nombreDepartamento = 'BOLÍVAR'; // Normalizar
        const codigoMunicipio = parts[2]; // 13001
        const nombreMunicipio = parts[3]; // CARTAGENA DE INDIAS
        const tipo = parts[4]; // Municipio
        const longitud = parseFloat(parts[5].replace(',', '.').replace(/[^\d.-]/g, '')); // Limpiar caracteres especiales
        const latitud = parseFloat(parts[6].replace(',', '.').replace(/[^\d.-]/g, '')); // Limpiar caracteres especiales

        console.log(`📍 ${nombreMunicipio} (${codigoMunicipio}) - Coords: ${longitud}, ${latitud}`);

        if (!isNaN(longitud) && !isNaN(latitud)) {
          municipios.push({
            codigoDepartamento,
            nombreDepartamento,
            codigoMunicipio,
            nombreMunicipio,
            tipo,
            longitud,
            latitud,
          });
        } else {
          console.warn(`⚠️ Coordenadas inválidas para ${nombreMunicipio}: ${parts[5]}, ${parts[6]}`);
        }
      } else {
        console.warn(`⚠️ Línea con formato incorrecto: ${line}`);
      }
    }

    console.log(`✅ Parseados ${municipios.length} municipios válidos`);

    // Insertar o actualizar municipios en la base de datos
    let insertados = 0;
    let actualizados = 0;

    for (const municipio of municipios) {
      try {
        // Crear objeto GeoJSON Point para las coordenadas
        const coordenadas = {
          type: 'Point',
          coordinates: [municipio.longitud, municipio.latitud], // GeoJSON usa [lon, lat]
        };

        // Verificar si el municipio ya existe
        const existingMunicipio = await prisma.municipio.findFirst({
          where: {
            codigo_dane: municipio.codigoMunicipio,
          },
        });

        if (existingMunicipio) {
          // Actualizar municipio existente
          await prisma.municipio.update({
            where: { id: existingMunicipio.id },
            data: {
              nombre: municipio.nombreMunicipio,
              departamento: municipio.nombreDepartamento,
              coordenadas: coordenadas as any,
              updated_at: new Date(),
            },
          });
          actualizados++;
          console.log(`🔄 Actualizado: ${municipio.nombreMunicipio}`);
        } else {
          // Crear nuevo municipio
          await prisma.municipio.create({
            data: {
              codigo_dane: municipio.codigoMunicipio,
              nombre: municipio.nombreMunicipio,
              departamento: municipio.nombreDepartamento,
              coordenadas: coordenadas as any,
              activo: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          insertados++;
          console.log(`➕ Insertado: ${municipio.nombreMunicipio}`);
        }
      } catch (error) {
        console.error(`❌ Error procesando ${municipio.nombreMunicipio}:`, error);
      }
    }

    console.log('\n📈 Resumen de importación:');
    console.log(`✅ Municipios insertados: ${insertados}`);
    console.log(`🔄 Municipios actualizados: ${actualizados}`);
    console.log(`📊 Total procesados: ${insertados + actualizados}`);

    // Verificar total de municipios en la base de datos
    const totalMunicipios = await prisma.municipio.count({
      where: {
        departamento: 'BOLÍVAR',
      },
    });

    console.log(`🏛️ Total de municipios de Bolívar en BD: ${totalMunicipios}`);

    // Mostrar algunos ejemplos
    console.log('\n📍 Ejemplos de municipios importados:');
    const ejemplos = await prisma.municipio.findMany({
      where: {
        departamento: 'BOLÍVAR',
      },
      take: 5,
      orderBy: {
        nombre: 'asc',
      },
    });

    ejemplos.forEach((municipio, index) => {
      const coords = municipio.coordenadas as any;
      console.log(`${index + 1}. ${municipio.nombre} (${municipio.codigo_dane}) - ${coords?.coordinates?.[1]}, ${coords?.coordinates?.[0]}`);
    });

  } catch (error) {
    console.error('❌ Error en importación de municipios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función para validar coordenadas
function validateCoordinates(lat: number, lon: number): boolean {
  // Validar que las coordenadas estén dentro de los límites de Colombia
  // Colombia aproximadamente: Latitud 12.5°N a -4.2°S, Longitud -66.8°W a -81.7°W
  return (
    lat >= -4.2 && lat <= 12.5 &&
    lon >= -81.7 && lon <= -66.8
  );
}

// Función para limpiar municipios duplicados
async function cleanupDuplicateMunicipios() {
  try {
    console.log('🧹 Limpiando municipios duplicados...');

    const duplicates = await prisma.municipio.groupBy({
      by: ['codigo_dane'],
      having: {
        codigo_dane: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    for (const duplicate of duplicates) {
      const municipios = await prisma.municipio.findMany({
        where: {
          codigo_dane: duplicate.codigo_dane,
        },
        orderBy: {
          created_at: 'asc',
        },
      });

      // Mantener el primero, eliminar los demás
      const toKeep = municipios[0];
      const toDelete = municipios.slice(1);

      for (const municipio of toDelete) {
        await prisma.municipio.delete({
          where: { id: municipio.id },
        });
        console.log(`🗑️ Eliminado duplicado: ${municipio.nombre} (${municipio.id})`);
      }

      console.log(`✅ Mantenido: ${toKeep.nombre} (${toKeep.id})`);
    }

    console.log(`🧹 Limpieza completada. ${duplicates.length} códigos duplicados procesados.`);
  } catch (error) {
    console.error('❌ Error limpiando duplicados:', error);
  }
}

// Función para generar estadísticas
async function generateStats() {
  try {
    console.log('\n📊 Generando estadísticas...');

    const stats = await prisma.municipio.groupBy({
      by: ['departamento', 'activo'],
      _count: {
        id: true,
      },
    });

    console.log('\n📈 Estadísticas por departamento y estado:');
    stats.forEach(stat => {
      console.log(`${stat.departamento} - ${stat.activo ? 'Activos' : 'Inactivos'}: ${stat._count.id}`);
    });

    const totalActivos = await prisma.municipio.count({
      where: { activo: true },
    });

    const totalInactivos = await prisma.municipio.count({
      where: { activo: false },
    });

    console.log(`\n📊 Resumen general:`);
    console.log(`✅ Total municipios activos: ${totalActivos}`);
    console.log(`❌ Total municipios inactivos: ${totalInactivos}`);
    console.log(`📍 Total municipios: ${totalActivos + totalInactivos}`);

  } catch (error) {
    console.error('❌ Error generando estadísticas:', error);
  }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
  (async () => {
    try {
      await importMunicipiosBolivar();
      await cleanupDuplicateMunicipios();
      await generateStats();
      console.log('\n🎉 Importación completada exitosamente!');
      process.exit(0);
    } catch (error) {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    }
  })();
}

export { importMunicipiosBolivar, cleanupDuplicateMunicipios, generateStats };
