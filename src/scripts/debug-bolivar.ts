import * as fs from 'fs';
import * as path from 'path';

async function debugBolivarFile() {
  console.log('🔍 Debuggeando archivo Bolivar.txt...');

  const filePath = path.resolve('C:/Madrinas/genio/Bolivar.txt');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');

  console.log(`📊 Total líneas en archivo: ${lines.length}`);
  console.log('\n📝 Todas las líneas con detalles:');

  lines.forEach((line, index) => {
    const columns = line.split('\t');
    console.log(`\n${index + 1}: [${columns.length} columnas]`);
    console.log(`   Línea completa: "${line}"`);
    console.log(`   Contiene BOLÍVAR: ${line.includes('BOLÍVAR')}`);
    console.log(`   Contiene Municipio: ${line.includes('Municipio')}`);

    if (columns.length > 0) {
      columns.forEach((col, colIndex) => {
        console.log(`   Col ${colIndex}: "${col}"`);
      });
    }
  });

  // Filtrar líneas válidas
  const validLines = lines.filter(line => {
    const columns = line.split('\t');
    const isValid = columns.length >= 7 && columns[0].trim() === '13';
    return isValid;
  });

  console.log(`\n✅ Líneas válidas encontradas: ${validLines.length}`);
  
  if (validLines.length > 0) {
    console.log('\n📍 Ejemplos de líneas válidas:');
    validLines.slice(0, 3).forEach((line, index) => {
      const columns = line.split('\t');
      console.log(`${index + 1}: ${columns[3]} - Coords: ${columns[5]}, ${columns[6]}`);
    });
  }
}

// Ejecutar
debugBolivarFile()
  .then(() => {
    console.log('\n🎯 Debug completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
