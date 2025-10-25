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
