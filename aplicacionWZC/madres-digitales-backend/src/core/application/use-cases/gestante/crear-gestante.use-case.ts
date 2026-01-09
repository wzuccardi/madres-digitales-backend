import { GestanteEntity } from '../../../domain/entities/gestante.entity';
import { IGestanteRepository } from '../../../domain/repositories/gestante.repository.interface';
import { ConflictError, ValidationError } from '../../../domain/errors/base.error';

/**
 * DTO de entrada para crear gestante
 */
export interface CrearGestanteDTO {
  nombre: string;
  apellido: string;
  documento: string;
  tipoDocumento: string;
  fechaNacimiento: Date;
  telefono?: string;
  direccion?: string;
  municipioId: string;
  ipsId?: string;
  madrinaId?: string;
  fechaUltimaMenstruacion?: Date;
  fechaProbableParto?: Date;
  numeroEmbarazos: number;
  numeroPartos: number;
  numeroAbortos: number;
  grupoSanguineo?: string;
  factorRh?: string;
  alergias?: string;
  enfermedadesPreexistentes?: string;
  observaciones?: string;
  latitud?: number;
  longitud?: number;
}

/**
 * Caso de Uso: Crear Gestante
 * 
 * Responsabilidades:
 * - Validar que no exista una gestante con el mismo documento
 * - Crear la entidad de gestante
 * - Persistir en el repositorio
 * - Retornar la gestante creada
 */
export class CrearGestanteUseCase {
  constructor(
    private readonly gestanteRepository: IGestanteRepository
  ) {}

  async execute(dto: CrearGestanteDTO): Promise<GestanteEntity> {
    // 1. Validar que no exista el documento
    const existeDocumento = await this.gestanteRepository.existeDocumento(dto.documento);
    if (existeDocumento) {
      throw new ConflictError(
        `Ya existe una gestante con el documento ${dto.documento}`,
        'documento'
      );
    }

    // 2. Validar fechas si se proporcionan
    if (dto.fechaUltimaMenstruacion && dto.fechaProbableParto) {
      const diferenciaDias = Math.floor(
        (dto.fechaProbableParto.getTime() - dto.fechaUltimaMenstruacion.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      // Un embarazo normal dura aproximadamente 280 días (40 semanas)
      if (diferenciaDias < 200 || diferenciaDias > 320) {
        throw new ValidationError(
          'La diferencia entre la fecha de última menstruación y la fecha probable de parto debe ser aproximadamente 280 días (40 semanas)',
          {
            fechaUltimaMenstruacion: ['Fecha inválida'],
            fechaProbableParto: ['Fecha inválida']
          }
        );
      }
    }

    // 3. Crear la entidad (esto ejecutará las validaciones de dominio)
    const gestante = new GestanteEntity(
      '', // El ID será generado por el repositorio
      dto.nombre,
      dto.apellido,
      dto.documento,
      dto.tipoDocumento,
      dto.fechaNacimiento,
      dto.telefono || null,
      dto.direccion || null,
      dto.municipioId,
      dto.ipsId || null,
      dto.madrinaId || null,
      dto.fechaUltimaMenstruacion || null,
      dto.fechaProbableParto || null,
      dto.numeroEmbarazos,
      dto.numeroPartos,
      dto.numeroAbortos,
      dto.grupoSanguineo || null,
      dto.factorRh || null,
      dto.alergias || null,
      dto.enfermedadesPreexistentes || null,
      dto.observaciones || null,
      dto.latitud || null,
      dto.longitud || null,
      true, // activo por defecto
      new Date(),
      new Date()
    );

    // 4. Persistir en el repositorio
    const gestanteCreada = await this.gestanteRepository.crear(gestante);

    // 5. Log de auditoría
    console.log(`✅ Gestante creada: ${gestanteCreada.getNombreCompleto()} (${gestanteCreada.id})`);

    return gestanteCreada;
  }
}

