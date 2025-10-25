// Controlador CRUD para IPS
import { Request, Response } from 'express';
import ipsCrudService from '../services/ips-crud.service';

// Obtener todas las IPS
export const getAllIps = async (req: Request, res: Response) => {
    try {
        console.log('🏥 Controller: Fetching all IPS...');
        const ipsList = await ipsCrudService.getAllIps();
        res.json(ipsList);
    } catch (error) {
        console.error('❌ Controller: Error fetching IPS:', error);
        res.status(500).json({
            error: 'Error al obtener IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener IPS activas
export const getActiveIps = async (req: Request, res: Response) => {
    try {
        console.log('🏥 Controller: Fetching active IPS...');
        const ipsList = await ipsCrudService.getActiveIps();
        res.json(ipsList);
    } catch (error) {
        console.error('❌ Controller: Error fetching active IPS:', error);
        res.status(500).json({
            error: 'Error al obtener IPS activas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener IPS por ID
export const getIpsById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`🏥 Controller: Fetching IPS ${id}...`);
        
        const ips = await ipsCrudService.getIpsById(id);
        res.json(ips);
    } catch (error) {
        console.error('❌ Controller: Error fetching IPS:', error);
        res.status(404).json({
            error: 'IPS no encontrada',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener IPS por municipio
export const getIpsByMunicipio = async (req: Request, res: Response) => {
    try {
        const { municipioId } = req.params;
        console.log(`🏥 Controller: Fetching IPS for municipio ${municipioId}...`);
        
        const ipsList = await ipsCrudService.getIpsByMunicipio(municipioId);
        res.json(ipsList);
    } catch (error) {
        console.error('❌ Controller: Error fetching IPS by municipio:', error);
        res.status(500).json({
            error: 'Error al obtener IPS por municipio',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Crear nueva IPS
export const createIps = async (req: Request, res: Response) => {
    try {
        console.log('🏥 Controller: Creating new IPS...');
        console.log('🏥 Controller: Request body:', JSON.stringify(req.body, null, 2));
        
        const newIps = await ipsCrudService.createIps(req.body);
        res.status(201).json(newIps);
    } catch (error) {
        console.error('❌ Controller: Error creating IPS:', error);
        res.status(400).json({
            error: 'Error al crear IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Actualizar IPS
export const updateIps = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`🏥 Controller: Updating IPS ${id}...`);
        console.log('🏥 Controller: Request body:', JSON.stringify(req.body, null, 2));
        
        const updatedIps = await ipsCrudService.updateIps(id, req.body);
        res.json(updatedIps);
    } catch (error) {
        console.error('❌ Controller: Error updating IPS:', error);
        res.status(400).json({
            error: 'Error al actualizar IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Eliminar IPS (soft delete)
export const deleteIps = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`🏥 Controller: Deleting IPS ${id}...`);
        
        const deletedIps = await ipsCrudService.deleteIps(id);
        res.json({
            message: 'IPS eliminada exitosamente',
            ips: deletedIps
        });
    } catch (error) {
        console.error('❌ Controller: Error deleting IPS:', error);
        res.status(400).json({
            error: 'Error al eliminar IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Buscar IPS por nombre
export const searchIps = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                error: 'Parámetro de búsqueda requerido'
            });
        }

        console.log(`🏥 Controller: Searching IPS with term: ${q}...`);
        const ipsList = await ipsCrudService.searchIpsByName(q);
        res.json(ipsList);
    } catch (error) {
        console.error('❌ Controller: Error searching IPS:', error);
        res.status(500).json({
            error: 'Error al buscar IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener IPS cercanas
export const getNearbyIps = async (req: Request, res: Response) => {
    try {
        const { lat, lng, radius } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                error: 'Coordenadas requeridas (lat, lng)'
            });
        }

        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const radiusKm = radius ? parseFloat(radius as string) : 10;

        console.log(`🏥 Controller: Finding nearby IPS at [${latitude}, ${longitude}]...`);
        const ipsList = await ipsCrudService.getNearbyIps(latitude, longitude, radiusKm);
        res.json(ipsList);
    } catch (error) {
        console.error('❌ Controller: Error finding nearby IPS:', error);
        res.status(500).json({
            error: 'Error al buscar IPS cercanas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

