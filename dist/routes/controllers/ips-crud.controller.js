"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyIps = exports.searchIps = exports.deleteIps = exports.updateIps = exports.createIps = exports.getIpsByMunicipio = exports.getIpsById = exports.getActiveIps = exports.getAllIps = void 0;
const ips_crud_service_1 = __importDefault(require("../services/ips-crud.service"));
// Obtener todas las IPS
const getAllIps = async (req, res) => {
    try {
        console.log('🏥 Controller: Fetching all IPS...');
        const ipsList = await ips_crud_service_1.default.getAllIps();
        res.json(ipsList);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching IPS:', error);
        res.status(500).json({
            error: 'Error al obtener IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getAllIps = getAllIps;
// Obtener IPS activas
const getActiveIps = async (req, res) => {
    try {
        console.log('🏥 Controller: Fetching active IPS...');
        const ipsList = await ips_crud_service_1.default.getActiveIps();
        res.json(ipsList);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching active IPS:', error);
        res.status(500).json({
            error: 'Error al obtener IPS activas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getActiveIps = getActiveIps;
// Obtener IPS por ID
const getIpsById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🏥 Controller: Fetching IPS ${id}...`);
        const ips = await ips_crud_service_1.default.getIpsById(id);
        res.json(ips);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching IPS:', error);
        res.status(404).json({
            error: 'IPS no encontrada',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getIpsById = getIpsById;
// Obtener IPS por municipio
const getIpsByMunicipio = async (req, res) => {
    try {
        const { municipioId } = req.params;
        console.log(`🏥 Controller: Fetching IPS for municipio ${municipioId}...`);
        const ipsList = await ips_crud_service_1.default.getIpsByMunicipio(municipioId);
        res.json(ipsList);
    }
    catch (error) {
        console.error('❌ Controller: Error fetching IPS by municipio:', error);
        res.status(500).json({
            error: 'Error al obtener IPS por municipio',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getIpsByMunicipio = getIpsByMunicipio;
// Crear nueva IPS
const createIps = async (req, res) => {
    try {
        console.log('🏥 Controller: Creating new IPS...');
        const newIps = await ips_crud_service_1.default.createIps(req.body);
        res.status(201).json(newIps);
    }
    catch (error) {
        console.error('❌ Controller: Error creating IPS:', error);
        res.status(400).json({
            error: 'Error al crear IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.createIps = createIps;
// Actualizar IPS
const updateIps = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🏥 Controller: Updating IPS ${id}...`);
        const updatedIps = await ips_crud_service_1.default.updateIps(id, req.body);
        res.json(updatedIps);
    }
    catch (error) {
        console.error('❌ Controller: Error updating IPS:', error);
        res.status(400).json({
            error: 'Error al actualizar IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.updateIps = updateIps;
// Eliminar IPS (soft delete)
const deleteIps = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🏥 Controller: Deleting IPS ${id}...`);
        const deletedIps = await ips_crud_service_1.default.deleteIps(id);
        res.json({
            message: 'IPS eliminada exitosamente',
            ips: deletedIps
        });
    }
    catch (error) {
        console.error('❌ Controller: Error deleting IPS:', error);
        res.status(400).json({
            error: 'Error al eliminar IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.deleteIps = deleteIps;
// Buscar IPS por nombre
const searchIps = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                error: 'Parámetro de búsqueda requerido'
            });
        }
        console.log(`🏥 Controller: Searching IPS with term: ${q}...`);
        const ipsList = await ips_crud_service_1.default.searchIpsByName(q);
        res.json(ipsList);
    }
    catch (error) {
        console.error('❌ Controller: Error searching IPS:', error);
        res.status(500).json({
            error: 'Error al buscar IPS',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.searchIps = searchIps;
// Obtener IPS cercanas
const getNearbyIps = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                error: 'Coordenadas requeridas (lat, lng)'
            });
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusKm = radius ? parseFloat(radius) : 10;
        console.log(`🏥 Controller: Finding nearby IPS at [${latitude}, ${longitude}]...`);
        const ipsList = await ips_crud_service_1.default.getNearbyIps(latitude, longitude, radiusKm);
        res.json(ipsList);
    }
    catch (error) {
        console.error('❌ Controller: Error finding nearby IPS:', error);
        res.status(500).json({
            error: 'Error al buscar IPS cercanas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getNearbyIps = getNearbyIps;
