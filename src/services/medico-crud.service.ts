// Servicio CRUD para Médicos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateMedicoDto {
    nombre: string;
    documento: string;
    registro_medico: string;
    especialidad?: string;
    telefono?: string;
    email?: string;
    ips_id?: string;
    municipio_id?: string;
}

export interface UpdateMedicoDto {
    nombre?: string;
    documento?: string;
    registro_medico?: string;
    especialidad?: string;
    telefono?: string;
    email?: string;
    ips_id?: string;
    municipio_id?: string;
    activo?: boolean;
}

class MedicoCrudService {
    // Obtener todos los médicos
    async getAllMedicos() {
        try {
            console.log('👨‍⚕️ MedicoCrudService: Fetching all medicos...');
            
            const medicosList = await prisma.medico.findMany({
                include: {
                    ips: true,
                    municipio: true
                },
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ MedicoCrudService: Found ${medicosList.length} medicos`);
            return medicosList;
        } catch (error) {
            console.error('❌ MedicoCrudService: Error fetching medicos:', error);
            throw error;
        }
    }

    // Obtener médicos activos
    async getActiveMedicos() {
        try {
            console.log('👨‍⚕️ MedicoCrudService: Fetching active medicos...');
            
            const medicosList = await prisma.medico.findMany({
                where: { activo: true },
                include: {
                    ips: true,
                    municipio: true
                },
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ MedicoCrudService: Found ${medicosList.length} active medicos`);
            return medicosList;
        } catch (error) {
            console.error('❌ MedicoCrudService: Error fetching active medicos:', error);
            throw error;
        }
    }

    // Obtener médico por ID
    async getMedicoById(id: string) {
        try {
            console.log(`👨‍⚕️ MedicoCrudService: Fetching medico with ID: ${id}`);
            
            const medico = await prisma.medico.findUnique({
                where: { id },
                include: {
                    ips: true,
                    municipio: true
                }
            });

            if (!medico) {
                throw new Error(`Médico con ID ${id} no encontrado`);
            }

            console.log(`✅ MedicoCrudService: Found medico: ${medico.nombre}`);
            return medico;
        } catch (error) {
            console.error(`❌ MedicoCrudService: Error fetching medico ${id}:`, error);
            throw error;
        }
    }

    // Obtener médicos por IPS
    async getMedicosByIps(ipsId: string) {
        try {
            console.log(`👨‍⚕️ MedicoCrudService: Fetching medicos for IPS: ${ipsId}`);
            
            const medicosList = await prisma.medico.findMany({
                where: {
                    ips_id: ipsId,
                    activo: true
                },
                include: {
                    ips: true,
                    municipio: true
                },
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ MedicoCrudService: Found ${medicosList.length} medicos in IPS`);
            return medicosList;
        } catch (error) {
            console.error(`❌ MedicoCrudService: Error fetching medicos for IPS:`, error);
            throw error;
        }
    }

    // Obtener médicos por especialidad
    async getMedicosByEspecialidad(especialidad: string) {
        try {
            console.log(`👨‍⚕️ MedicoCrudService: Fetching medicos with especialidad: ${especialidad}`);
            
            const medicosList = await prisma.medico.findMany({
                where: {
                    especialidad: {
                        contains: especialidad,
                        mode: 'insensitive'
                    },
                    activo: true
                },
                include: {
                    ips: true,
                    municipio: true
                },
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ MedicoCrudService: Found ${medicosList.length} medicos with especialidad`);
            return medicosList;
        } catch (error) {
            console.error(`❌ MedicoCrudService: Error fetching medicos by especialidad:`, error);
            throw error;
        }
    }

    // Crear nuevo médico
    async createMedico(data: CreateMedicoDto) {
        try {
            console.log('👨‍⚕️ MedicoCrudService: Creating new medico...');
            console.log('Data:', JSON.stringify(data, null, 2));

            // Verificar que no exista un médico con el mismo documento
            const existingMedico = await prisma.medico.findFirst({
                where: { documento: data.documento }
            });

            if (existingMedico) {
                throw new Error(`Ya existe un médico con documento ${data.documento}`);
            }

            const newMedico = await prisma.medico.create({
                data: {
                    nombre: data.nombre,
                    documento: data.documento,
                    registro_medico: data.registro_medico,
                    especialidad: data.especialidad,
                    telefono: data.telefono,
                    email: data.email,
                    ips_id: data.ips_id,
                    municipio_id: data.municipio_id,
                    activo: true,
                    fecha_creacion: new Date(),
                    fecha_actualizacion: new Date()
                },
                include: {
                    ips: true,
                    municipio: true
                }
            });

            console.log(`✅ MedicoCrudService: Medico created: ${newMedico.nombre} (${newMedico.id})`);
            return newMedico;
        } catch (error) {
            console.error('❌ MedicoCrudService: Error creating medico:', error);
            throw error;
        }
    }

    // Actualizar médico
    async updateMedico(id: string, data: UpdateMedicoDto) {
        try {
            console.log(`👨‍⚕️ MedicoCrudService: Updating medico ${id}...`);
            console.log('Data:', JSON.stringify(data, null, 2));

            // Verificar que el médico existe
            await this.getMedicoById(id);

            // Si se actualiza el documento, verificar que no exista otro médico con ese documento
            if (data.documento) {
                const existingMedico = await prisma.medico.findFirst({
                    where: { 
                        documento: data.documento,
                        id: { not: id }
                    }
                });

                if (existingMedico) {
                    throw new Error(`Ya existe otro médico con documento ${data.documento}`);
                }
            }

            const updateData: any = {};
            
            if (data.nombre !== undefined) updateData.nombre = data.nombre;
            if (data.documento !== undefined) updateData.documento = data.documento;
            if (data.registro_medico !== undefined) updateData.registro_medico = data.registro_medico;
            if (data.especialidad !== undefined) updateData.especialidad = data.especialidad;
            if (data.telefono !== undefined) updateData.telefono = data.telefono;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.ips_id !== undefined) updateData.ips_id = data.ips_id;
            if (data.municipio_id !== undefined) updateData.municipio_id = data.municipio_id;
            if (data.activo !== undefined) updateData.activo = data.activo;
            
            updateData.fecha_actualizacion = new Date();

            const updatedMedico = await prisma.medico.update({
                where: { id },
                data: updateData,
                include: {
                    ips: true,
                    municipio: true
                }
            });

            console.log(`✅ MedicoCrudService: Medico updated: ${updatedMedico.nombre}`);
            return updatedMedico;
        } catch (error) {
            console.error(`❌ MedicoCrudService: Error updating medico ${id}:`, error);
            throw error;
        }
    }

    // Eliminar médico (soft delete)
    async deleteMedico(id: string) {
        try {
            console.log(`👨‍⚕️ MedicoCrudService: Deleting medico ${id}...`);

            // Verificar que el médico existe
            await this.getMedicoById(id);

            const deletedMedico = await prisma.medico.update({
                where: { id },
                data: {
                    activo: false,
                    fecha_actualizacion: new Date()
                },
                include: {
                    ips: true,
                    municipio: true
                }
            });

            console.log(`✅ MedicoCrudService: Medico deleted (soft): ${deletedMedico.nombre}`);
            return deletedMedico;
        } catch (error) {
            console.error(`❌ MedicoCrudService: Error deleting medico ${id}:`, error);
            throw error;
        }
    }

    // Buscar médicos por nombre
    async searchMedicosByName(searchTerm: string) {
        try {
            console.log(`👨‍⚕️ MedicoCrudService: Searching medicos with term: ${searchTerm}`);
            
            const medicosList = await prisma.medico.findMany({
                where: {
                    nombre: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    },
                    activo: true
                },
                include: {
                    ips: true,
                    municipio: true
                },
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ MedicoCrudService: Found ${medicosList.length} medicos matching search`);
            return medicosList;
        } catch (error) {
            console.error('❌ MedicoCrudService: Error searching medicos:', error);
            throw error;
        }
    }
}

export default new MedicoCrudService();

