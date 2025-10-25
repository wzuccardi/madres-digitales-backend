// DTOs para usuario
export interface CrearUsuarioDTO {
  email: string;
  password: string;
  nombre: string;
  documento?: string;
  telefono?: string;
  rol: 'madrina' | 'coordinador' | 'admin' | 'medico';
  municipioId?: string;
  direccion?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
