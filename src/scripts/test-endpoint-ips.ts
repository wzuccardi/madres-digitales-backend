import axios from 'axios';

async function testIPSEndpoint() {
    console.log('🧪 Probando endpoint de IPS cercanas...');
    
    try {
        // 1. Login
        console.log('🔐 Haciendo login...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@demo.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login exitoso');
        
        // 2. Probar endpoint de IPS cercanas
        console.log('🏥 Probando endpoint de IPS cercanas...');
        const ipsResponse = await axios.get('http://localhost:3000/api/ips/cercanas', {
            params: {
                latitud: 10.445446959627041,
                longitud: -75.51771032961585,
                radio: 50
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📊 Respuesta del endpoint:');
        console.log(JSON.stringify(ipsResponse.data, null, 2));
        
        if (ipsResponse.data.total_encontradas > 0) {
            console.log('✅ ¡Endpoint funcionando correctamente!');
            console.log(`🎯 Se encontraron ${ipsResponse.data.total_encontradas} IPS cercanas`);
        } else {
            console.log('❌ No se encontraron IPS cercanas');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testIPSEndpoint();
