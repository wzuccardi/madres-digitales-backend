import axios from 'axios';

async function testLogin() {
    console.log('🧪 Probando login de wzuccardi@gmail.com...');
    
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'wzuccardi@gmail.com',
            password: '73102604722'
        });
        
        console.log('✅ Login exitoso!');
        console.log('👤 Usuario:', response.data.user.nombre);
        console.log('📧 Email:', response.data.user.email);
        console.log('👑 Rol:', response.data.user.rol);
        console.log('🎯 Token generado:', response.data.token.substring(0, 20) + '...');
        
        // Verificar que es super_admin
        if (response.data.user.rol === 'super_admin') {
            console.log('🎉 ¡Perfecto! El usuario tiene rol super_admin');
            console.log('🏛️ Ahora puede gestionar municipios (activar/desactivar)');
        } else {
            console.log('⚠️ Advertencia: El rol no es super_admin');
        }
        
    } catch (error) {
        console.error('❌ Error en login:', error.response?.data || error.message);
    }
}

testLogin();
