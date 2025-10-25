import prisma from '../config/database';
import bcrypt from 'bcrypt';

async function verifyWzuccardiLogin() {
    try {
        console.log('🔐 Verificando credenciales de wzuccardi@gmail.com...');
        console.log('');

        const email = 'wzuccardi@gmail.com';
        const password = '73102604722';

        // Buscar usuario
        const user = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!user) {
            console.error('❌ Usuario no encontrado');
            process.exit(1);
        }

        console.log('👤 Usuario encontrado:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Nombre:', user.nombre);
        console.log('   Rol:', user.rol);
        console.log('   Activo:', user.activo);
        console.log('');

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (isPasswordValid) {
            console.log('✅ CONTRASEÑA CORRECTA');
            console.log('');
            console.log('🎉 Puedes iniciar sesión con:');
            console.log('   Email: wzuccardi@gmail.com');
            console.log('   Password: 73102604722');
            console.log('');
            console.log('🌐 Endpoints de autenticación:');
            console.log('   POST http://localhost:3000/api/auth/login');
            console.log('   Body: { "email": "wzuccardi@gmail.com", "password": "73102604722" }');
        } else {
            console.error('❌ CONTRASEÑA INCORRECTA');
            console.error('');
            console.error('El hash almacenado no coincide con la contraseña proporcionada');
        }

    } catch (error) {
        console.error('❌ Error verificando login:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyWzuccardiLogin();

