import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UsuarioRol } from '../middlewares/role.middleware';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const getAllUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
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

    res.json(usuarios.map(u => ({
      ...u,
      rol: (u as any).rol ? String((u as any).rol).toLowerCase() : (u as any).rol
    })));
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
    
    const usuario = await prisma.usuarios.findUnique({
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

    res.json(usuario ? {
      ...usuario,
      rol: (usuario as any).rol ? String((usuario as any).rol).toLowerCase() : (usuario as any).rol
    } : usuario);
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
    
    const usuarios = await prisma.usuarios.findMany({
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

    res.json(usuarios.map(u => ({
      ...u,
      rol: (u as any).rol ? String((u as any).rol).toLowerCase() : (u as any).rol
    })));
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
    
    const usuarios = await prisma.usuarios.findMany({
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

    res.json(usuarios.map(u => ({
      ...u,
      rol: (u as any).rol ? String((u as any).rol).toLowerCase() : (u as any).rol
    })));
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
    const medicos = await prisma.usuarios.findMany({
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

    res.json(medicos.map(u => ({
      ...u,
      rol: (u as any).rol ? String((u as any).rol).toLowerCase() : (u as any).rol
    })));
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
    const madrinas = await prisma.usuarios.findMany({
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

    res.json(madrinas.map(u => ({
      ...u,
      rol: (u as any).rol ? String((u as any).rol).toLowerCase() : (u as any).rol
    })));
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

    res.json(coordinadores.map(u => ({
      ...u,
      rol: (u as any).rol ? String((u as any).rol).toLowerCase() : (u as any).rol
    })));
  } catch (error) {
    console.error('Error al obtener coordinadores:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los coordinadores'
    });
  }
};

export const createUsuario = async (req: Request, res: Response) => {
  try {
    const actorRol = (req as any).user?.rol as string | undefined;
    if (!actorRol) return res.status(401).json({ error: 'No autenticado' });

    const { email, nombre, password, rol, municipio_id, documento, telefono, activo } = req.body || {};
    if (!email || !nombre || !rol) {
      return res.status(400).json({ error: 'email, nombre y rol son requeridos' });
    }

    const rolUpper = String(rol).toUpperCase();
    const isSuper = actorRol.toUpperCase() === 'SUPER_ADMIN';
    const isAdmin = actorRol.toUpperCase() === 'ADMIN';
    if (isAdmin) {
      const allowedForAdmin = [UsuarioRol.ADMIN, UsuarioRol.COORDINADOR].map(r => r.toUpperCase());
      if (!allowedForAdmin.includes(rolUpper)) {
        return res.status(403).json({ error: 'El administrador solo puede crear ADMIN o COORDINADOR' });
      }
    }

    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });

    const user = await prisma.usuario.create({
      data: {
        id: crypto.randomUUID(),
        email,
        nombre,
        password_hash: password ? password : 'TEMP',
        rol: rolUpper as any,
        municipio_id: municipio_id || null,
        documento: documento || null,
        telefono: telefono || null,
        activo: activo ?? true,
      },
      select: { id: true, email: true, nombre: true, rol: true, activo: true }
    });
    return res.status(201).json({
      ...user,
      rol: (user as any).rol ? String((user as any).rol).toLowerCase() : (user as any).rol
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Error creando usuario' });
  }
};

export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const actorRol = (req as any).user?.rol as string | undefined;
    const actorId = (req as any).user?.id as string | undefined;
    if (!actorRol || !actorId) return res.status(401).json({ error: 'No autenticado' });
    
    const { id } = req.params;
    const target = await prisma.usuarios.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });

    const actorRolUpper = actorRol.toUpperCase();
    const isSuper = actorRolUpper === 'SUPER_ADMIN';
    const isAdmin = actorRolUpper === 'ADMIN';
    const isCoordinador = actorRolUpper === 'COORDINADOR';
    const isSelf = actorId === id;

    // Verificar permisos según rol
    if (!isSuper && !isAdmin && !isCoordinador && !isSelf) {
      return res.status(403).json({ error: 'No tienes permiso para editar este usuario' });
    }

    // Coordinadores solo pueden editar madrinas
    if (isCoordinador && !isSelf) {
      if (String(target.rol).toUpperCase() !== 'MADRINA') {
        return res.status(403).json({ error: 'Los coordinadores solo pueden editar madrinas' });
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    // Campos que todos pueden editar en su propio perfil
    if (req.body.nombre !== undefined) updateData.nombre = req.body.nombre;
    if (req.body.telefono !== undefined) updateData.telefono = req.body.telefono;
    if (req.body.documento !== undefined) updateData.documento = req.body.documento;
    if (req.body.tipo_documento !== undefined) updateData.tipo_documento = req.body.tipo_documento;
    
    // Solo admins y super_admins pueden cambiar email
    if ((isSuper || isAdmin) && req.body.email !== undefined) {
      updateData.email = req.body.email;
    }
    
    // Solo admins y super_admins pueden cambiar municipio
    if ((isSuper || isAdmin || isCoordinador) && req.body.municipio_id !== undefined) {
      updateData.municipio_id = req.body.municipio_id;
    }
    
    // Solo admins y super_admins pueden cambiar estado activo
    if ((isSuper || isAdmin) && req.body.activo !== undefined) {
      updateData.activo = req.body.activo;
    }

    // Cambio de rol solo para super_admin y admin (en endpoint separado)
    // No permitir cambio de rol aquí

    const user = await prisma.usuarios.update({
      where: { id },
      data: updateData,
      select: { 
        id: true, 
        email: true, 
        nombre: true, 
        documento: true,
        tipo_documento: true,
        telefono: true,
        rol: true, 
        municipio_id: true,
        activo: true,
        fecha_creacion: true,
        fecha_actualizacion: true
      }
    });
    
    return res.json({
      ...user,
      rol: (user as any).rol ? String((user as any).rol).toLowerCase() : (user as any).rol
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Error actualizando usuario' });
  }
};

// Nuevo endpoint para asignar roles (solo super_admin y admin)
export const asignarRol = async (req: Request, res: Response) => {
  try {
    const actorRol = (req as any).user?.rol as string | undefined;
    if (!actorRol) return res.status(401).json({ error: 'No autenticado' });
    
    const { id } = req.params;
    const { rol } = req.body;
    
    if (!rol) {
      return res.status(400).json({ error: 'El rol es requerido' });
    }

    const target = await prisma.usuarios.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });

    const actorRolUpper = actorRol.toUpperCase();
    const rolUpper = String(rol).toUpperCase();
    const isSuper = actorRolUpper === 'SUPER_ADMIN';
    const isAdmin = actorRolUpper === 'ADMIN';

    // Solo super_admin y admin pueden asignar roles
    if (!isSuper && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para asignar roles' });
    }

    // Admin no puede crear/promover a SUPER_ADMIN
    if (isAdmin && rolUpper === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'El administrador no puede promover usuarios a SUPER_ADMIN' });
    }

    // Admin no puede modificar a otro SUPER_ADMIN
    if (isAdmin && String(target.rol).toUpperCase() === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'El administrador no puede modificar un SUPER_ADMIN' });
    }

    const user = await prisma.usuarios.update({
      where: { id },
      data: { rol: rolUpper as any },
      select: { 
        id: true, 
        email: true, 
        nombre: true, 
        rol: true, 
        activo: true 
      }
    });
    
    return res.json({
      ...user,
      rol: (user as any).rol ? String((user as any).rol).toLowerCase() : (user as any).rol,
      message: 'Rol asignado exitosamente'
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Error asignando rol' });
  }
};

// Endpoint para que un usuario obtenga su propio perfil
export const getMiPerfil = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const usuario = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        documento: true,
        tipo_documento: true,
        telefono: true,
        rol: true,
        municipio_id: true,
        activo: true,
        fecha_creacion: true,
        fecha_actualizacion: true,
        municipios: {
          select: {
            id: true,
            nombre: true,
            departamento: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      ...usuario,
      rol: (usuario as any).rol ? String((usuario as any).rol).toLowerCase() : (usuario as any).rol
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Endpoint para actualizar el propio perfil
export const actualizarMiPerfil = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { nombre, telefono, documento, tipo_documento } = req.body;

    const updateData: any = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (documento !== undefined) updateData.documento = documento;
    if (tipo_documento !== undefined) updateData.tipo_documento = tipo_documento;

    const usuario = await prisma.usuarios.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        documento: true,
        tipo_documento: true,
        telefono: true,
        rol: true,
        municipio_id: true,
        activo: true,
        fecha_creacion: true,
        fecha_actualizacion: true
      }
    });

    res.json({
      ...usuario,
      rol: (usuario as any).rol ? String((usuario as any).rol).toLowerCase() : (usuario as any).rol,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const actorRol = (req as any).user?.rol as string | undefined;
    if (!actorRol) return res.status(401).json({ error: 'No autenticado' });
    const { id } = req.params;
    const target = await prisma.usuario.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isAdmin = actorRol.toUpperCase() === 'ADMIN';
    if (isAdmin && String(target.rol).toUpperCase() === UsuarioRol.SUPER_ADMIN) {
      return res.status(403).json({ error: 'El administrador no puede eliminar un SUPER_ADMIN' });
    }

    await prisma.usuario.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Error eliminando usuario' });
  }
};
