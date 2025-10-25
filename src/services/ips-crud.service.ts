// Servicio CRUD para IPS (Instituciones Prestadoras de Salud)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateIpsDto {
    nombre: string;
    nit?: string;
    telefono?: string;
    direccion?: string;
    municipio_id?: string;
    nivel?: string;
    email?: string;
    latitud?: number;
    longitud?: number;
}

export interface UpdateIpsDto {
    nombre?: string;
    nit?: string;
    telefono?: string;
    direccion?: string;
    municipio_id?: string;
    nivel?: string;
    email?: string;
    activo?: boolean;
    latitud?: number;
    longitud?: number;
}

class IpsCrudService {
    // Obtener todas las IPS
    async getAllIps() {
        try {
            console.log('🏥 IpsCrudService: Fetching all IPS...');
            
            const ipsList = await prisma.iPS.findMany({
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ IpsCrudService: Found ${ipsList.length} IPS`);
            return ipsList;
        } catch (error) {
            console.error('❌ IpsCrudService: Error fetching IPS:', error);
            throw error;
        }
    }

    // Obtener IPS activas
    async getActiveIps() {
        try {
            console.log('🏥 IpsCrudService: Fetching active IPS...');
            
            const ipsList = await prisma.iPS.findMany({
                where: { activo: true },
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ IpsCrudService: Found ${ipsList.length} active IPS`);
            return ipsList;
        } catch (error) {
            console.error('❌ IpsCrudService: Error fetching active IPS:', error);
            throw error;
        }
    }

    // Obtener IPS por ID
    async getIpsById(id: string) {
        try {
            console.log(`🏥 IpsCrudService: Fetching IPS with ID: ${id}`);
            
            const ips = await prisma.iPS.findUnique({
                where: { id }
            });

            if (!ips) {
                throw new Error(`IPS con ID ${id} no encontrada`);
            }

            console.log(`✅ IpsCrudService: Found IPS: ${ips.nombre}`);
            return ips;
        } catch (error) {
            console.error(`❌ IpsCrudService: Error fetching IPS ${id}:`, error);
            throw error;
        }
    }

    // Obtener IPS por municipio
    async getIpsByMunicipio(municipioId: string) {
        try {
            console.log(`🏥 IpsCrudService: Fetching IPS for municipio: ${municipioId}`);
            
            const ipsList = await prisma.iPS.findMany({
                where: {
                    municipio_id: municipioId,
                    activo: true
                },
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ IpsCrudService: Found ${ipsList.length} IPS in municipio`);
            return ipsList;
        } catch (error) {
            console.error(`❌ IpsCrudService: Error fetching IPS for municipio:`, error);
            throw error;
        }
    }

    // Crear nueva IPS
    async createIps(data: CreateIpsDto) {
        try {
            console.log('🏥 IpsCrudService: Creating new IPS...');
            console.log('Data:', JSON.stringify(data, null, 2));

            const newIps = await prisma.iPS.create({
                data: {
                    nombre: data.nombre,
                    nit: data.nit,
                    direccion: data.direccion,
                    telefono: data.telefono,
                    email: data.email,
                    municipio_id: data.municipio_id,
                    nivel: data.nivel,
                    latitud: data.latitud,
                    longitud: data.longitud,
                    activo: true,
                    fecha_creacion: new Date(),
                    fecha_actualizacion: new Date()
                }
            });

            console.log(`✅ IpsCrudService: IPS created: ${newIps.nombre} (${newIps.id})`);
            return newIps;
        } catch (error) {
            console.error('❌ IpsCrudService: Error creating IPS:', error);
            throw error;
        }
    }

    // Actualizar IPS
    async updateIps(id: string, data: UpdateIpsDto) {
        try {
            console.log(`🏥 IpsCrudService: Updating IPS ${id}...`);
            console.log('Data:', JSON.stringify(data, null, 2));

            // Verificar que la IPS existe
            await this.getIpsById(id);

            const updateData: any = {};
            
            if (data.nombre !== undefined) updateData.nombre = data.nombre;
            if (data.nit !== undefined) updateData.nit = data.nit;
            if (data.direccion !== undefined) updateData.direccion = data.direccion;
            if (data.telefono !== undefined) updateData.telefono = data.telefono;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.municipio_id !== undefined) updateData.municipio_id = data.municipio_id;
            if (data.nivel !== undefined) updateData.nivel = data.nivel;
            if (data.activo !== undefined) updateData.activo = data.activo;
            if (data.latitud !== undefined) updateData.latitud = data.latitud;
            if (data.longitud !== undefined) updateData.longitud = data.longitud;
            
            updateData.fecha_actualizacion = new Date();

            const updatedIps = await prisma.iPS.update({
                where: { id },
                data: updateData
            });

            console.log(`✅ IpsCrudService: IPS updated: ${updatedIps.nombre}`);
            return updatedIps;
        } catch (error) {
            console.error(`❌ IpsCrudService: Error updating IPS ${id}:`, error);
            throw error;
        }
    }

    // Eliminar IPS (soft delete)
    async deleteIps(id: string) {
        try {
            console.log(`🏥 IpsCrudService: Deleting IPS ${id}...`);

            // Verificar que la IPS existe
            await this.getIpsById(id);

            const deletedIps = await prisma.iPS.update({
                where: { id },
                data: {
                    activo: false,
                    fecha_actualizacion: new Date()
                }
            });

            console.log(`✅ IpsCrudService: IPS deleted (soft): ${deletedIps.nombre}`);
            return deletedIps;
        } catch (error) {
            console.error(`❌ IpsCrudService: Error deleting IPS ${id}:`, error);
            throw error;
        }
    }

    // Buscar IPS por nombre
    async searchIpsByName(searchTerm: string) {
        try {
            console.log(`🏥 IpsCrudService: Searching IPS with term: ${searchTerm}`);
            
            const ipsList = await prisma.iPS.findMany({
                where: {
                    nombre: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    },
                    activo: true
                },
                orderBy: { nombre: 'asc' }
            });

            console.log(`✅ IpsCrudService: Found ${ipsList.length} IPS matching search`);
            return ipsList;
        } catch (error) {
            console.error('❌ IpsCrudService: Error searching IPS:', error);
            throw error;
        }
    }

    // Obtener IPS cercanas (requiere coordenadas)
    async getNearbyIps(latitude: number, longitude: number, radiusKm: number = 10) {
        try {
            console.log(`🏥 IpsCrudService: Finding IPS near [${latitude}, ${longitude}] within ${radiusKm}km`);
            
            // Obtener todas las IPS activas con coordenadas
            const ipsList = await prisma.iPS.findMany({
                where: {
                    activo: true,
                    AND: [
                        { latitud: { not: null } },
                        { longitud: { not: null } }
                    ]
                }
            });

            // Calcular distancias y filtrar por radio
            const nearbyIps = ipsList
                .map(ips => {
                    const ipsLat = parseFloat(ips.latitud?.toString() || '0');
                    const ipsLng = parseFloat(ips.longitud?.toString() || '0');
                    const distance = this.calculateDistance(latitude, longitude, ipsLat, ipsLng);
                    
                    return {
                        ...ips,
                        distancia_km: Math.round(distance * 100) / 100 // Redondear a 2 decimales
                    };
                })
                .filter(ips => ips.distancia_km <= radiusKm)
                .sort((a, b) => a.distancia_km - b.distancia_km);

            console.log(`✅ IpsCrudService: Found ${nearbyIps.length} nearby IPS within ${radiusKm}km`);
            return nearbyIps;
        } catch (error) {
            console.error('❌ IpsCrudService: Error finding nearby IPS:', error);
            throw error;
        }
    }

    // Calcular distancia entre dos puntos (fórmula de Haversine)
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}

export default new IpsCrudService();

