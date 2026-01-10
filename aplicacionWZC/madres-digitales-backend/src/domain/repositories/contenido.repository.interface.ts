export interface CrearContenidoData {
  titulo: string;
  descripcion?: string;
  tipo: string;
  categoria?: string;
  nivel?: string;
  archivoUrl?: string;
  miniaturaUrl?: string;
  duracion?: number;
  etiquetas?: string[];
  destacado?: boolean;
  publico?: boolean;
}

export interface ActualizarContenidoData extends Partial<CrearContenidoData> {}

export interface BuscarContenidoFilters {
  query?: string;
  tipo?: string;
  categoria?: string;
  nivel?: string;
  destacado?: boolean;
  publico?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface ProgresoUpdateData {
  progreso?: number;
  completado?: boolean;
  tiempoVisto?: number;
  ultimaPosicion?: number;
  favorito?: boolean;
  notas?: string;
  calificacion?: number;
}

export interface ContenidoRecord {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  categoria?: string;
  nivel?: string;
  archivo_url?: string;
  miniatura_url?: string;
  duracion_minutos?: number;
  etiquetas?: string[];
  publico?: boolean;
  destacado?: boolean;
  fecha_creacion: Date;
  fecha_actualizacion?: Date;
}

export interface ProgresoRecord {
  id: string;
  usuario_id: string;
  contenido_id: string;
  completado?: boolean;
  progreso?: number;
  tiempo_visto?: number;
  ultima_posicion?: number;
  fecha_inicio?: Date;
  fecha_completado?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface IContenidoRepository {
  crear(data: CrearContenidoData): Promise<ContenidoRecord>;
  obtenerPorId(id: string): Promise<ContenidoRecord | null>;
  buscar(filters: BuscarContenidoFilters): Promise<{ contenidos: ContenidoRecord[]; total: number }>;
  actualizar(id: string, data: ActualizarContenidoData): Promise<ContenidoRecord>;
  eliminar(id: string): Promise<void>;
  obtenerProgreso(usuarioId: string, contenidoId: string): Promise<ProgresoRecord | null>;
  upsertProgreso(usuarioId: string, contenidoId: string, data: ProgresoUpdateData): Promise<ProgresoRecord>;
  registrarVista(contenidoId: string): Promise<void>;
  registrarDescarga(contenidoId: string): Promise<void>;
  obtenerProgresosCompletados(contenidoId: string): Promise<Array<{ id: string }>>;
  actualizarMetadata(contenidoId: string): Promise<void>;
}