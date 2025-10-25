"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function debugFlutterLogin() {
    console.log('🔍 Debug: Verificando login para Flutter...');
    try {
        // 1. Probar login
        console.log('🔐 1. Probando login...');
        const loginResponse = await axios_1.default.post('http://localhost:3008/api/auth/login', {
            email: 'wzuccardi@gmail.com',
            password: '73102604722'
        });
        console.log('✅ Login response:', JSON.stringify(loginResponse.data, null, 2));
    }
    catch (error) {
        console.log('❌ Error en login Flutter:', error.response?.data || error.message);
        // Probar con el backend directo
        console.log('\n🔄 Probando con backend directo...');
        try {
            const backendLogin = await axios_1.default.post('http://localhost:3000/api/auth/login', {
                email: 'wzuccardi@gmail.com',
                password: '73102604722'
            });
            console.log('✅ Backend login exitoso:', JSON.stringify(backendLogin.data, null, 2));
        }
        catch (backendError) {
            console.log('❌ Error en backend:', backendError.response?.data || backendError.message);
        }
    }
}
debugFlutterLogin();
