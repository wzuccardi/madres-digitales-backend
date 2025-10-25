"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const gestante_entity_1 = require("../gestante.entity");
const base_error_1 = require("../../errors/base.error");
(0, globals_1.describe)('GestanteEntity', () => {
    const validGestanteData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
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
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    (0, globals_1.describe)('Constructor y Validación', () => {
        (0, globals_1.it)('debe crear una gestante válida', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, validGestanteData.fechaNacimiento, validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            (0, globals_1.expect)(gestante.nombre).toBe('María');
            (0, globals_1.expect)(gestante.apellido).toBe('García');
            (0, globals_1.expect)(gestante.numeroDocumento).toBe('1234567890');
        });
        (0, globals_1.it)('debe lanzar error si el nombre está vacío', () => {
            (0, globals_1.expect)(() => {
                new gestante_entity_1.GestanteEntity(validGestanteData.id, '', // nombre vacío
                validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, validGestanteData.fechaNacimiento, validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            }).toThrow(base_error_1.ValidationError);
        });
        (0, globals_1.it)('debe lanzar error si el número de documento está vacío', () => {
            (0, globals_1.expect)(() => {
                new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, '', // documento vacío
                validGestanteData.fechaNacimiento, validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            }).toThrow(base_error_1.ValidationError);
        });
    });
    (0, globals_1.describe)('calcularEdad', () => {
        (0, globals_1.it)('debe calcular la edad correctamente', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, new Date('1995-05-15'), // 29 años en 2024
            validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            const edad = gestante.calcularEdad();
            (0, globals_1.expect)(edad).toBeGreaterThanOrEqual(28);
            (0, globals_1.expect)(edad).toBeLessThanOrEqual(30);
        });
    });
    (0, globals_1.describe)('calcularSemanasGestacion', () => {
        (0, globals_1.it)('debe calcular las semanas de gestación correctamente', () => {
            const fum = new Date('2024-01-01');
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, validGestanteData.fechaNacimiento, validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, fum, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            const semanas = gestante.calcularSemanasGestacion();
            (0, globals_1.expect)(semanas).toBeGreaterThan(0);
            (0, globals_1.expect)(semanas).toBeLessThanOrEqual(50);
        });
    });
    (0, globals_1.describe)('esAltoRiesgo', () => {
        (0, globals_1.it)('debe identificar alto riesgo por edad menor a 15', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, new Date('2010-01-01'), // 14 años
            validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            (0, globals_1.expect)(gestante.esAltoRiesgo()).toBe(true);
        });
        (0, globals_1.it)('debe identificar alto riesgo por edad mayor a 40', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, new Date('1980-01-01'), // 44 años
            validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            (0, globals_1.expect)(gestante.esAltoRiesgo()).toBe(true);
        });
        (0, globals_1.it)('debe identificar alto riesgo por múltiples embarazos', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, validGestanteData.fechaNacimiento, validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, 5, // 5 embarazos
            validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            (0, globals_1.expect)(gestante.esAltoRiesgo()).toBe(true);
        });
        (0, globals_1.it)('debe identificar alto riesgo por múltiples abortos', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, validGestanteData.fechaNacimiento, validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, 2, // 2 abortos
            validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            (0, globals_1.expect)(gestante.esAltoRiesgo()).toBe(true);
        });
        (0, globals_1.it)('debe identificar bajo riesgo para gestante normal', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, new Date('1995-05-15'), // 29 años
            validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, 2, // 2 embarazos
            1, // 1 parto
            0, // 0 abortos
            validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, null, // sin enfermedades
            validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, validGestanteData.madrinaId, validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            (0, globals_1.expect)(gestante.esAltoRiesgo()).toBe(false);
        });
    });
    (0, globals_1.describe)('tieneMadrinaAsignada', () => {
        (0, globals_1.it)('debe retornar true si tiene madrina asignada', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, validGestanteData.fechaNacimiento, validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, 'madrina-123', // madrina asignada
            validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            (0, globals_1.expect)(gestante.tieneMadrinaAsignada()).toBe(true);
        });
        (0, globals_1.it)('debe retornar false si no tiene madrina asignada', () => {
            const gestante = new gestante_entity_1.GestanteEntity(validGestanteData.id, validGestanteData.nombre, validGestanteData.apellido, validGestanteData.tipoDocumento, validGestanteData.numeroDocumento, validGestanteData.fechaNacimiento, validGestanteData.telefono, validGestanteData.direccion, validGestanteData.municipioId, validGestanteData.barrioVereda, validGestanteData.latitud, validGestanteData.longitud, validGestanteData.fechaUltimaMenstruacion, validGestanteData.fechaProbableParto, validGestanteData.numeroEmbarazos, validGestanteData.numeroPartos, validGestanteData.numeroAbortos, validGestanteData.numeroCesareas, validGestanteData.numeroHijosVivos, validGestanteData.grupoSanguineo, validGestanteData.enfermedadesPreexistentes, validGestanteData.alergias, validGestanteData.medicamentosActuales, validGestanteData.observaciones, null, // sin madrina
            validGestanteData.ipsId, validGestanteData.activo, validGestanteData.createdAt, validGestanteData.updatedAt);
            (0, globals_1.expect)(gestante.tieneMadrinaAsignada()).toBe(false);
        });
    });
});
