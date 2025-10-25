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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
