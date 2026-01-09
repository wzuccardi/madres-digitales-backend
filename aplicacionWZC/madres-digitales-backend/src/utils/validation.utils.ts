// Utilidades de validación para prevenir problemas de asignación
import prisma from '../config/database';

/**
 * Valida que un madrina_id sea válido antes de asignarlo
 */
export async function validateMadrinaId(madrinaId: string): Promise<boolean> {
    if (!madrinaId || madrinaId.trim() === '') {
        return false;
    }

    try {
        const madrina = await prisma.usuarios.findFirst({
            where: {
                id: madrinaId,
                rol: 'MADRINA',
                activo: true
            }
        });

        return !!madrina;
    } catch (error) {
        console.error('❌ Error validando madrina_id:', error);
        return false;
    }
}

/**
 * Valida y corrige asignaciones de gestantes a madrinas
 */
export async function validateAndFixGestanteAssignments(): Promise<void> {
    console.log('🔍 Validando asignaciones de gestantes a madrinas...');

    try {
        // 1. Obtener todas las gestantes activas con madrina_id
        const gestantesConMadrina = await prisma.gestantes.findMany({
            where: {
                activa: true,
                NOT: {
                    madrina_id: null
                }
            },
            select: {
                id: true,
                nombre: true,
                madrina_id: true
            }
        });

        console.log(`📊 Encontradas ${gestantesConMadrina.length} gestantes con madrina asignada`);

        // 2. Obtener todos los IDs de madrinas válidas
        const madrinasValidas = await prisma.usuarios.findMany({
            where: {
                rol: 'MADRINA',
                activo: true
            },
            select: {
                id: true,
                nombre: true
            }
        });

        const madrinaIdsValidas = new Set(madrinasValidas.map(m => m.id));
        console.log(`✅ Madrinas válidas encontradas: ${madrinaIdsValidas.size}`);

        // 3. Identificar asignaciones inválidas
        const asignacionesInvalidas = gestantesConMadrina.filter(
            g => !madrinaIdsValidas.has(g.madrina_id)
        );

        if (asignacionesInvalidas.length > 0) {
            console.log(`⚠️ Encontradas ${asignacionesInvalidas.length} asignaciones inválidas:`);
            
            // 4. Corregir asignaciones inválidas
            const correccion = await prisma.gestantes.updateMany({
                where: {
                    id: {
                        in: asignacionesInvalidas.map(g => g.id)
                    }
                },
                data: {
                    madrina_id: null
                }
            });

            console.log(`✅ Corregidas ${correccion.count} asignaciones inválidas (madrina_id = null)`);
            
            // Log detallado de las correcciones
            asignacionesInvalidas.forEach(g => {
                console.log(`   - ${g.nombre} (ID: ${g.id}) - madrina_id inválido: ${g.madrina_id}`);
            });
        } else {
            console.log('✅ Todas las asignaciones son válidas');
        }

    } catch (error) {
        console.error('❌ Error en validación de asignaciones:', error);
    }
}

/**
 * Middleware para validar madrina_id antes de crear o actualizar gestantes
 */
export function validateMadrinaAssignment(req: any, res: any, next: any) {
    const { madrina_id } = req.body;
    
    // Si no se proporciona madrina_id, está bien (puede ser null)
    if (!madrina_id) {
        return next();
    }

    // Validar formato básico del ID
    if (typeof madrina_id !== 'string' || madrina_id.trim().length < 10) {
        return res.status(400).json({
            error: 'madrina_id inválido',
            details: 'El ID de madrina debe ser una cadena válida de al menos 10 caracteres'
        });
    }

    next();
}

/**
 * Verifica si una gestante específica está asignada a una madrina válida
 */
export async function isGestanteAssignedToValidMadrina(gestanteId: string): Promise<boolean> {
    try {
        const gestante = await prisma.gestantes.findUnique({
            where: { id: gestanteId },
            select: { madrina_id: true }
        });

        if (!gestante || !gestante.madrina_id) {
            return false;
        }

        return await validateMadrinaId(gestante.madrina_id);
    } catch (error) {
        console.error('❌ Error verificando asignación de gestante:', error);
        return false;
    }
}