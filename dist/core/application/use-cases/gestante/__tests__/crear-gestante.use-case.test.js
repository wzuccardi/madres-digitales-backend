"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const crear_gestante_use_case_1 = require("../crear-gestante.use-case");
const gestante_entity_1 = require("../../../../domain/entities/gestante.entity");
const base_error_1 = require("../../../../domain/errors/base.error");
(0, globals_1.describe)('CrearGestanteUseCase', () => {
    let useCase;
    let mockRepository;
    const validGestanteInput = {
        nombre: 'María',
        apellido: 'García',
        tipoDocumento: 'CC',
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
    (0, globals_1.beforeEach)(() => {
        // Crear mock del repositorio
        mockRepository = {
            crear: globals_1.jest.fn(),
            buscarPorId: globals_1.jest.fn(),
            buscarPorDocumento: globals_1.jest.fn(),
            listar: globals_1.jest.fn(),
            actualizar: globals_1.jest.fn(),
            eliminar: globals_1.jest.fn(),
            asignarMadrina: globals_1.jest.fn(),
            desasignarMadrina: globals_1.jest.fn(),
            asignarIPS: globals_1.jest.fn(),
            desasignarIPS: globals_1.jest.fn(),
            buscarPorMadrina: globals_1.jest.fn(),
            buscarPorIPS: globals_1.jest.fn(),
            buscarCercanas: globals_1.jest.fn(),
            buscarAltoRiesgo: globals_1.jest.fn(),
            buscarSinMadrina: globals_1.jest.fn(),
            contarPorMunicipio: globals_1.jest.fn(),
        };
        useCase = new crear_gestante_use_case_1.CrearGestanteUseCase(mockRepository);
    });
    (0, globals_1.describe)('execute', () => {
        (0, globals_1.it)('debe crear una gestante válida', async () => {
            // Arrange
            const expectedGestante = new gestante_entity_1.GestanteEntity('123e4567-e89b-12d3-a456-426614174000', validGestanteInput.nombre, validGestanteInput.apellido, validGestanteInput.tipoDocumento, validGestanteInput.numeroDocumento, validGestanteInput.fechaNacimiento, validGestanteInput.telefono, validGestanteInput.direccion, validGestanteInput.municipioId, validGestanteInput.barrioVereda, validGestanteInput.latitud, validGestanteInput.longitud, validGestanteInput.fechaUltimaMenstruacion, validGestanteInput.fechaProbableParto, validGestanteInput.numeroEmbarazos, validGestanteInput.numeroPartos, validGestanteInput.numeroAbortos, validGestanteInput.numeroCesareas, validGestanteInput.numeroHijosVivos, validGestanteInput.grupoSanguineo, validGestanteInput.enfermedadesPreexistentes, validGestanteInput.alergias, validGestanteInput.medicamentosActuales, validGestanteInput.observaciones, validGestanteInput.madrinaId, validGestanteInput.ipsId, validGestanteInput.activo, new Date(), new Date());
            mockRepository.buscarPorDocumento.mockResolvedValue(null);
            mockRepository.crear.mockResolvedValue(expectedGestante);
            // Act
            const result = await useCase.execute(validGestanteInput);
            // Assert
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.nombre).toBe(validGestanteInput.nombre);
            (0, globals_1.expect)(result.numeroDocumento).toBe(validGestanteInput.numeroDocumento);
            (0, globals_1.expect)(mockRepository.buscarPorDocumento).toHaveBeenCalledWith(validGestanteInput.tipoDocumento, validGestanteInput.numeroDocumento);
            (0, globals_1.expect)(mockRepository.crear).toHaveBeenCalled();
        });
        (0, globals_1.it)('debe lanzar ConflictError si el documento ya existe', async () => {
            // Arrange
            const existingGestante = new gestante_entity_1.GestanteEntity('123e4567-e89b-12d3-a456-426614174000', 'Otra', 'Persona', validGestanteInput.tipoDocumento, validGestanteInput.numeroDocumento, validGestanteInput.fechaNacimiento, validGestanteInput.telefono, validGestanteInput.direccion, validGestanteInput.municipioId, validGestanteInput.barrioVereda, validGestanteInput.latitud, validGestanteInput.longitud, validGestanteInput.fechaUltimaMenstruacion, validGestanteInput.fechaProbableParto, validGestanteInput.numeroEmbarazos, validGestanteInput.numeroPartos, validGestanteInput.numeroAbortos, validGestanteInput.numeroCesareas, validGestanteInput.numeroHijosVivos, validGestanteInput.grupoSanguineo, validGestanteInput.enfermedadesPreexistentes, validGestanteInput.alergias, validGestanteInput.medicamentosActuales, validGestanteInput.observaciones, validGestanteInput.madrinaId, validGestanteInput.ipsId, validGestanteInput.activo, new Date(), new Date());
            mockRepository.buscarPorDocumento.mockResolvedValue(existingGestante);
            // Act & Assert
            await (0, globals_1.expect)(useCase.execute(validGestanteInput)).rejects.toThrow(base_error_1.ConflictError);
            (0, globals_1.expect)(mockRepository.crear).not.toHaveBeenCalled();
        });
        (0, globals_1.it)('debe lanzar ValidationError si FUM y FPP no son consistentes', async () => {
            // Arrange
            const invalidInput = {
                ...validGestanteInput,
                fechaUltimaMenstruacion: new Date('2024-01-01'),
                fechaProbableParto: new Date('2024-03-01'), // Solo 2 meses después
            };
            mockRepository.buscarPorDocumento.mockResolvedValue(null);
            // Act & Assert
            await (0, globals_1.expect)(useCase.execute(invalidInput)).rejects.toThrow(base_error_1.ValidationError);
            (0, globals_1.expect)(mockRepository.crear).not.toHaveBeenCalled();
        });
        (0, globals_1.it)('debe aceptar FUM y FPP con diferencia de ~280 días', async () => {
            // Arrange
            const fum = new Date('2024-01-01');
            const fpp = new Date(fum);
            fpp.setDate(fpp.getDate() + 280); // Exactamente 280 días
            const validInput = {
                ...validGestanteInput,
                fechaUltimaMenstruacion: fum,
                fechaProbableParto: fpp,
            };
            const expectedGestante = new gestante_entity_1.GestanteEntity('123e4567-e89b-12d3-a456-426614174000', validInput.nombre, validInput.apellido, validInput.tipoDocumento, validInput.numeroDocumento, validInput.fechaNacimiento, validInput.telefono, validInput.direccion, validInput.municipioId, validInput.barrioVereda, validInput.latitud, validInput.longitud, validInput.fechaUltimaMenstruacion, validInput.fechaProbableParto, validInput.numeroEmbarazos, validInput.numeroPartos, validInput.numeroAbortos, validInput.numeroCesareas, validInput.numeroHijosVivos, validInput.grupoSanguineo, validInput.enfermedadesPreexistentes, validInput.alergias, validInput.medicamentosActuales, validInput.observaciones, validInput.madrinaId, validInput.ipsId, validInput.activo, new Date(), new Date());
            mockRepository.buscarPorDocumento.mockResolvedValue(null);
            mockRepository.crear.mockResolvedValue(expectedGestante);
            // Act
            const result = await useCase.execute(validInput);
            // Assert
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(mockRepository.crear).toHaveBeenCalled();
        });
    });
});
