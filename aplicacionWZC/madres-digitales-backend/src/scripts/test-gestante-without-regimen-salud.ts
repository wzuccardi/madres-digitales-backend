import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

async function testGestanteCreationWithoutRegimenSalud() {
  try {
    console.log('🚀 Testing gestante creation without regimen_salud field...');

    // Login as super admin
    console.log('🔑 Logging in as super admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'wzuccardi@gmail.com',
      password: '73102604722'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Get valid IDs
    console.log('📋 Getting valid IDs...');
    const municipiosResponse = await axios.get(`${API_BASE_URL}/municipios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const municipios = municipiosResponse.data.data;
    const firstMunicipio = municipios[0];

    const ipsResponse = await axios.get(`${API_BASE_URL}/ips`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const ips = ipsResponse.data.data;
    const firstIps = ips[0];

    const madrinasResponse = await axios.get(`${API_BASE_URL}/usuarios?rol=madrina`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const madrinas = madrinasResponse.data.data;
    const firstMadrina = madrinas[0];

    console.log('✅ Got valid IDs');

    // Create gestante WITHOUT regimen_salud field
    console.log('🤰 Creating gestante without regimen_salud field...');
    const gestanteData = {
      documento: '9876543210',
      nombre: 'Test Gestante',
      apellido: 'Sin Regimen',
      email: 'test.sin.regimen@example.com',
      telefono: '3009876543',
      direccion: 'Calle Test # 123',
      fecha_nacimiento: '1990-05-20',
      fecha_probable_parto: '2024-08-20',
      semanas_gestacion: 25,
      municipio_id: firstMunicipio.id,
      ips_asignada_id: firstIps.id,
      madrina_id: firstMadrina.id,
      activa: true,
      riesgo_alto: false
      // Note: NO regimen_salud field provided
    };

    console.log('📄 Request data (without regimen_salud):', gestanteData);

    const response = await axios.post(`${API_BASE_URL}/gestantes`, gestanteData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Gestante created successfully!');
    console.log('📝 Response:', response.data);
    
    if (response.data.success) {
      console.log('🎉 SUCCESS: Default regimen_salud value is working!');
    }

  } catch (error: any) {
    console.error('❌ Error creating gestante:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.error('📊 Response data:', error.response.data);
    }
  }
}

// Run the test
testGestanteCreationWithoutRegimenSalud();