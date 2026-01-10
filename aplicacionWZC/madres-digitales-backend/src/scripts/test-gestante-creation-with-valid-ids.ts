import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Credenciales de super admin
const SUPER_ADMIN_CREDENTIALS = {
  email: 'wzuccardi@gmail.com',
  password: '73102604722'
};

async function loginAndGetToken() {
  try {
    console.log('🔑 Iniciando sesión como super admin...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, SUPER_ADMIN_CREDENTIALS);
    
    console.log('✅ Login exitoso');
    console.log('📝 Usuario:', response.data.data.usuario);
    console.log('🎯 Rol:', response.data.data.usuario.rol);
    
    return response.data.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function getMunicipios(token: string) {
  try {
    console.log('\n🏛️ Obteniendo municipios...');
    const response = await axios.get(`${API_BASE_URL}/municipios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Response structure:', Object.keys(response.data));
    console.log('📊 Response data type:', typeof response.data);
    
    // Handle different response structures
    let municipiosData = response.data;
    if (response.data.data) {
      municipiosData = response.data.data;
    } else if (response.data.municipios) {
      municipiosData = response.data.municipios;
    }
    
    console.log(`✅ Encontrados ${municipiosData.length} municipios`);
    
    if (municipiosData.length > 0) {
      console.log('📍 Primeros 3 municipios:');
      municipiosData.slice(0, 3).forEach((municipio: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${municipio.id}, Nombre: ${municipio.nombre}, Departamento: ${municipio.departamento}`);
      });
      
      return municipiosData.map((m: any) => ({ id: m.id, nombre: m.nombre }));
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error obteniendo municipios:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('📨 Headers:', error.response?.headers);
    throw error;
  }
}

async function getIPS(token: string) {
  try {
    console.log('\n🏥 Obteniendo IPS...');
    const response = await axios.get(`${API_BASE_URL}/ips`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 IPS Response structure:', Object.keys(response.data));
    console.log('📊 IPS Response data type:', typeof response.data);
    
    // Handle different response structures
    let ipsData = response.data;
    if (response.data.data) {
      ipsData = response.data.data;
    } else if (response.data.ips) {
      ipsData = response.data.ips;
    }
    
    console.log(`✅ Encontradas ${ipsData.length} IPS`);
    
    if (ipsData.length > 0) {
      console.log('📋 Primeras 3 IPS:');
      ipsData.slice(0, 3).forEach((ips: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${ips.id}, Nombre: ${ips.nombre}, Municipio ID: ${ips.municipio_id}`);
      });
      
      return ipsData.map((i: any) => ({ id: i.id, nombre: i.nombre, municipio_id: i.municipio_id }));
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error obteniendo IPS:', error.response?.data || error.message);
    throw error;
  }
}

async function getMadrinas(token: string) {
  try {
    console.log('\n👩‍⚕️ Obteniendo madrinas...');
    const response = await axios.get(`${API_BASE_URL}/usuarios/madrinas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Encontradas ${response.data.length} madrinas`);
    
    if (response.data.length > 0) {
      console.log('👥 Primeras 3 madrinas:');
      response.data.slice(0, 3).forEach((madrina: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${madrina.id}, Nombre: ${madrina.nombre}, Email: ${madrina.email}`);
      });
      
      return response.data.map((m: any) => ({ id: m.id, nombre: m.nombre }));
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Error obteniendo madrinas:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('📨 Headers:', error.response?.headers);
    
    // Intentar con endpoint alternativo si el primero falla
    if (error.response?.status === 404) {
      console.log('🔄 Intentando con endpoint alternativo...');
      try {
        const altResponse = await axios.get(`${API_BASE_URL}/usuarios?rol=madrina`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📊 Alt Response structure:', Object.keys(altResponse.data));
        console.log('📊 Alt Response data type:', typeof altResponse.data);
        
        // Handle different response structures for alternative endpoint
        let madrinasData = altResponse.data;
        if (altResponse.data.data) {
          madrinasData = altResponse.data.data;
        } else if (altResponse.data.usuarios) {
          madrinasData = altResponse.data.usuarios;
        }
        
        console.log(`✅ Encontradas ${madrinasData.length} madrinas (alternativo)`);
        return madrinasData.map((m: any) => ({ id: m.id, nombre: m.nombre }));
      } catch (altError: any) {
        console.error('❌ Error en endpoint alternativo:', altError.response?.data || altError.message);
        throw altError;
      }
    }
    
    throw error;
  }
}

async function createGestante(token: string, gestanteData: any) {
  try {
    console.log('\n🤰 Creando gestante con datos:');
    console.log('📄 Datos:', JSON.stringify(gestanteData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/gestantes`, gestanteData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Gestante creado exitosamente');
    console.log('📝 Gestante creado:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creando gestante:');
    console.error('📊 Status:', error.response?.status);
    console.error('📄 Response data:', error.response?.data);
    console.error('📨 Request data:', gestanteData);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando prueba de creación de gestante con IDs válidos...\n');
    
    // 1. Login y obtener token
    const token = await loginAndGetToken();
    
    // 2. Obtener datos necesarios
    const municipios = await getMunicipios(token);
    const ips = await getIPS(token);
    const madrinas = await getMadrinas(token);
    
    // 3. Verificar que tenemos datos suficientes
    if (municipios.length === 0) {
      throw new Error('No hay municipios disponibles');
    }
    if (ips.length === 0) {
      throw new Error('No hay IPS disponibles');
    }
    if (madrinas.length === 0) {
      throw new Error('No hay madrinas disponibles');
    }
    
    // 4. Encontrar IPS que tenga el mismo municipio que una madrina
    let validMunicipioId = null;
    let validIpsId = null;
    let validMadrinaId = null;
    
    for (const municipio of municipios) {
      const ipsInMunicipio = ips.filter(i => i.municipio_id === municipio.id);
      if (ipsInMunicipio.length > 0 && madrinas.length > 0) {
        validMunicipioId = municipio.id;
        validIpsId = ipsInMunicipio[0].id;
        validMadrinaId = madrinas[0].id;
        break;
      }
    }
    
    if (!validMunicipioId) {
      // Usar primeros disponibles si no hay coincidencia
      validMunicipioId = municipios[0].id;
      validIpsId = ips[0].id;
      validMadrinaId = madrinas[0].id;
      console.log('⚠️  No se encontró coincidencia perfecta, usando primeros disponibles');
    }
    
    console.log(`\n✅ IDs seleccionados:`);
    console.log(`🏛️  Municipio ID: ${validMunicipioId}`);
    console.log(`🏥 IPS ID: ${validIpsId}`);
    console.log(`👩‍⚕️ Madrina ID: ${validMadrinaId}`);
    
    // 5. Crear gestante con IDs válidos
    const gestanteData = {
      documento: '1234567890',
      nombre: 'Gestante de Prueba',
      apellido: 'Apellido Prueba',
      email: 'gestante.prueba@example.com',
      telefono: '3001234567',
      direccion: 'Calle 123 # 45-67',
      fecha_nacimiento: '1995-01-15',
      fecha_probable_parto: '2024-06-15',
      semanas_gestacion: 20,
      municipio_id: validMunicipioId,
      ips_asignada_id: validIpsId,
      madrina_id: validMadrinaId,
      activa: true,
      riesgo_alto: false,
      regimen_salud: 'subsidiado'
    };
    
    await createGestante(token, gestanteData);
    
    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('\n💥 Error en la prueba:', error);
    process.exit(1);
  }
}

main();