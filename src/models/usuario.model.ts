import { BaseModel } from './base.model';
import { ValidationError } from '../core/domain/errors/base.error';

/**
 * Modelo de Usuario - Representa un usuario en el sistema
 */
export class UsuarioModel extends BaseModel {
  constructor(
    id: string,
    public readonly nombre: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly documento?: string,
    public readonly tipoDocumento?: string,
    public readonly rol: 'madrina' | 'coordinador' | 'admin' | 'super_admin' | 'medico' | 'gestante',
    public readonly municipioId?: string,
    public readonly telefono?: string,
    public readonly activo: boolean = true,
    public readonly ultimoAcceso?: Date,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  /**
   * Validaciones de negocio para el usuario
   */
  public validate(): void {
    const errors: Record<string, string[]> = {};

    // Validar nombre
    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.nombre = ['El nombre es requerido'];
    } else if (this.nombre.length < 3) {
      errors.nombre = ['El nombre debe tener al menos 3 caracteres'];
    } else if (this.nombre.length > 200) {
      errors.nombre = ['El nombre no puede exceder 200 caracteres'];
    }

    // Validar email
    if (!this.email || this.email.trim().length === 0) {
      errors.email = ['El email es requerido'];
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        errors.email = ['El email no tiene un formato válido'];
      }
    }

    // Validar password hash
    if (!this.passwordHash || this.passwordHash.length < 60) {
      errors.passwordHash = ['El hash de contraseña es inválido'];
    }

    // Validar rol
    const rolesValidos = ['madrina', 'coordinador', 'admin', 'super_admin', 'medico', 'gestante'];
    if (!rolesValidos.includes(this.rol)) {
      errors.rol = [`El rol debe ser uno de: ${rolesValidos.join(', ')}`];
    }

    // Validar teléfono si se proporciona
    if (this.telefono && !/^\d{10}$/.test(this.telefono)) {
      errors.telefono = ['El teléfono debe tener exactamente 10 dígitos'];
    }

    // Si hay errores, lanzar excepción
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Datos de usuario inválidos', errors);
    }
  }

  /**
   * Verifica si el usuario es administrador
   */
  public esAdmin(): boolean {
    return this.rol === 'admin' || this.rol === 'super_admin';
  }

  /**
   * Verifica si el usuario es super administrador
   */
  public esSuperAdmin(): boolean {
    return this.rol === 'super_admin';
  }

  /**
   * Verifica si el usuario es madrina
   */
  public esMadrina(): boolean {
    return this.rol === 'madrina';
  }

  /**
   * Verifica si el usuario es médico
   */
  public esMedico(): boolean {
    return this.rol === 'medico';
  }

  /**
   * Verifica si el usuario es gestante
   */
  public esGestante(): boolean {
    return this.rol === 'gestante';
  }

  /**
   * Verifica si el usuario está activo
   */
  public estaActivo(): boolean {
    return this.activo;
  }

  /**
   * Crea una copia del modelo con campos actualizados
   */
  public actualizar(cambios: Partial<Omit<UsuarioModel, 'id' | 'createdAt'>>): UsuarioModel {
    return new UsuarioModel(
      this.id,
      cambios.nombre ?? this.nombre,
      cambios.email ?? this.email,
      cambios.passwordHash ?? this.passwordHash,
      cambios.documento ?? this.documento,
      cambios.tipoDocumento ?? this.tipoDocumento,
      cambios.rol ?? this.rol,
      cambios.municipioId ?? this.municipioId,
      cambios.telefono ?? this.telefono,
      cambios.activo ?? this.activo,
      cambios.ultimoAcceso ?? this.ultimoAcceso,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte el modelo a un objeto plano (sin datos sensibles)
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      documento: this.documento,
      tipoDocumento: this.tipoDocumento,
      rol: this.rol,
      municipioId: this.municipioId,
      telefono: this.telefono,
      activo: this.activo,
      ultimoAcceso: this.ultimoAcceso,
      esAdmin: this.esAdmin(),
      esSuperAdmin: this.esSuperAdmin(),
      esMadrina: this.esMadrina(),
      esMedico: this.esMedico(),
      esGestante: this.esGestante(),
      estaActivo: this.estaActivo(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Crea un modelo a partir de datos de la base de datos
   */
  public static fromDatabase(data: any): UsuarioModel {
    return new UsuarioModel(
      data.id,
      data.nombre,
      data.email,
      data.password_hash,
      data.documento,
      data.tipo_documento,
      data.rol,
      data.municipio_id,
      data.telefono,
      data.activo,
      data.ultimo_acceso,
      data.fecha_creacion,
      data.fecha_actualizacion
    );
  }
}