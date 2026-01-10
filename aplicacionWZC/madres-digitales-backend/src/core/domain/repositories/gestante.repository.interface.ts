import { GestanteEntity } from '../entities/gestante.entity';

/**
 * Filtros para búsqueda de gestantes
 */
export interface GestanteFiltros {
  municipioId?: string;
  madrinaId?: string;
  ipsId?: string;
  activo?: boolean;
  altoRiesgo?: boolean;
  sinAsignar?: boolean;
  busqueda?: string; // Búsqueda por nombre, apellido o documento
}

/**
 * Opciones de paginación
 */
export interface PaginacionOpciones {
  pagina: number;
  limite: number;
  ordenarPor?: string;
  orden?: 'asc' | 'desc';
}

/**
 * Resultado paginado
 */
export interface ResultadoPaginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

/**
 * Interfaz del Repositorio de Gestantes
 * Define el contrato para operaciones de persistencia
 */
export interface IGestanteRepository {
  /**
   * Crea una nueva gestante
   */
  crear(gestante: Omit<GestanteEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<GestanteEntity>;

  /**
   * Busca una gestante por ID
   */
  buscarPorId(id: string): Promise<GestanteEntity | null>;

  /**
   * Busca una gestante por documento
   */
  buscarPorDocumento(documento: string): Promise<GestanteEntity | null>;

  /**
   * Actualiza una gestante
   */
  actualizar(id: string, cambios: Partial<GestanteEntity>): Promise<GestanteEntity>;

  /**
   * Elimina (desactiva) una gestante
   */
  eliminar(id: string): Promise<void>;

  /**
   * Lista gestantes con filtros y paginación
   */
  listar(
    filtros?: GestanteFiltros,
    paginacion?: PaginacionOpciones
  ): Promise<ResultadoPaginado<GestanteEntity>>;

  /**
   * Cuenta gestantes según filtros
   */
  contar(filtros?: GestanteFiltros): Promise<number>;

  /**
   * Asigna una gestante a una madrina
   */
  asignarMadrina(gestanteId: string, madrinaId: string): Promise<GestanteEntity>;

  /**
   * Desasigna una gestante de su madrina
   */
  desasignarMadrina(gestanteId: string): Promise<GestanteEntity>;

  /**
   * Busca gestantes cercanas a una ubicación
   */
  buscarCercanas(
    latitud: number,
    longitud: number,
    radioKm: number
  ): Promise<GestanteEntity[]>;

  /**
   * Busca gestantes de alto riesgo
   */
  buscarAltoRiesgo(municipioId?: string): Promise<GestanteEntity[]>;

  /**
   * Busca gestantes sin asignar
   */
  buscarSinAsignar(municipioId?: string): Promise<GestanteEntity[]>;

  /**
   * Verifica si existe una gestante con el documento dado
   */
  existeDocumento(documento: string, excluyendoId?: string): Promise<boolean>;
}

