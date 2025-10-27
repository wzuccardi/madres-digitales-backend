import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AssignmentService {
  /**
   * Asignar madrina a gestante basado en proximidad geográfica y municipio
   */
  async assignMadrinaToGestante(gestanteId: string): Promise<string | null> {
    try {
      console.log('🎯 AssignmentService: Iniciando asignación de madrina para gestante:', gestanteId);

      // Obtener información de la gestante
      const gestante = await prisma.gestantes.findUnique({
        where: { id: gestanteId },
        include: {
          municipios: true,
        },
      });

      if (!gestante) {
        console.log('❌ AssignmentService: Gestante no encontrada');
        return null;
      }

      console.log('👩‍🤱 AssignmentService: Gestante encontrada:', gestante.nombre, 'Municipio:', gestante.municipios?.nombre);

      // Buscar madrinas disponibles en el mismo municipio
      const madrinasDisponibles = await prisma.usuarios.findMany({
        where: {
          rol: 'madrina',
          activo: true,
          municipio_id: gestante.municipio_id,
        },
        include: {
          gestantes_madrina: true,
          municipios: true,
        },
      });

      console.log('👥 AssignmentService: Madrinas disponibles en el municipio:', madrinasDisponibles.length);

      if (madrinasDisponibles.length === 0) {
        // Si no hay madrinas en el mismo municipio, buscar en municipios cercanos
        console.log('🔍 AssignmentService: Buscando madrinas en municipios cercanos...');
        
        const madrinasRegionales = await prisma.usuarios.findMany({
          where: {
            rol: 'madrina',
            activo: true,
            NOT: {
              municipio_id: null,
            },
          },
          include: {
            gestantes_madrina: true,
            municipios: true,
          },
        });

        console.log('🌍 AssignmentService: Madrinas regionales encontradas:', madrinasRegionales.length);

        if (madrinasRegionales.length === 0) {
          console.log('❌ AssignmentService: No hay madrinas disponibles');
          return null;
        }

        // Seleccionar la madrina con menos gestantes asignadas
        const madrinaSeleccionada = madrinasRegionales.reduce((prev, current) => {
          return (prev as any).gestantes_madrina.length <= (current as any).gestantes_madrina.length ? prev : current;
        });

        console.log('✅ AssignmentService: Madrina regional seleccionada:', madrinaSeleccionada.nombre, 'Carga actual:', (madrinaSeleccionada as any).gestantes_madrina.length);

        // Asignar la madrina a la gestante
        await prisma.gestantes.update({
          where: { id: gestanteId },
          data: { madrina_id: madrinaSeleccionada.id },
        });

        return madrinaSeleccionada.id;
      }

      // Seleccionar la madrina con menos gestantes asignadas en el mismo municipio
      const madrinaSeleccionada = madrinasDisponibles.reduce((prev, current) => {
        return (prev as any).gestantes_madrina.length <= (current as any).gestantes_madrina.length ? prev : current;
      });

      console.log('✅ AssignmentService: Madrina local seleccionada:', madrinaSeleccionada.nombre, 'Carga actual:', (madrinaSeleccionada as any).gestantes_madrina.length);

      // Asignar la madrina a la gestante
      await prisma.gestantes.update({
        where: { id: gestanteId },
        data: { madrina_id: madrinaSeleccionada.id },
      });

      return madrinaSeleccionada.id;
    } catch (error) {
      console.error('❌ AssignmentService: Error asignando madrina:', error);
      return null;
    }
  }

  /**
   * Asignar médico a gestante basado en IPS y proximidad
   */
  async assignMedicoToGestante(gestanteId: string): Promise<string | null> {
    try {
      console.log('🏥 AssignmentService: Iniciando asignación de médico para gestante:', gestanteId);

      // Obtener información de la gestante
      const gestante = await prisma.gestantes.findUnique({
        where: { id: gestanteId },
        include: {
          municipios: true,
          ips_asignada: true,
        },
      });

      if (!gestante) {
        console.log('❌ AssignmentService: Gestante no encontrada');
        return null;
      }

      console.log('👩‍🤱 AssignmentService: Gestante encontrada:', gestante.nombre);

      // Si la gestante ya tiene una IPS asignada, buscar médicos en esa IPS
      if (gestante.ips_asignada_id) {
        const medicosIPS = await prisma.medicos.findMany({
          where: {
            ips_id: gestante.ips_asignada_id,
            activo: true,
          },
          include: {
            gestantes: true,
          },
        });

        if (medicosIPS.length > 0) {
          const medicoSeleccionado = medicosIPS.reduce((prev, current) => {
            return (prev as any).gestantes.length <= (current as any).gestantes.length ? prev : current;
          });

          console.log('✅ AssignmentService: Médico de IPS seleccionado:', medicoSeleccionado.nombre);

          await prisma.gestantes.update({
            where: { id: gestanteId },
            data: { medico_tratante_id: medicoSeleccionado.id },
          });

          return medicoSeleccionado.id;
        }
      }

      // Buscar médicos en el mismo municipio
      const medicosDisponibles = await prisma.medicos.findMany({
        where: {
          activo: true,
          municipio_id: gestante.municipio_id,
        },
        include: {
          gestantes: true,
        },
      });

      if (medicosDisponibles.length === 0) {
        console.log('❌ AssignmentService: No hay médicos disponibles en el municipio');
        return null;
      }

      // Seleccionar el médico con menos gestantes asignadas
      const medicoSeleccionado = medicosDisponibles.reduce((prev, current) => {
        return (prev as any).gestantes.length <= (current as any).gestantes.length ? prev : current;
      });

      console.log('✅ AssignmentService: Médico seleccionado:', medicoSeleccionado.nombre, 'Carga actual:', (medicoSeleccionado as any).gestantes.length);

      // Asignar el médico a la gestante
      await prisma.gestantes.update({
        where: { id: gestanteId },
        data: { medico_tratante_id: medicoSeleccionado.id },
      });

      return medicoSeleccionado.id;
    } catch (error) {
      console.error('❌ AssignmentService: Error asignando médico:', error);
      return null;
    }
  }

  /**
   * Reasignar gestantes cuando una madrina se vuelve inactiva
   */
  async reassignGestantesFromInactiveMadrina(madrinaId: string): Promise<number> {
    try {
      console.log('🔄 AssignmentService: Reasignando gestantes de madrina inactiva:', madrinaId);

      // Obtener gestantes asignadas a la madrina inactiva
      const gestantesAfectadas = await prisma.gestantes.findMany({
        where: {
          madrina_id: madrinaId,
          activa: true,
        },
      });

      console.log('👥 AssignmentService: Gestantes a reasignar:', gestantesAfectadas.length);

      let reasignadas = 0;
      for (const gestante of gestantesAfectadas) {
        const nuevaMadrinaId = await this.assignMadrinaToGestante(gestante.id);
        if (nuevaMadrinaId) {
          reasignadas++;
        }
      }

      console.log('✅ AssignmentService: Gestantes reasignadas exitosamente:', reasignadas);
      return reasignadas;
    } catch (error) {
      console.error('❌ AssignmentService: Error reasignando gestantes:', error);
      return 0;
    }
  }

  /**
   * Obtener estadísticas de asignación por municipio
   */
  async getAssignmentStatsByMunicipio(municipioId?: string) {
    try {
      const whereClause = municipioId ? { municipio_id: municipioId } : {};

      const stats = await prisma.municipios.findMany({
        where: municipioId ? { id: municipioId } : { activo: true },
        include: {
          gestantes: {
            where: { activa: true },
            include: {
              madrina: true,
              medico_tratante: true,
            },
          },
          usuarios: {
            where: { rol: 'madrina', activo: true },
          },
          medicos: {
            where: { activo: true },
          },
        },
      });

      return stats.map(municipio => ({
        municipio: {
          id: municipio.id,
          nombre: municipio.nombre,
          codigo: municipio.codigo_dane,
        },
        gestantes: {
          total: (municipio as any).gestantes.length,
          conMadrina: (municipio as any).gestantes.filter((g: any) => g.madrina_id).length,
          sinMadrina: (municipio as any).gestantes.filter((g: any) => !g.madrina_id).length,
          conMedico: (municipio as any).gestantes.filter((g: any) => g.medico_tratante_id).length,
          sinMedico: (municipio as any).gestantes.filter((g: any) => !g.medico_tratante_id).length,
        },
        recursos: {
          madrinas: (municipio as any).madrinas.length,
          medicos: (municipio as any).medicos.length,
        },
        cobertura: {
          madrinas: (municipio as any).gestantes.length > 0 ?
            (((municipio as any).gestantes.filter((g: any) => g.madrina_id).length / (municipio as any).gestantes.length * 100).toFixed(1) + '%') : '0%',
          medicos: (municipio as any).gestantes.length > 0 ?
            (((municipio as any).gestantes.filter((g: any) => g.medico_tratante_id).length / (municipio as any).gestantes.length * 100).toFixed(1) + '%') : '0%',
        },
      }));
    } catch (error) {
      console.error('❌ AssignmentService: Error obteniendo estadísticas:', error);
      return [];
    }
  }

  /**
   * Ejecutar asignación automática para todas las gestantes sin asignar
   */
  async runAutoAssignment(): Promise<{ madrinasAsignadas: number; medicosAsignados: number }> {
    try {
      console.log('🚀 AssignmentService: Iniciando asignación automática masiva...');

      // Obtener gestantes sin madrina asignada
      const gestantesSinMadrina = await prisma.gestantes.findMany({
        where: {
          activa: true,
          madrina_id: null,
        },
      });

      // Obtener gestantes sin médico asignado
      const gestantesSinMedico = await prisma.gestantes.findMany({
        where: {
          activa: true,
          medico_tratante_id: null,
        },
      });

      console.log('📊 AssignmentService: Gestantes sin madrina:', gestantesSinMadrina.length);
      console.log('📊 AssignmentService: Gestantes sin médico:', gestantesSinMedico.length);

      let madrinasAsignadas = 0;
      let medicosAsignados = 0;

      // Asignar madrinas
      for (const gestante of gestantesSinMadrina) {
        const madrinaId = await this.assignMadrinaToGestante(gestante.id);
        if (madrinaId) {
          madrinasAsignadas++;
        }
      }

      // Asignar médicos
      for (const gestante of gestantesSinMedico) {
        const medicoId = await this.assignMedicoToGestante(gestante.id);
        if (medicoId) {
          medicosAsignados++;
        }
      }

      console.log('✅ AssignmentService: Asignación automática completada');
      console.log('👥 Madrinas asignadas:', madrinasAsignadas);
      console.log('👨‍⚕️ Médicos asignados:', medicosAsignados);

      return { madrinasAsignadas, medicosAsignados };
    } catch (error) {
      console.error('❌ AssignmentService: Error en asignación automática:', error);
      return { madrinasAsignadas: 0, medicosAsignados: 0 };
    }
  }
}
