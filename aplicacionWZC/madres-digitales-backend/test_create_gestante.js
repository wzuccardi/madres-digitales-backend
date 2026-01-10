// Script de prueba para crear gestante
const axios = require('axios');

const API_URL = 'https://madres-digitales-backend.vercel.app/api/gestantes';
// const API_URL = 'http://localhost:3000/api/gestantes';

const testData = {
  nombre: 'Test',
  apellido: 'Usuario',
  documento: '1234567890',
  tipo_documento: 'CC',
  fecha_nacimiento: '1995-01-01T00:00:00.000Z',
  telefono: '3001234567',
  direccion: 'Calle Test 123',
  eps: 'SURA',
  regimen_salud: 'Subsidiado',
  grupo_sanguineo: 'O+',
  barrio: 'Centro',
  riesgo_alto: false
};

async function testCreateGestante() {
  try {
    console.log('📤 Enviando datos:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(API_URL, testData, {
      headers: {
        'Content-Type': 'application/json',
        // Agregar token si es necesario
        // 'Authorization': 'Bearer YOUR_TOKEN'
      }
    });
    
    console.log('✅ Respuesta exitosa:', response.status);
    console.log('📥 Datos recibidos:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.status);
    console.error('📥 Respuesta de error:', JSON.stringify(error.response?.data, null, 2));
    console.error('📥 Headers:', JSON.stringify(error.response?.headers, null, 2));
  }
}

testCreateGestante();
