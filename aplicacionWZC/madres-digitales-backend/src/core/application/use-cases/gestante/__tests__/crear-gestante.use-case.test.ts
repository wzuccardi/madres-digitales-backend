import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CrearGestanteUseCase } from '../crear-gestante.use-case';
import { IGestanteRepository } from '../../../../domain/repositories/gestante.repository.interface';
import { GestanteEntity } from '../../../../domain/entities/gestante.entity';
import { ConflictError, ValidationError } from '../../../../domain/errors/base.error';

describe('CrearGestanteUseCase', () => {
  let useCase: CrearGestanteUseCase;
  let mockRepository: jest.Mocked<IGestanteRepository>;

  const validGestanteInput = {
    nombre: 'María',
    apellido: 'García',
    tipoDocumento: 'CC' as const,
    numeroDocumento: '1234567890',
    fechaNacimiento: new Date('1995-05-15'),
    telefono: '3001234567',
    direccion: 'Calle 123 #45-67',
    municipioId: 'mun-001',
    barrioVereda: 'Centro',
    latitud: 10.3910,
    longitud: -75.4794,
    fechaUltimaMenstruacion: new Date('2024-01-01'),
    fechaProbableParto: new Date('2024-10-08'),
    numeroEmbarazos: 2,
    numeroPartos: 1,
    numeroAbortos: 0,
    numeroCesareas: 0,
    numeroHijosVivos: 1,
    grupoSanguineo: 'O+',
    enfermedadesPreexistentes: null,
    alergias: null,
    medicamentosActuales: null,
    observaciones: null,
    madrinaId: null,
    ipsId: null,
    activo: true,
  };

  beforeEach(() => {
    // Crear mock del repositorio
    mockRepository = {
      crear: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorDocumento: jest.fn(),
      listar: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
      asignarMadrina: jest.fn(),
      desasignarMadrina: jest.fn(),
      asignarIPS: jest.fn(),
      desasignarIPS: jest.fn(),
      buscarPorMadrina: jest.fn(),
      buscarPorIPS: jest.fn(),
      buscarCercanas: jest.fn(),
      buscarAltoRiesgo: jest.fn(),
      buscarSinMadrina: jest.fn(),
      contarPorMunicipio: jest.fn(),
    } as any;

    useCase = new CrearGestanteUseCase(mockRepository);
  });

  describe('execute', () => {
    it('debe crear una gestante válida', async () => {
      // Arrange
      const expectedGestante = new GestanteEntity(
        '123e4567-e89b-12d3-a456-426614174000',
        validGestanteInput.nombre,
        validGestanteInput.apellido,
        validGestanteInput.tipoDocumento,
        validGestanteInput.numeroDocumento,
        validGestanteInput.fechaNacimiento,
        validGestanteInput.telefono,
        validGestanteInput.direccion,
        validGestanteInput.municipioId,
        validGestanteInput.barrioVereda,
        validGestanteInput.latitud,
        validGestanteInput.longitud,
        validGestanteInput.fechaUltimaMenstruacion,
        validGestanteInput.fechaProbableParto,
        validGestanteInput.numeroEmbarazos,
        validGestanteInput.numeroPartos,
        validGestanteInput.numeroAbortos,
        validGestanteInput.numeroCesareas,
        validGestanteInput.numeroHijosVivos,
        validGestanteInput.grupoSanguineo,
        validGestanteInput.enfermedadesPreexistentes,
        validGestanteInput.alergias,
        validGestanteInput.medicamentosActuales,
        validGestanteInput.observaciones,
        validGestanteInput.madrinaId,
        validGestanteInput.ipsId,
        validGestanteInput.activo,
        new Date(),
        new Date()
      );

      mockRepository.buscarPorDocumento.mockResolvedValue(null);
      mockRepository.crear.mockResolvedValue(expectedGestante);

      // Act
      const result = await useCase.execute(validGestanteInput);

      // Assert
      expect(result).toBeDefined();
      expect(result.nombre).toBe(validGestanteInput.nombre);
      expect(result.numeroDocumento).toBe(validGestanteInput.numeroDocumento);
      expect(mockRepository.buscarPorDocumento).toHaveBeenCalledWith(
        validGestanteInput.tipoDocumento,
        validGestanteInput.numeroDocumento
      );
      expect(mockRepository.crear).toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si el documento ya existe', async () => {
      // Arrange
      const existingGestante = new GestanteEntity(
        '123e4567-e89b-12d3-a456-426614174000',
        'Otra',
        'Persona',
        validGestanteInput.tipoDocumento,
        validGestanteInput.numeroDocumento,
        validGestanteInput.fechaNacimiento,
        validGestanteInput.telefono,
        validGestanteInput.direccion,
        validGestanteInput.municipioId,
        validGestanteInput.barrioVereda,
        validGestanteInput.latitud,
        validGestanteInput.longitud,
        validGestanteInput.fechaUltimaMenstruacion,
        validGestanteInput.fechaProbableParto,
        validGestanteInput.numeroEmbarazos,
        validGestanteInput.numeroPartos,
        validGestanteInput.numeroAbortos,
        validGestanteInput.numeroCesareas,
        validGestanteInput.numeroHijosVivos,
        validGestanteInput.grupoSanguineo,
        validGestanteInput.enfermedadesPreexistentes,
        validGestanteInput.alergias,
        validGestanteInput.medicamentosActuales,
        validGestanteInput.observaciones,
        validGestanteInput.madrinaId,
        validGestanteInput.ipsId,
        validGestanteInput.activo,
        new Date(),
        new Date()
      );

      mockRepository.buscarPorDocumento.mockResolvedValue(existingGestante);

      // Act & Assert
      await expect(useCase.execute(validGestanteInput)).rejects.toThrow(ConflictError);
      expect(mockRepository.crear).not.toHaveBeenCalled();
    });

    it('debe lanzar ValidationError si FUM y FPP no son consistentes', async () => {
      // Arrange
      const invalidInput = {
        ...validGestanteInput,
        fechaUltimaMenstruacion: new Date('2024-01-01'),
        fechaProbableParto: new Date('2024-03-01'), // Solo 2 meses después
      };

      mockRepository.buscarPorDocumento.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(ValidationError);
      expect(mockRepository.crear).not.toHaveBeenCalled();
    });

    it('debe aceptar FUM y FPP con diferencia de ~280 días', async () => {
      // Arrange
      const fum = new Date('2024-01-01');
      const fpp = new Date(fum);
      fpp.setDate(fpp.getDate() + 280); // Exactamente 280 días

      const validInput = {
        ...validGestanteInput,
        fechaUltimaMenstruacion: fum,
        fechaProbableParto: fpp,
      };

      const expectedGestante = new GestanteEntity(
        '123e4567-e89b-12d3-a456-426614174000',
        validInput.nombre,
        validInput.apellido,
        validInput.tipoDocumento,
        validInput.numeroDocumento,
        validInput.fechaNacimiento,
        validInput.telefono,
        validInput.direccion,
        validInput.municipioId,
        validInput.barrioVereda,
        validInput.latitud,
        validInput.longitud,
        validInput.fechaUltimaMenstruacion,
        validInput.fechaProbableParto,
        validInput.numeroEmbarazos,
        validInput.numeroPartos,
        validInput.numeroAbortos,
        validInput.numeroCesareas,
        validInput.numeroHijosVivos,
        validInput.grupoSanguineo,
        validInput.enfermedadesPreexistentes,
        validInput.alergias,
        validInput.medicamentosActuales,
        validInput.observaciones,
        validInput.madrinaId,
        validInput.ipsId,
        validInput.activo,
        new Date(),
        new Date()
      );

      mockRepository.buscarPorDocumento.mockResolvedValue(null);
      mockRepository.crear.mockResolvedValue(expectedGestante);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.crear).toHaveBeenCalled();
    });
  });
});

