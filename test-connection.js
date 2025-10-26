const axios = require('axios');  
''  
async function testConnection() {  
  console.log('?? INICIANDO PRUEBA DE CONEXI‡N...');   
  try {  
    // Probar health check  
    console.log('?? Probando health check...');  
    const healthResponse = await axios.get('http://localhost:3000/health');  
    console.log('? Health check:', healthResponse.data);  
ECHO est† activado.
    // Probar login  
    console.log('?? Probando login...');  
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {  
      email: 'wzuccardi@gmail.com',  
      password: '73102604722'  
    });  
    console.log('? Login exitoso:', loginResponse.data);  
ECHO est† activado.
    // Probar refresh token  
    if (loginResponse.data.data?.refreshToken) {  
      console.log('?? Probando refresh token...');  
      const refreshResponse = await axios.post('http://localhost:3000/api/auth/refresh', {  
        refreshToken: loginResponse.data.data.refreshToken  
      });  
      console.log('? Refresh token exitoso:', refreshResponse.data);  
    } else {  
      console.log('?? No hay refresh token en la respuesta');  
    }  
ECHO est† activado.
    // Probar obtenci¢n de controles  
    if (loginResponse.data.data?.accessToken) {  
      console.log('?? Probando obtenci¢n de controles...');  
      const controlesResponse = await axios.get('http://localhost:3000/api/controles', {  
        headers: {  
          'Authorization': \`Bearer \${loginResponse.data.data.accessToken}\`  
        }  
      });  
      console.log('? Controles obtenidos:', controlesResponse.data);  
    }  
ECHO est† activado.
    console.log('?? PRUEBA DE CONEXI‡N COMPLETADA EXITOSAMENTE');  
ECHO est† activado.
  } catch (error) {  
    console.error('? ERROR EN PRUEBA DE CONEXI‡N:', error.message);  
    if (error.response) {  
      console.error('Status:', error.response.status);  
      console.error('Data:', error.response.data);  
    }  
  }  
}  
''  
testConnection(); 
