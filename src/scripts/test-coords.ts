import * as fs from 'fs';
import * as path from 'path';

async function testCoords() {
  const filePath = path.resolve('C:/Madrinas/genio/Bolivar.txt');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');

  console.log(`Total líneas: ${lines.length}`);

  // Probar líneas con 7 partes
  const sevenPartLines = lines.filter(line => line.split('\t').length === 7);
  console.log(`Líneas con 7 partes: ${sevenPartLines.length}`);

  // Analizar las primeras 5 líneas con 7 partes
  sevenPartLines.slice(0, 5).forEach((line, index) => {
    const parts = line.split('\t');
    console.log(`\n--- Línea ${index + 1} ---`);
    console.log(`Línea completa: "${line}"`);
    
    parts.forEach((part, partIndex) => {
      console.log(`  Parte ${partIndex}: "${part}" (length: ${part.length})`);
    });

    // Probar coordenadas
    const longStr = parts[5].replace(',', '.');
    const latStr = parts[6].replace(',', '.');
    const long = parseFloat(longStr);
    const lat = parseFloat(latStr);
    
    console.log(`Coordenadas: longStr="${longStr}" latStr="${latStr}"`);
    console.log(`Parseadas: long=${long} lat=${lat}`);
    console.log(`Válidas: long<0=${long < 0} lat>0=${lat > 0} !isNaN(long)=${!isNaN(long)} !isNaN(lat)=${!isNaN(lat)}`);
  });
}

testCoords().catch(console.error);
