/**
 * Modelo base para todas las entidades del sistema
 * Contiene campos comunes y métodos genéricos
 */
export abstract class BaseModel {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: string, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Convierte el modelo a un objeto plano
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Valida los datos del modelo
   */
  public abstract validate(): void;

  /**
   * Crea una copia del modelo con campos actualizados
   */
  public abstract actualizar(cambios: Partial<any>): BaseModel;
}