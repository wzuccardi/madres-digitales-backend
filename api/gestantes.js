const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Error initializing Prisma:', error);
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!prisma) {
      return res.status(500).json({
        success: false,
        error: 'Prisma client not initialized'
      });
    }

    if (req.method === 'GET') {
      // Obtener lista de gestantes con información relevante
      const gestantes = await prisma.gestantes.findMany({
        where: { activa: true },
        include: {
          municipios: {
            select: {
              nombre: true,
              departamento: true
            }
          },
          madrina: {
            select: {
              nombre: true,
              telefono: true
            }
          },
          medico_tratante: {
            select: {
              nombre: true,
              especialidad: true
            }
          },
          ips_asignada: {
            select: {
              nombre: true,
              telefono: true
            }
          },
          control_prenatal: {
            orderBy: { fecha_control: 'desc' },
            take: 1
          }
        },
        orderBy: { fecha_creacion: 'desc' }
      });

      // Procesar datos para el frontend
      const gestantesProcessed = gestantes.map(gestante => {
        // Calcular semanas de gestación
        let semanasGestacion = null;
        if (gestante.fecha_ultima_menstruacion) {
          const fechaUltimaMenstruacion = new Date(gestante.fecha_ultima_menstruacion);
          const hoy = new Date();
          const diferenciaDias = Math.floor((hoy - fechaUltimaMenstruacion) / (1000 * 60 * 60 * 24));
          semanasGestacion = Math.floor(diferenciaDias / 7);
        }

        // Último control
        const ultimoControl = gestante.control_prenatal.length > 0 
          ? gestante.control_prenatal[0].fecha_control.toISOString().split('T')[0]
          : null;

        return {
          id: gestante.id,
          nombre: gestante.nombre,
          documento: gestante.documento,
          telefono: gestante.telefono,
          direccion: gestante.direccion,
          fechaNacimiento: gestante.fecha_nacimiento.toISOString().split('T')[0],
          fechaUltimaMenstruacion: gestante.fecha_ultima_menstruacion 
            ? gestante.fecha_ultima_menstruacion.toISOString().split('T')[0] 
            : null,
          fechaProbableParto: gestante.fecha_probable_parto 
            ? gestante.fecha_probable_parto.toISOString().split('T')[0] 
            : null,
          semanasGestacion,
          eps: gestante.eps,
          regimenSalud: gestante.regimen_salud,
          riesgoAlto: gestante.riesgo_alto,
          municipio: gestante.municipios?.nombre || null,
          departamento: gestante.municipios?.departamento || null,
          madrina: gestante.madrina?.nombre || null,
          medicoTratante: gestante.medico_tratante?.nombre || null,
          ipsAsignada: gestante.ips_asignada?.nombre || null,
          ultimoControl,
          fechaCreacion: gestante.fecha_creacion.toISOString()
        };
      });

      res.json({
        success: true,
        data: gestantesProcessed,
        total: gestantesProcessed.length
      });

    } else {
      res.status(405).json({
        success: false,
        error: 'Método no permitido'
      });
    }

  } catch (error) {
    console.error('Gestantes error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener gestantes: ' + error.message
    });
  }
};