import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsuarios = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los usuarios'
    });
  }
};

export const getUsuarioById = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el usuario'
    });
  }
};

export const getUsuariosByRol = async (req: Request, res: Response) => {
  try {
    const { rol } = req.params;
    
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: rol as any,
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
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los usuarios por rol'
    });
  }
};

export const getUsuariosByMunicipio = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error al obtener usuarios por municipio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los usuarios del municipio'
    });
  }
};

export const getMedicos = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los médicos'
    });
  }
};

export const getMadrinas = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error al obtener madrinas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las madrinas'
    });
  }
};

export const getCoordinadores = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error al obtener coordinadores:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los coordinadores'
    });
  }
};
