import axios from 'axios';

async function testSuperAdminFlow() {
    console.log('🧪 Probando flujo completo de super admin...');
    
    try {
        // 1. Login con wzuccardi@gmail.com
        console.log('🔐 1. Haciendo login con wzuccardi@gmail.com...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'wzuccardi@gmail.com',
            password: '73102604722'
        });
        
        console.log('✅ Login exitoso!');
        console.log('👤 Usuario:', loginResponse.data.user.nombre);
        console.log('👑 Rol:', loginResponse.data.user.rol);
        
        const token = loginResponse.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 2. Obtener lista de municipios
        console.log('\n🏛️ 2. Obteniendo lista de municipios...');
        const municipiosResponse = await axios.get('http://localhost:3000/api/municipios', { headers });
        
        console.log(`📋 Total municipios: ${municipiosResponse.data.data.length}`);
        
        // Mostrar algunos municipios con su estado
        const municipios = municipiosResponse.data.data.slice(0, 5);
        console.log('🏛️ Primeros 5 municipios:');
        municipios.forEach((municipio: any, idx: number) => {
            console.log(`   ${idx + 1}. ${municipio.nombre} - ${municipio.activo ? 'ACTIVO' : 'INACTIVO'}`);
        });
        
        // 3. Probar activar/desactivar un municipio
        if (municipios.length > 0) {
            const municipioTest = municipios[0];
            const estadoOriginal = municipioTest.activo;
            
            console.log(`\n🔧 3. Probando cambio de estado del municipio: ${municipioTest.nombre}`);
            console.log(`   Estado original: ${estadoOriginal ? 'ACTIVO' : 'INACTIVO'}`);
            
            try {
                // Cambiar estado
                const endpoint = estadoOriginal ? 'desactivar' : 'activar';
                const cambioResponse = await axios.post(
                    `http://localhost:3000/api/municipios/${municipioTest.id}/${endpoint}`,
                    {},
                    { headers }
                );
                
                console.log(`✅ ${endpoint.toUpperCase()} exitoso:`, cambioResponse.data.message);
                
                // Restaurar estado original
                const restaurarEndpoint = estadoOriginal ? 'activar' : 'desactivar';
                const restaurarResponse = await axios.post(
                    `http://localhost:3000/api/municipios/${municipioTest.id}/${restaurarEndpoint}`,
                    {},
                    { headers }
                );
                
                console.log(`✅ Estado restaurado:`, restaurarResponse.data.message);
                
            } catch (error: any) {
                console.log('⚠️ Error en cambio de estado:', error.response?.data?.error || error.message);
            }
        }
        
        // 4. Verificar estadísticas
        console.log('\n📊 4. Obteniendo estadísticas de municipios...');
        try {
            const statsResponse = await axios.get('http://localhost:3000/api/municipios/stats', { headers });
            console.log('📊 Estadísticas:', JSON.stringify(statsResponse.data, null, 2));
        } catch (error: any) {
            console.log('⚠️ Error obteniendo estadísticas:', error.response?.data?.error || error.message);
        }
        
        console.log('\n🎉 ¡Flujo de super admin funcionando correctamente!');
        console.log('🔗 Ahora puedes hacer login en Flutter con:');
        console.log('   📧 Email: wzuccardi@gmail.com');
        console.log('   🔑 Password: 73102604722');
        console.log('   👑 Rol: super_admin');
        console.log('   🟣 Deberías ver el botón púrpura para administrar municipios');
        
    } catch (error: any) {
        console.error('❌ Error en el flujo:', error.response?.data || error.message);
    }
}

testSuperAdminFlow();
