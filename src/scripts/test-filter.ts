import * as fs from 'fs';
import * as path from 'path';

async function testFilter() {
  const filePath = path.resolve('C:/Madrinas/genio/Bolivar.txt');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');

  console.log(`Total líneas: ${lines.length}`);

  // Probar diferentes filtros
  console.log('\n🧪 Probando filtros:');

  // Filtro 1: Líneas con 7 partes
  const filter1 = lines.filter(line => line.split('\t').length === 7);
  console.log(`Filtro 1 (7 partes): ${filter1.length} líneas`);

  // Filtro 2: Líneas que empiecen con 13
  const filter2 = lines.filter(line => {
    const parts = line.split('\t');
    return parts[0] && parts[0].trim() === '13';
  });
  console.log(`Filtro 2 (empiezan con 13): ${filter2.length} líneas`);

  // Filtro 3: Líneas que contengan BOL
  const filter3 = lines.filter(line => line.includes('BOL'));
  console.log(`Filtro 3 (contienen BOL): ${filter3.length} líneas`);

  // Filtro 4: Líneas que contengan Municipio
  const filter4 = lines.filter(line => line.includes('Municipio'));
  console.log(`Filtro 4 (contienen Municipio): ${filter4.length} líneas`);

  // Filtro combinado
  const filterCombined = lines.filter(line => {
    const parts = line.split('\t');
    const hasSevenParts = parts.length === 7;
    const startsWithThirteen = parts[0] && parts[0].trim() === '13';
    const containsBol = parts[1] && parts[1].includes('BOL');
    const containsMunicipio = parts[4] && parts[4].trim() === 'Municipio';
    
    console.log(`Línea: "${line.substring(0, 50)}..." - 7 partes: ${hasSevenParts}, 13: ${startsWithThirteen}, BOL: ${containsBol}, Municipio: ${containsMunicipio}`);
    
    return hasSevenParts && startsWithThirteen && containsBol && containsMunicipio;
  });
  
  console.log(`\nFiltro combinado: ${filterCombined.length} líneas válidas`);

  if (filterCombined.length > 0) {
    console.log('\n✅ Ejemplo de línea válida:');
    const example = filterCombined[0];
    const parts = example.split('\t');
    parts.forEach((part, index) => {
      console.log(`  Parte ${index}: "${part}"`);
    });
  }
}

testFilter().catch(console.error);
