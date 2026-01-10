// Script específico para diagnosticar problemas de asignación de gestantes a madrinas
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001'; // Ajustar según el puerto del backend

async function debugMadrinaAssignment() {
    console.log('🔍 Diagnosticando asignación de gestantes a madrinas...\n');

    try {
        // 1. Login como administrador para ver todos los datos
        console.log('1. Obteniendo token de administrador...');
        const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'admin123'
            })
        });

        if (!adminLoginResponse.ok) {
            console.log('❌ Error en login de admin:', await adminLoginResponse.text());
            return;
        }

        const adminData = await adminLoginResponse.json();
        const adminToken = adminData.token;
        console.log('✅ Login de admin exitoso');

        // 2. Obtener todas las madrinas
        console.log('\n2. Obteniendo lista de madrinas...');
        const usersResponse = await fetch(`${BASE_URL}/api/usuarios`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (!usersResponse.ok) {
            console.log('❌ Error obteniendo usuarios:', await usersResponse.text());
            return;
        }

        const users = await usersResponse.json();
        const madrinas = users.filter(u => u.rol && (u.rol.includes('MADRINA') || u.rol.includes('madrina')));
        
        console.log(`✅ Encontradas ${madrinas.length} madrinas:`);
        madrinas.forEach(m => {
            console.log(`  - ${m.nombre} (${m.email}) - ID: ${m.id} - Rol: ${m.rol}`);
        });

        if (madrinas.length === 0) {
            console.log('⚠️ No se encontraron madrinas');
            return;
        }

        // 3. Obtener todas las gestantes con sus asignaciones
        console.log('\n3. Obteniendo todas las gestantes con asignaciones...');
        const gestantesResponse = await fetch(`${BASE_URL}/api/gestantes`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (!gestantesResponse.ok) {
            console.log('❌ Error obteniendo gestantes:', await gestantesResponse.text());
            return;
        }

        const allGestantes = await gestantesResponse.json();
        console.log(`✅ Encontradas ${allGestantes.length} gestantes en total`);

        // 4. Analizar asignaciones por cada madrina
        console.log('\n4. Analizando asignaciones por madrina...');
        
        for (const madrina of madrinas) {
            console.log(`\n📊 Análisis para madrina: ${madrina.nombre} (ID: ${madrina.id})`);
            
            // Gestantes asignadas a esta madrina en la base de datos
            const assignedGestantes = allGestantes.filter(g => g.madrina_id === madrina.id);
            console.log(`  - Gestantes asignadas en BD: ${assignedGestantes.length}`);
            
            if (assignedGestantes.length > 0) {
                assignedGestantes.forEach(g => {
                    console.log(`    * ${g.nombre} (ID: ${g.id})`);
                });
            }

            // Probar login como esta madrina
            console.log(`  - Probando login como ${madrina.email}...`);
            try {
                const madrinaLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: madrina.email,
                        password: 'madrina123' // Intentar contraseña por defecto
                    })
                });

                if (madrinaLoginResponse.ok) {
                    const madrinaLoginData = await madrinaLoginResponse.json();
                    const madrinaToken = madrinaLoginData.token;
                    
                    // Verificar qué gestantes ve la madrina
                    const madrinaGestantesResponse = await fetch(`${BASE_URL}/api/gestantes`, {
                        headers: { 'Authorization': `Bearer ${madrinaToken}` }
                    });

                    if (madrinaGestantesResponse.ok) {
                        const madrinaGestantes = await madrinaGestantesResponse.json();
                        console.log(`  - Gestantes que ve la madrina: ${madrinaGestantes.length}`);
                        
                        // Comparar asignaciones
                        console.log('  - Comparación:');
                        assignedGestantes.forEach(assigned => {
                            const vista = madrinaGestantes.find(g => g.id === assigned.id);
                            console.log(`    * ${assigned.nombre}: ${vista ? '✅ Visible' : '❌ NO visible'}`);
                        });

                        // Verificar si ve gestantes no asignadas
                        const noAsignadas = madrinaGestantes.filter(mg => 
                            !assignedGestantes.find(ag => ag.id === mg.id)
                        );
                        if (noAsignadas.length > 0) {
                            console.log('  - ⚠️ Gestantes no asignadas que está viendo:');
                            noAsignadas.forEach(g => {
                                console.log(`    * ${g.nombre} (ID: ${g.id}, madrina_id: ${g.madrina_id})`);
                            });
                        }
                    } else {
                        console.log('  - ❌ Error obteniendo gestantes de madrina:', await madrinaGestantesResponse.text());
                    }
                } else {
                    console.log(`  - ⚠️ Error en login de madrina: ${await madrinaLoginResponse.text()}`);
                }
            } catch (error) {
                console.log(`  - ⚠️ Error intentando login de madrina: ${error.message}`);
            }
        }

        // 5. Verificar gestantes sin madrina asignada
        console.log('\n5. Verificando gestantes sin madrina asignada...');
        const sinMadrina = allGestantes.filter(g => !g.madrina_id);
        console.log(`  - Gestantes sin madrina: ${sinMadrina.length}`);

        // 6. Verificar IDs de madrinas inválidos
        console.log('\n6. Verificando asignaciones con IDs inválidos...');
        const madrinaIds = madrinas.map(m => m.id);
        const asignacionesInvalidas = allGestantes.filter(g => 
            g.madrina_id && !madrinaIds.includes(g.madrina_id)
        );
        console.log(`  - Gestantes con madrina_id inválido: ${asignacionesInvalidas.length}`);
        if (asignacionesInvalidas.length > 0) {
            asignacionesInvalidas.forEach(g => {
                console.log(`    * ${g.nombre} (madrina_id: ${g.madrina_id})`);
            });
        }

    } catch (error) {
        console.error('❌ Error en el diagnóstico:', error.message);
    }
}

// Ejecutar diagnóstico
debugMadrinaAssignment();