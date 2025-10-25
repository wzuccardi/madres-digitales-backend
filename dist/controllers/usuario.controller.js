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
                fecha_creacion: true,
                fecha_actualizacion: true
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
                fecha_creacion: true,
                fecha_actualizacion: true
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
                fecha_creacion: true,
                fecha_actualizacion: true
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
                fecha_creacion: true,
                fecha_actualizacion: true
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
                fecha_creacion: true,
                fecha_actualizacion: true
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
                fecha_creacion: true,
                fecha_actualizacion: true
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
                fecha_creacion: true,
                fecha_actualizacion: true
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

// Crear nuevo usuario
const createUsuario = async (req, res) => {
    try {
        const { email, nombre, documento, telefono, rol, municipio_id, password } = req.body;
        
        // Validar campos requeridos
        if (!email || !nombre || !rol || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email, nombre, rol y password son obligatorios'
            });
        }
        
        // Verificar si el email ya existe
        const existingUser = await prisma.usuario.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un usuario con este email'
            });
        }
        
        // Hashear la contraseña
        const bcrypt = require('bcrypt');
        const password_hash = await bcrypt.hash(password, 10);
        
        const usuario = await prisma.usuario.create({
            data: {
                email,
                nombre,
                documento,
                telefono,
                rol,
                municipio_id,
                password_hash,
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
                activo: true,
                fecha_creacion: true,
                fecha_actualizacion: true
            }
        });
        
        res.status(201).json({
            success: true,
            data: usuario,
            message: 'Usuario creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'No se pudo crear el usuario'
        });
    }
};

// Actualizar usuario
const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, nombre, documento, telefono, rol, municipio_id, activo } = req.body;
        
        // Verificar si el usuario existe
        const existingUser = await prisma.usuario.findUnique({
            where: { id }
        });
        
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Verificar si el email ya existe en otro usuario
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.usuario.findUnique({
                where: { email }
            });
            
            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otro usuario con este email'
                });
            }
        }
        
        const usuario = await prisma.usuario.update({
            where: { id },
            data: {
                ...(email && { email }),
                ...(nombre && { nombre }),
                ...(documento && { documento }),
                ...(telefono !== undefined && { telefono }),
                ...(rol && { rol }),
                ...(municipio_id !== undefined && { municipio_id }),
                ...(activo !== undefined && { activo })
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                documento: true,
                telefono: true,
                rol: true,
                municipio_id: true,
                activo: true,
                fecha_creacion: true,
                fecha_actualizacion: true
            }
        });
        
        res.json({
            success: true,
            data: usuario,
            message: 'Usuario actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'No se pudo actualizar el usuario'
        });
    }
};

// Eliminar usuario (soft delete)
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el usuario existe
        const existingUser = await prisma.usuario.findUnique({
            where: { id }
        });
        
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Soft delete - marcar como inactivo
        await prisma.usuario.update({
            where: { id },
            data: {
                activo: false
            }
        });
        
        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'No se pudo eliminar el usuario'
        });
    }
};

exports.createUsuario = createUsuario;
exports.updateUsuario = updateUsuario;
exports.deleteUsuario = deleteUsuario;
