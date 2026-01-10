/**
 * Script para probar el dashboard con diferentes usuarios
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      return {
        token: response.data.token,
        user: response.data.user
      };
    } else {
      throw new Error(response.data.error || 'Login failed');
    }
  } catch (error) {
    console.error(`❌ Error en login para ${email}:`, error.response?.data || error.message);
    return null;
  }
}

async function getDashboardStats(token, userInfo) {
  try {
    const response = await axios.get(`${API_BASE}/dashboard/estadisticas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`\n📊 ESTADÍSTICAS PARA ${userInfo.name || userInfo.nombre || 'Usuario'} (${userInfo.role || userInfo.rol}):`);
    console.log(`   Total Gestantes: ${response.data.total_gestantes || response.data.totalGestantes}`);
    console.log(`   Controles Realizados: ${response.data.controles_realizados || response.data.controlesRealizados}`);
    console.log(`   Alertas Activas: ${response.data.alertas_activas || response.data.alertasActivas}`);
    console.log(`   Gestantes Alto Riesgo: ${response.data.gestantes_alto_riesgo || response.data.gestantesAltoRiesgo}`);
    console.log(`   Total Médicos: ${response.data.total_medicos || response.data.totalMedicos}`);
    console.log(`   Total IPS: ${response.data.total_ips || response.data.totalIps}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error obteniendo estadísticas para ${userInfo.nombre}:`, error.response?.data || error.message);
    return null;
  }
}

async function testDashboard() {
  console.log('🧪 ==========================================');
  console.log('🧪 PROBANDO DASHBOARD CON DIFERENTES USUARIOS');
  console.log('🧪 ==========================================\n');
  
  // Usuarios de prueba
  const usuarios = [
    { email: 'wzuccardi@gmail.com', password: '73102604722', descripcion: 'Super Admin' },
    { email: 'crepu@gmail.com', password: 'password123', descripcion: 'Madrina Crepu' },
    { email: 'yr211088@gmail.com', password: 'password123', descripcion: 'Madrina Yomaira' },
    { email: 'madrina@madresdigitales.com', password: 'password123', descripcion: 'Madrina María' }
  ];
  
  for (const usuario of usuarios) {
    console.log(`\n🔐 Probando login para ${usuario.descripcion} (${usuario.email})...`);
    
    const loginResult = await loginUser(usuario.email, usuario.password);
    
    if (loginResult) {
      console.log(`✅ Login exitoso para ${loginResult.user.name || loginResult.user.nombre || 'Usuario'}`);
      console.log(`   Rol: ${loginResult.user.role || loginResult.user.rol}`);
      console.log(`   ID: ${loginResult.user.id}`);
      
      // Obtener estadísticas del dashboard
      await getDashboardStats(loginResult.token, loginResult.user);
    } else {
      console.log(`❌ Login fallido para ${usuario.email}`);
    }
    
    console.log('\n' + '='.repeat(50));
  }
  
  console.log('\n✅ Pruebas completadas');
}

testDashboard().catch(console.error);