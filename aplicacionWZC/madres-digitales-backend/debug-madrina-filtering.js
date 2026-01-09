// Script de diagnóstico para el filtrado de gestantes por madrina
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001'; // Ajustar según el puerto del backend

async function testMadrinaFiltering() {
    console.log('🔍 Iniciando diagnóstico de filtrado por madrina...\n');

    // 1. Primero, vamos a verificar qué usuarios existen y sus roles
    console.log('1. Verificando usuarios en la base de datos...');
    
    try {
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@test.com', // Email de administrador
                password: 'admin123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login de admin exitoso');
            console.log('Token:', loginData.token ? 'Obtenido' : 'No obtenido');
            console.log('Usuario:', loginData.usuario);
            
            // 2. Obtener lista de gestantes como admin para ver todas
            console.log('\n2. Obteniendo gestantes como administrador...');
            const gestantesAdminResponse = await fetch(`${BASE_URL}/api/gestantes`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });

            if (gestantesAdminResponse.ok) {
                const gestantesAdmin = await gestantesAdminResponse.json();
                console.log(`✅ Admin ve ${gestantesAdmin.length} gestantes en total`);
                
                if (gestantesAdmin.length > 0) {
                    console.log('Ejemplo de gestantes:');
                    gestantesAdmin.slice(0, 3).forEach(g => {
                        console.log(`  - ${g.nombre} (madrina_id: ${g.madrina_id || 'sin asignar'})`);
                    });
                }

                // 3. Buscar una madrina en la base de datos
                console.log('\n3. Buscando usuarios con rol MADRINA...');
                const usersResponse = await fetch(`${BASE_URL}/api/usuarios`, {
                    headers: {
                        'Authorization': `Bearer ${loginData.token}`
                    }
                });

                if (usersResponse.ok) {
                    const users = await usersResponse.json();
                    const madrinas = users.filter(u => u.rol && (u.rol.includes('MADRINA') || u.rol.includes('madrina')));
                    
                    console.log(`✅ Encontradas ${madrinas.length} madrinas:`);
                    madrinas.forEach(m => {
                        console.log(`  - ${m.nombre} (${m.email}) - Rol: ${m.rol} - ID: ${m.id}`);
                    });

                    if (madrinas.length > 0) {
                        const testMadrina = madrinas[0];
                        
                        // 4. Probar login como madrina
                        console.log('\n4. Probando login como madrina...');
                        const madrinaLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: testMadrina.email,
                                password: 'madrina123' // Asumir contraseña por defecto
                            })
                        });

                        if (madrinaLoginResponse.ok) {
                            const madrinaLoginData = await madrinaLoginResponse.json();
                            console.log('✅ Login de madrina exitoso');
                            console.log('Token:', madrinaLoginData.token ? 'Obtenido' : 'No obtenido');
                            console.log('Usuario:', madrinaLoginData.usuario);

                            // 5. Verificar qué gestantes ve la madrina
                            console.log('\n5. Verificando gestantes que ve la madrina...');
                            const gestantesMadrinaResponse = await fetch(`${BASE_URL}/api/gestantes`, {
                                headers: {
                                    'Authorization': `Bearer ${madrinaLoginData.token}`
                                }
                            });

                            if (gestantesMadrinaResponse.ok) {
                                const gestantesMadrina = await gestantesMadrinaResponse.json();
                                console.log(`🔍 Madrina ve ${gestantesMadrina.length} gestantes`);

                                // 6. Verificar si las gestantes que ve corresponden a su madrina_id
                                console.log('\n6. Analizando asignación de gestantes...');
                                const gestantesAsignadasAMadrina = gestantesAdmin.filter(g => g.madrina_id === testMadrina.id);
                                console.log(`📊 Gestantes asignadas a esta madrina en BD: ${gestantesAsignadasAMadrina.length}`);
                                console.log(`📊 Gestantes que la madrina ve por API: ${gestantesMadrina.length}`);

                                if (gestantesAsignadasAMadrina.length !== gestantesMadrina.length) {
                                    console.log('❌ HAY INCONSISTENCIA EN EL FILTRADO');
                                    console.log('Gestantes asignadas pero no vistas:');
                                    gestantesAsignadasAMadrina.forEach(g => {
                                        const vista = gestantesMadrina.find(gm => gm.id === g.id);
                                        if (!vista) {
                                            console.log(`  - ${g.nombre} (ID: ${g.id})`);
                                        }
                                    });
                                } else {
                                    console.log('✅ El filtrado parece correcto');
                                }

                                // 7. Verificar detalles del token y rol
                                console.log('\n7. Analizando información del token...');
                                try {
                                    const tokenParts = madrinaLoginData.token.split('.');
                                    if (tokenParts.length === 3) {
                                        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                                        console.log('Payload del token:', payload);
                                    }
                                } catch (e) {
                                    console.log('No se pudo decodificar el token');
                                }
                            } else {
                                console.log('❌ Error al obtener gestantes como madrina:', await gestantesMadrinaResponse.text());
                            }
                        } else {
                            console.log('❌ Error en login de madrina:', await madrinaLoginResponse.text());
                            console.log('Intentando con contraseña por defecto...');
                        }
                    } else {
                        console.log('⚠️ No se encontraron madrinas para probar');
                    }
                } else {
                    console.log('❌ Error al obtener usuarios:', await usersResponse.text());
                }
            } else {
                console.log('❌ Error al obtener gestantes como admin:', await gestantesAdminResponse.text());
            }
        } else {
            console.log('❌ Error en login de admin:', await loginResponse.text());
        }
    } catch (error) {
        console.error('❌ Error en la conexión:', error.message);
    }
}

// Ejecutar el diagnóstico
testMadrinaFiltering();