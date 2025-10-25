"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIPSByNivel = exports.getIPSByMunicipio = exports.getIPSCercanas = exports.deleteIPS = exports.updateIPS = exports.createIPS = exports.getIPSById = exports.getAllIPS = void 0;
const ips_service_1 = require("../services/ips.service");
const ipsService = new ips_service_1.IPSService();
const getAllIPS = async (req, res) => {
    try {
        const result = await ipsService.getAllIPS();
        // Retornar directamente el array de IPS para compatibilidad con el frontend
        res.json(result.ips || []);
    }
    catch (error) {
        console.error('❌ Controller: Error in getAllIPS:', error);
        res.status(500).json({ error: 'Error al obtener IPS' });
    }
};
exports.getAllIPS = getAllIPS;
const getIPSById = async (req, res) => {
    try {
        const ips = await ipsService.getIPSById(req.params.id);
        if (!ips)
            return res.status(404).json({ error: 'IPS no encontrada' });
        res.json(ips);
    }
    catch (error) {
        console.error('❌ Controller: Error in getIPSById:', error);
        res.status(500).json({ error: 'Error al obtener IPS' });
    }
};
exports.getIPSById = getIPSById;
const createIPS = async (req, res) => {
    try {
        const ips = await ipsService.createIPS(req.body);
        res.status(201).json(ips);
    }
    catch (error) {
        console.error('❌ Controller: Error in createIPS:', error);
        res.status(500).json({ error: 'Error al crear IPS' });
    }
};
exports.createIPS = createIPS;
const updateIPS = async (req, res) => {
    try {
        const ips = await ipsService.updateIPS(req.params.id, req.body);
        res.json(ips);
    }
    catch (error) {
        console.error('❌ Controller: Error in updateIPS:', error);
        res.status(500).json({ error: 'Error al actualizar IPS' });
    }
};
exports.updateIPS = updateIPS;
const deleteIPS = async (req, res) => {
    try {
        await ipsService.deleteIPS(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        console.error('❌ Controller: Error in deleteIPS:', error);
        res.status(500).json({ error: 'Error al eliminar IPS' });
    }
};
exports.deleteIPS = deleteIPS;
// Controlador para buscar IPS cercanas
const getIPSCercanas = async (req, res) => {
    try {
        const { latitud, longitud, radio } = req.query;
        // Validar parámetros requeridos
        if (!latitud || !longitud) {
            return res.status(400).json({
                error: 'Los parámetros latitud y longitud son requeridos'
            });
        }
        // Convertir a números y validar
        const lat = parseFloat(latitud);
        const lng = parseFloat(longitud);
        const radioKm = radio ? parseFloat(radio) : 10; // Default 10km
        if (isNaN(lat) || isNaN(lng) || isNaN(radioKm)) {
            return res.status(400).json({
                error: 'Los parámetros deben ser números válidos'
            });
        }
        // Validar rangos de coordenadas
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                error: 'Coordenadas fuera del rango válido'
            });
        }
        if (radioKm <= 0 || radioKm > 100) {
            return res.status(400).json({
                error: 'El radio debe estar entre 0 y 100 km'
            });
        }
        // Buscar IPS cercanas
        const result = await ipsService.getIPSCercanas([lat, lng], radioKm);
        const ipsCercanas = result.ips || [];
        res.json({
            centro: { latitud: lat, longitud: lng },
            radio_km: radioKm,
            total_encontradas: ipsCercanas.length,
            ips: ipsCercanas
        });
    }
    catch (error) {
        console.error('❌ Controller: Error in getIPSCercanas:', error);
        res.status(500).json({
            error: 'Error interno del servidor al buscar IPS cercanas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getIPSCercanas = getIPSCercanas;
// Controlador para obtener IPS por municipio
const getIPSByMunicipio = async (req, res) => {
    try {
        const { municipioId } = req.params;
        const result = await ipsService.getAllIPS({ municipio_id: municipioId });
        res.json(result.ips || []);
    }
    catch (error) {
        console.error('❌ Controller: Error in getIPSByMunicipio:', error);
        res.status(500).json({ error: 'Error al obtener IPS del municipio' });
    }
};
exports.getIPSByMunicipio = getIPSByMunicipio;
// Controlador para obtener IPS por nivel de atención
const getIPSByNivel = async (req, res) => {
    try {
        const { nivel } = req.params;
        const result = await ipsService.getAllIPS({ nivel });
        res.json(result.ips || []);
    }
    catch (error) {
        console.error('❌ Controller: Error in getIPSByNivel:', error);
        res.status(500).json({ error: 'Error al obtener IPS por nivel' });
    }
};
exports.getIPSByNivel = getIPSByNivel;
