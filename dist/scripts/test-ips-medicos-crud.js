"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Script para probar los endpoints CRUD de IPS y Médicos
const ips_crud_service_1 = __importDefault(require("../services/ips-crud.service"));
const medico_crud_service_1 = __importDefault(require("../services/medico-crud.service"));
async function testIpsCrud() {
    console.log('\n🧪 ========== TESTING IPS CRUD ==========\n');
    try {
        // 1. Obtener todas las IPS
        console.log('1️⃣  Testing getAllIps...');
        const allIps = await ips_crud_service_1.default.getAllIps();
        console.log(`✅ Found ${allIps.length} IPS total`);
        if (allIps.length > 0) {
            console.log(`   First IPS: ${allIps[0].nombre}`);
        }
        console.log('');
        // 2. Obtener IPS activas
        console.log('2️⃣  Testing getActiveIps...');
        const activeIps = await ips_crud_service_1.default.getActiveIps();
        console.log(`✅ Found ${activeIps.length} active IPS`);
        console.log('');
        // 3. Buscar IPS por nombre
        if (allIps.length > 0) {
            const searchTerm = allIps[0].nombre.substring(0, 5);
            console.log(`3️⃣  Testing searchIpsByName with term: "${searchTerm}"...`);
            const searchResults = await ips_crud_service_1.default.searchIpsByName(searchTerm);
            console.log(`✅ Found ${searchResults.length} IPS matching search`);
            console.log('');
        }
        // 4. Crear nueva IPS (ejemplo)
        console.log('4️⃣  Testing createIps...');
        const newIpsData = {
            codigo_habilitacion: 'TEST-001',
            nombre: 'IPS Test Automatizado',
            direccion: 'Calle Test 123',
            nivel_atencion: 'primario',
            telefono: '3001234567',
            email: 'test@ips.com',
            coordenadas: {
                type: 'Point',
                coordinates: [-75.5, 10.4]
            }
        };
        const newIps = await ips_crud_service_1.default.createIps(newIpsData);
        console.log(`✅ IPS created: ${newIps.nombre} (ID: ${newIps.id})`);
        console.log('');
        // 5. Actualizar IPS
        console.log('5️⃣  Testing updateIps...');
        const updatedIps = await ips_crud_service_1.default.updateIps(newIps.id, {
            telefono: '3009876543'
        });
        console.log(`✅ IPS updated: ${updatedIps.nombre} - New phone: ${updatedIps.telefono}`);
        console.log('');
        // 6. Obtener IPS por ID
        console.log('6️⃣  Testing getIpsById...');
        const ipsById = await ips_crud_service_1.default.getIpsById(newIps.id);
        console.log(`✅ IPS found: ${ipsById.nombre}`);
        console.log('');
        // 7. Eliminar IPS (soft delete)
        console.log('7️⃣  Testing deleteIps...');
        const deletedIps = await ips_crud_service_1.default.deleteIps(newIps.id);
        console.log(`✅ IPS deleted (soft): ${deletedIps.nombre} - Active: ${deletedIps.activa}`);
        console.log('');
        console.log('🎉 All IPS CRUD tests passed!\n');
        return newIps.id; // Return ID for cleanup
    }
    catch (error) {
        console.error('❌ Error testing IPS CRUD:', error);
        throw error;
    }
}
async function testMedicosCrud() {
    console.log('\n🧪 ========== TESTING MEDICOS CRUD ==========\n');
    try {
        // 1. Obtener todos los médicos
        console.log('1️⃣  Testing getAllMedicos...');
        const allMedicos = await medico_crud_service_1.default.getAllMedicos();
        console.log(`✅ Found ${allMedicos.length} medicos total`);
        if (allMedicos.length > 0) {
            console.log(`   First medico: ${allMedicos[0].nombre}`);
        }
        console.log('');
        // 2. Obtener médicos activos
        console.log('2️⃣  Testing getActiveMedicos...');
        const activeMedicos = await medico_crud_service_1.default.getActiveMedicos();
        console.log(`✅ Found ${activeMedicos.length} active medicos`);
        console.log('');
        // 3. Buscar médicos por nombre
        if (allMedicos.length > 0) {
            const searchTerm = allMedicos[0].nombre.substring(0, 5);
            console.log(`3️⃣  Testing searchMedicosByName with term: "${searchTerm}"...`);
            const searchResults = await medico_crud_service_1.default.searchMedicosByName(searchTerm);
            console.log(`✅ Found ${searchResults.length} medicos matching search`);
            console.log('');
        }
        // 4. Crear nuevo médico (ejemplo)
        console.log('4️⃣  Testing createMedico...');
        const newMedicoData = {
            nombre: 'Dr. Test Automatizado',
            documento: 'TEST-DOC-001',
            registro_medico: 'RM-TEST-001',
            especialidad: 'Ginecología',
            telefono: '3001234567',
            email: 'test@medico.com'
        };
        const newMedico = await medico_crud_service_1.default.createMedico(newMedicoData);
        console.log(`✅ Medico created: ${newMedico.nombre} (ID: ${newMedico.id})`);
        console.log('');
        // 5. Actualizar médico
        console.log('5️⃣  Testing updateMedico...');
        const updatedMedico = await medico_crud_service_1.default.updateMedico(newMedico.id, {
            telefono: '3009876543',
            especialidad: 'Obstetricia'
        });
        console.log(`✅ Medico updated: ${updatedMedico.nombre} - New especialidad: ${updatedMedico.especialidad}`);
        console.log('');
        // 6. Obtener médico por ID
        console.log('6️⃣  Testing getMedicoById...');
        const medicoById = await medico_crud_service_1.default.getMedicoById(newMedico.id);
        console.log(`✅ Medico found: ${medicoById.nombre}`);
        console.log('');
        // 7. Eliminar médico (soft delete)
        console.log('7️⃣  Testing deleteMedico...');
        const deletedMedico = await medico_crud_service_1.default.deleteMedico(newMedico.id);
        console.log(`✅ Medico deleted (soft): ${deletedMedico.nombre} - Active: ${deletedMedico.activo}`);
        console.log('');
        console.log('🎉 All Medicos CRUD tests passed!\n');
        return newMedico.id; // Return ID for cleanup
    }
    catch (error) {
        console.error('❌ Error testing Medicos CRUD:', error);
        throw error;
    }
}
async function runAllTests() {
    console.log('\n🚀 Starting CRUD tests for IPS and Medicos...\n');
    try {
        // Test IPS CRUD
        const ipsId = await testIpsCrud();
        // Test Medicos CRUD
        const medicoId = await testMedicosCrud();
        console.log('\n✅ ========== ALL TESTS COMPLETED SUCCESSFULLY ==========\n');
        console.log(`Created and tested IPS ID: ${ipsId}`);
        console.log(`Created and tested Medico ID: ${medicoId}`);
        console.log('\nNote: Test records were soft-deleted (activo/activa = false)');
        console.log('You can manually delete them from the database if needed.\n');
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ ========== TESTS FAILED ==========\n');
        console.error(error);
        process.exit(1);
    }
}
// Run tests
runAllTests();
