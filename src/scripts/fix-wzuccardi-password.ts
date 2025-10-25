import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Corrigiendo contraseña para wzuccardi@gmail.com...');
    
    try {
        // Buscar el usuario
        const user = await prisma.usuario.findUnique({
            where: { email: 'wzuccardi@gmail.com' }
        });
        
        if (!user) {
            console.log('❌ Usuario wzuccardi@gmail.com no encontrado');
            return;
        }
        
        console.log('✅ Usuario encontrado:', user.nombre);
        
        // Generar hash de la nueva contraseña
        const newPassword = '73102604722';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        console.log('🔐 Generando nuevo hash de contraseña...');
        
        // Actualizar la contraseña
        await prisma.usuario.update({
            where: { email: 'wzuccardi@gmail.com' },
            data: { 
                password_hash: hashedPassword,
                updated_at: new Date()
            }
        });
        
        console.log('✅ Contraseña actualizada exitosamente');
        
        // Verificar que la nueva contraseña funciona
        console.log('🧪 Verificando nueva contraseña...');
        const updatedUser = await prisma.usuario.findUnique({
            where: { email: 'wzuccardi@gmail.com' }
        });
        
        if (updatedUser) {
            const passwordCorrect = await bcrypt.compare(newPassword, updatedUser.password_hash);
            console.log(`✅ Verificación: ${passwordCorrect ? 'EXITOSA' : 'FALLIDA'}`);
            
            if (passwordCorrect) {
                console.log('🎉 ¡Contraseña corregida! Ahora puedes hacer login con:');
                console.log(`   Email: wzuccardi@gmail.com`);
                console.log(`   Password: 73102604722`);
                console.log(`   Rol: ${updatedUser.rol}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
