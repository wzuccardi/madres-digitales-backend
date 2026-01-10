import { describe, it, expect } from '@jest/globals';
import { GestanteEntity } from '../gestante.entity';
import { ValidationError } from '../../errors/base.error';

describe('GestanteEntity', () => {
  const validGestanteData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Constructor y Validación', () => {
    it('debe crear una gestante válida', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        validGestanteData.fechaNacimiento,
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        validGestanteData.numeroEmbarazos,
        validGestanteData.numeroPartos,
        validGestanteData.numeroAbortos,
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        validGestanteData.madrinaId,
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      expect(gestante.nombre).toBe('María');
      expect(gestante.apellido).toBe('García');
      expect(gestante.numeroDocumento).toBe('1234567890');
    });

    it('debe lanzar error si el nombre está vacío', () => {
      expect(() => {
        new GestanteEntity(
          validGestanteData.id,
          '', // nombre vacío
          validGestanteData.apellido,
          validGestanteData.tipoDocumento,
          validGestanteData.numeroDocumento,
          validGestanteData.fechaNacimiento,
          validGestanteData.telefono,
          validGestanteData.direccion,
          validGestanteData.municipioId,
          validGestanteData.barrioVereda,
          validGestanteData.latitud,
          validGestanteData.longitud,
          validGestanteData.fechaUltimaMenstruacion,
          validGestanteData.fechaProbableParto,
          validGestanteData.numeroEmbarazos,
          validGestanteData.numeroPartos,
          validGestanteData.numeroAbortos,
          validGestanteData.numeroCesareas,
          validGestanteData.numeroHijosVivos,
          validGestanteData.grupoSanguineo,
          validGestanteData.enfermedadesPreexistentes,
          validGestanteData.alergias,
          validGestanteData.medicamentosActuales,
          validGestanteData.observaciones,
          validGestanteData.madrinaId,
          validGestanteData.ipsId,
          validGestanteData.activo,
          validGestanteData.createdAt,
          validGestanteData.updatedAt
        );
      }).toThrow(ValidationError);
    });

    it('debe lanzar error si el número de documento está vacío', () => {
      expect(() => {
        new GestanteEntity(
          validGestanteData.id,
          validGestanteData.nombre,
          validGestanteData.apellido,
          validGestanteData.tipoDocumento,
          '', // documento vacío
          validGestanteData.fechaNacimiento,
          validGestanteData.telefono,
          validGestanteData.direccion,
          validGestanteData.municipioId,
          validGestanteData.barrioVereda,
          validGestanteData.latitud,
          validGestanteData.longitud,
          validGestanteData.fechaUltimaMenstruacion,
          validGestanteData.fechaProbableParto,
          validGestanteData.numeroEmbarazos,
          validGestanteData.numeroPartos,
          validGestanteData.numeroAbortos,
          validGestanteData.numeroCesareas,
          validGestanteData.numeroHijosVivos,
          validGestanteData.grupoSanguineo,
          validGestanteData.enfermedadesPreexistentes,
          validGestanteData.alergias,
          validGestanteData.medicamentosActuales,
          validGestanteData.observaciones,
          validGestanteData.madrinaId,
          validGestanteData.ipsId,
          validGestanteData.activo,
          validGestanteData.createdAt,
          validGestanteData.updatedAt
        );
      }).toThrow(ValidationError);
    });
  });

  describe('calcularEdad', () => {
    it('debe calcular la edad correctamente', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        new Date('1995-05-15'), // 29 años en 2024
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        validGestanteData.numeroEmbarazos,
        validGestanteData.numeroPartos,
        validGestanteData.numeroAbortos,
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        validGestanteData.madrinaId,
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      const edad = gestante.calcularEdad();
      expect(edad).toBeGreaterThanOrEqual(28);
      expect(edad).toBeLessThanOrEqual(30);
    });
  });

  describe('calcularSemanasGestacion', () => {
    it('debe calcular las semanas de gestación correctamente', () => {
      const fum = new Date('2024-01-01');
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        validGestanteData.fechaNacimiento,
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        fum,
        validGestanteData.fechaProbableParto,
        validGestanteData.numeroEmbarazos,
        validGestanteData.numeroPartos,
        validGestanteData.numeroAbortos,
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        validGestanteData.madrinaId,
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      const semanas = gestante.calcularSemanasGestacion();
      expect(semanas).toBeGreaterThan(0);
      expect(semanas).toBeLessThanOrEqual(50);
    });
  });

  describe('esAltoRiesgo', () => {
    it('debe identificar alto riesgo por edad menor a 15', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        new Date('2010-01-01'), // 14 años
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        validGestanteData.numeroEmbarazos,
        validGestanteData.numeroPartos,
        validGestanteData.numeroAbortos,
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        validGestanteData.madrinaId,
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      expect(gestante.esAltoRiesgo()).toBe(true);
    });

    it('debe identificar alto riesgo por edad mayor a 40', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        new Date('1980-01-01'), // 44 años
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        validGestanteData.numeroEmbarazos,
        validGestanteData.numeroPartos,
        validGestanteData.numeroAbortos,
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        validGestanteData.madrinaId,
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      expect(gestante.esAltoRiesgo()).toBe(true);
    });

    it('debe identificar alto riesgo por múltiples embarazos', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        validGestanteData.fechaNacimiento,
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        5, // 5 embarazos
        validGestanteData.numeroPartos,
        validGestanteData.numeroAbortos,
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        validGestanteData.madrinaId,
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      expect(gestante.esAltoRiesgo()).toBe(true);
    });

    it('debe identificar alto riesgo por múltiples abortos', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        validGestanteData.fechaNacimiento,
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        validGestanteData.numeroEmbarazos,
        validGestanteData.numeroPartos,
        2, // 2 abortos
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        validGestanteData.madrinaId,
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      expect(gestante.esAltoRiesgo()).toBe(true);
    });

    it('debe identificar bajo riesgo para gestante normal', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        new Date('1995-05-15'), // 29 años
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        2, // 2 embarazos
        1, // 1 parto
        0, // 0 abortos
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        null, // sin enfermedades
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        validGestanteData.madrinaId,
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      expect(gestante.esAltoRiesgo()).toBe(false);
    });
  });

  describe('tieneMadrinaAsignada', () => {
    it('debe retornar true si tiene madrina asignada', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        validGestanteData.fechaNacimiento,
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        validGestanteData.numeroEmbarazos,
        validGestanteData.numeroPartos,
        validGestanteData.numeroAbortos,
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        'madrina-123', // madrina asignada
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      expect(gestante.tieneMadrinaAsignada()).toBe(true);
    });

    it('debe retornar false si no tiene madrina asignada', () => {
      const gestante = new GestanteEntity(
        validGestanteData.id,
        validGestanteData.nombre,
        validGestanteData.apellido,
        validGestanteData.tipoDocumento,
        validGestanteData.numeroDocumento,
        validGestanteData.fechaNacimiento,
        validGestanteData.telefono,
        validGestanteData.direccion,
        validGestanteData.municipioId,
        validGestanteData.barrioVereda,
        validGestanteData.latitud,
        validGestanteData.longitud,
        validGestanteData.fechaUltimaMenstruacion,
        validGestanteData.fechaProbableParto,
        validGestanteData.numeroEmbarazos,
        validGestanteData.numeroPartos,
        validGestanteData.numeroAbortos,
        validGestanteData.numeroCesareas,
        validGestanteData.numeroHijosVivos,
        validGestanteData.grupoSanguineo,
        validGestanteData.enfermedadesPreexistentes,
        validGestanteData.alergias,
        validGestanteData.medicamentosActuales,
        validGestanteData.observaciones,
        null, // sin madrina
        validGestanteData.ipsId,
        validGestanteData.activo,
        validGestanteData.createdAt,
        validGestanteData.updatedAt
      );

      expect(gestante.tieneMadrinaAsignada()).toBe(false);
    });
  });
});

