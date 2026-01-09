import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMunicipios = async (req: Request, res: Response) => {
  try {
    const municipios = await prisma.municipio.findMany({
      where: {
        activo: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(municipios);
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los municipios'
    });
  }
};

export const getMunicipioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const municipio = await prisma.municipio.findUnique({
      where: { id }
    });

    if (!municipio) {
      return res.status(404).json({ 
        error: 'Municipio no encontrado',
        message: `No se encontró el municipio con ID: ${id}`
      });
    }

    res.json(municipio);
  } catch (error) {
    console.error('Error al obtener municipio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el municipio'
    });
  }
};

export const getMunicipiosByDepartamento = async (req: Request, res: Response) => {
  try {
    const { departamento } = req.params;
    
    const municipios = await prisma.municipio.findMany({
      where: {
        departamento: departamento,
        activo: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(municipios);
  } catch (error) {
    console.error('Error al obtener municipios por departamento:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los municipios del departamento'
    });
  }
};

export const createMunicipio = async (req: Request, res: Response) => {
  try {
    const { codigo_dane, nombre, departamento, coordenadas, geojson } = req.body;

    const municipio = await prisma.municipio.create({
      data: {
        codigo_dane,
        nombre,
        departamento,
        activo: true
      }
    });

    res.status(201).json(municipio);
  } catch (error) {
    console.error('Error al crear municipio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo crear el municipio'
    });
  }
};

export const updateMunicipio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { codigo_dane, nombre, departamento, coordenadas, geojson, activo } = req.body;

    const municipio = await prisma.municipio.update({
      where: { id },
      data: {
        codigo_dane,
        nombre,
        departamento,
        activo,
        fecha_actualizacion: new Date()
      }
    });

    res.json(municipio);
  } catch (error) {
    console.error('Error al actualizar municipio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el municipio'
    });
  }
};

export const deleteMunicipio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - marcar como inactivo
    const municipio = await prisma.municipio.update({
      where: { id },
      data: {
        activo: false,
        fecha_actualizacion: new Date()
      }
    });

    res.json({
      message: 'Municipio eliminado exitosamente',
      municipio
    });
  } catch (error) {
    console.error('Error al eliminar municipio:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el municipio'
    });
  }
};

// ===== FUNCIONES ESPECÍFICAS PARA SUPER ADMINISTRADOR =====

export const getAllMunicipiosAdmin = async (req: Request, res: Response) => {
  try {
    const municipios = await prisma.municipio.findMany({
      orderBy: {
        nombre: 'asc'
      },
      select: {
        id: true,
        codigo_dane: true,
        nombre: true,
        departamento: true,
        activo: true,
        fecha_creacion: true,
        fecha_actualizacion: true
      }
    });

    res.json({
      success: true,
      data: municipios,
      total: municipios.length
    });
  } catch (error) {
    console.error('Error al obtener municipios para admin:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los municipios'
    });
  }
};

export const toggleMunicipioStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Parámetro inválido',
        message: 'El campo "activo" debe ser un valor booleano'
      });
    }

    const municipio = await prisma.municipio.update({
      where: { id },
      data: {
        activo,
        fecha_actualizacion: new Date()
      }
    });

    res.json({
      success: true,
      message: `Municipio ${activo ? 'activado' : 'desactivado'} exitosamente`,
      data: municipio
    });
  } catch (error) {
    console.error('Error al cambiar estado del municipio:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo cambiar el estado del municipio'
    });
  }
};

export const getMunicipiosStats = async (req: Request, res: Response) => {
  try {
    const [total, activos, inactivos] = await Promise.all([
      prisma.municipio.count(),
      prisma.municipio.count({ where: { activo: true } }),
      prisma.municipio.count({ where: { activo: false } })
    ]);

    const estadisticasPorDepartamento = await prisma.municipio.groupBy({
      by: ['departamento'],
      _count: {
        id: true
      },
      orderBy: {
        departamento: 'asc'
      }
    });

    res.json({
      success: true,
      data: {
        resumen: {
          total,
          activos,
          inactivos
        },
        porDepartamento: estadisticasPorDepartamento.map(item => ({
          departamento: item.departamento,
          cantidad: item._count.id
        }))
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de municipios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas'
    });
  }
};
