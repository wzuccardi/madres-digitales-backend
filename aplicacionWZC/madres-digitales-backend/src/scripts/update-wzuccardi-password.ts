import prisma from '../config/database';
import bcrypt from 'bcrypt';

async function updateWzuccardiPassword() {
    try {
        console.log('🔐 Actualizando contraseña para wzuccardi@gmail.com...');

        // Nueva contraseña
        const newPassword = '73102604722';
        
        // Generar hash bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        console.log('🔑 Hash generado:', hashedPassword);

        // Buscar usuario
        const user = await prisma.usuario.findUnique({
            where: { email: 'wzuccardi@gmail.com' }
        });

        if (!user) {
            console.error('❌ Usuario wzuccardi@gmail.com no encontrado');
            process.exit(1);
        }

        console.log('👤 Usuario encontrado:', {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol
        });

        // Actualizar contraseña
        await prisma.usuario.update({
            where: { email: 'wzuccardi@gmail.com' },
            data: { password_hash: hashedPassword }
        });

        console.log('✅ Contraseña actualizada exitosamente');
        console.log('');
        console.log('📋 Credenciales actualizadas:');
        console.log('   Email: wzuccardi@gmail.com');
        console.log('   Password: 73102604722');
        console.log('');
        console.log('🔐 Puedes iniciar sesión con estas credenciales');

        // Verificar que el hash funciona
        const isValid = await bcrypt.compare(newPassword, hashedPassword);
        console.log('');
        console.log('✅ Verificación del hash:', isValid ? 'CORRECTO' : 'ERROR');

    } catch (error) {
        console.error('❌ Error actualizando contraseña:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

updateWzuccardiPassword();

