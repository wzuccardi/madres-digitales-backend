"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoordinadores = exports.getMadrinas = exports.getMedicos = exports.getUsuariosByMunicipio = exports.getUsuariosByRol = exports.getUsuarioById = exports.getAllUsuarios = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            where: {
                activo: true
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                direccion: true,
                coordenadas: true,
                created_at: true,
                updated_at: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
        res.json(usuarios);
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los usuarios'
        });
    }
};
exports.getAllUsuarios = getAllUsuarios;
const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                direccion: true,
                coordenadas: true,
                created_at: true,
                updated_at: true
            }
        });
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró el usuario con ID: ${id}`
            });
        }
        res.json(usuario);
    }
    catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo obtener el usuario'
        });
    }
};
exports.getUsuarioById = getUsuarioById;
const getUsuariosByRol = async (req, res) => {
    try {
        const { rol } = req.params;
        const usuarios = await prisma.usuario.findMany({
            where: {
                rol: rol,
                activo: true
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                direccion: true,
                coordenadas: true,
                created_at: true,
                updated_at: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
        res.json(usuarios);
    }
    catch (error) {
        console.error('Error al obtener usuarios por rol:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los usuarios por rol'
        });
    }
};
exports.getUsuariosByRol = getUsuariosByRol;
const getUsuariosByMunicipio = async (req, res) => {
    try {
        const { municipioId } = req.params;
        const usuarios = await prisma.usuario.findMany({
            where: {
                municipio_id: municipioId,
                activo: true
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                direccion: true,
                coordenadas: true,
                created_at: true,
                updated_at: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
        res.json(usuarios);
    }
    catch (error) {
        console.error('Error al obtener usuarios por municipio:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los usuarios del municipio'
        });
    }
};
exports.getUsuariosByMunicipio = getUsuariosByMunicipio;
const getMedicos = async (req, res) => {
    try {
        const medicos = await prisma.usuario.findMany({
            where: {
                rol: 'medico',
                activo: true
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                direccion: true,
                coordenadas: true,
                created_at: true,
                updated_at: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
        res.json(medicos);
    }
    catch (error) {
        console.error('Error al obtener médicos:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los médicos'
        });
    }
};
exports.getMedicos = getMedicos;
const getMadrinas = async (req, res) => {
    try {
        const madrinas = await prisma.usuario.findMany({
            where: {
                rol: 'madrina',
                activo: true
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                direccion: true,
                coordenadas: true,
                created_at: true,
                updated_at: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
        res.json(madrinas);
    }
    catch (error) {
        console.error('Error al obtener madrinas:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener las madrinas'
        });
    }
};
exports.getMadrinas = getMadrinas;
const getCoordinadores = async (req, res) => {
    try {
        const coordinadores = await prisma.usuario.findMany({
            where: {
                rol: 'coordinador',
                activo: true
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                direccion: true,
                coordenadas: true,
                created_at: true,
                updated_at: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
        res.json(coordinadores);
    }
    catch (error) {
        console.error('Error al obtener coordinadores:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los coordinadores'
        });
    }
};
exports.getCoordinadores = getCoordinadores;
