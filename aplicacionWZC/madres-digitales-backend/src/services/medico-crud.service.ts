// Servicio CRUD para Médicos
import MedicoRepositoryImpl from '../infrastructure/repositories/medico.repository.impl';

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
    private readonly repo = new MedicoRepositoryImpl();
    // Obtener todos los médicos
    async getAllMedicos() {
        try {
            console.log('👨‍⚕️ MedicoCrudService: Fetching all medicos...');
            
            const medicosList = await this.repo.findMany();

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
            
            const medicosList = await this.repo.findActive();

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
            
            const medico = await this.repo.findById(id);

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
            
            const medicosList = await this.repo.findByIPS(ipsId);

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
            
            const medicosList = await this.repo.findByEspecialidad(especialidad);

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
            const newMedico = await this.repo.create(data);

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

            const updatedMedico = await this.repo.update(id, updateData);

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

            const deletedMedico = await this.repo.softDelete(id);

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
            
            const medicosList = await this.repo.searchByName(searchTerm);

            console.log(`✅ MedicoCrudService: Found ${medicosList.length} medicos matching search`);
            return medicosList;
        } catch (error) {
            console.error('❌ MedicoCrudService: Error searching medicos:', error);
            throw error;
        }
    }
}

export default new MedicoCrudService();

