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
