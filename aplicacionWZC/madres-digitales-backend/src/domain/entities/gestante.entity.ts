export interface Gestante {
  id: string;
  name: string;
  document?: string;
  documentType?: string;
  birthDate: Date;
  phone?: string;
  address?: string;
  coordinates?: Coordinates;
  lastMenstruation?: Date;
  probableDelivery?: Date;
  eps?: string;
  healthRegime: HealthRegime;
  municipalityId?: string;
  madrinaId?: string;
  medicoTratanteId?: string;
  ipsAsignadaId?: string;
  active: boolean;
  highRisk: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum HealthRegime {
  CONTRIBUTIVO = 'contributivo',
  SUBSIDIADO = 'subsidiado',
  ESPECIAL = 'especial',
  NO_AFILIADO = 'no_afiliado',
}

export interface CreateGestanteData {
  name: string;
  document?: string;
  documentType?: string;
  birthDate: Date;
  phone?: string;
  address?: string;
  coordinates?: Coordinates;
  lastMenstruation?: Date;
  probableDelivery?: Date;
  eps?: string;
  healthRegime: HealthRegime;
  municipalityId?: string;
  madrinaId?: string;
  medicoTratanteId?: string;
  ipsAsignadaId?: string;
}

export interface UpdateGestanteData {
  name?: string;
  phone?: string;
  address?: string;
  coordinates?: Coordinates;
  eps?: string;
  healthRegime?: HealthRegime;
  municipalityId?: string;
  madrinaId?: string;
  medicoTratanteId?: string;
  ipsAsignadaId?: string;
  active?: boolean;
  highRisk?: boolean;
}

export interface GestanteFilters {
  madrinaId?: string;
  medicoTratanteId?: string;
  municipalityId?: string;
  ipsAsignadaId?: string;
  active?: boolean;
  highRisk?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface GestanteStats {
  total: number;
  active: number;
  highRisk: number;
  byMadrina: Record<string, number>;
  byMunicipality: Record<string, number>;
  byHealthRegime: Record<HealthRegime, number>;
}

export interface GestanteRiskFactors {
  age: number;
  previousPregnancies: number;
  medicalConditions: string[];
  lifestyleFactors: string[];
  overallRisk: 'low' | 'medium' | 'high';
}

export interface GestanteSummary {
  id: string;
  name: string;
  age: number;
  weeksGestation: number;
  highRisk: boolean;
  lastControl?: Date;
  nextControl?: Date;
  madrinaName?: string;
  medicoName?: string;
  epsName?: string;
  municipalityName?: string;
}