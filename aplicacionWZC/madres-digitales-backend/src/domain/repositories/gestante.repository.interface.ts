import { Gestante, CreateGestanteData, UpdateGestanteData, GestanteFilters, GestanteStats, GestanteSummary } from '../entities/gestante.entity';

export interface IGestanteRepository {
  findById(id: string): Promise<Gestante | null>;
  findByMadrinaId(madrinaId: string): Promise<Gestante[]>;
  findByMedicoTratanteId(medicoTratanteId: string): Promise<Gestante[]>;
  create(gestanteData: CreateGestanteData): Promise<Gestante>;
  update(id: string, gestanteData: UpdateGestanteData): Promise<Gestante>;
  delete(id: string): Promise<void>;
  findMany(filters?: GestanteFilters): Promise<Gestante[]>;
  count(filters?: GestanteFilters): Promise<number>;
  findActiveGestantes(): Promise<Gestante[]>;
  findHighRiskGestantes(): Promise<Gestante[]>;
  searchGestantes(query: string, filters?: GestanteFilters): Promise<Gestante[]>;
  getStats(filters?: GestanteFilters): Promise<GestanteStats>;
  getGestanteSummary(id: string): Promise<GestanteSummary | null>;
  updateRiskStatus(id: string, highRisk: boolean): Promise<void>;
  assignMadrina(gestanteId: string, madrinaId: string): Promise<void>;
  assignMedico(gestanteId: string, medicoId: string): Promise<void>;
  unassignMadrina(gestanteId: string): Promise<void>;
  unassignMedico(gestanteId: string): Promise<void>;
  findByMunicipality(municipalityId: string): Promise<Gestante[]>;
  findByHealthRegime(healthRegime: string): Promise<Gestante[]>;
  getGestantesByAgeRange(minAge: number, maxAge: number): Promise<Gestante[]>;
  getGestantesByWeeksGestation(weeksMin: number, weeksMax: number): Promise<Gestante[]>;
  updateLastControl(id: string, controlDate: Date): Promise<void>;
  getNextControls(days: number): Promise<Array<{ gestanteId: string; gestanteName: string; nextControl: Date; }>>;
  findNearbyGestantes(latitud: number, longitud: number, radioKm: number, limit: number): Promise<Array<{ id: string; distancia_metros: number }>>;
}

export interface IGestanteAssignmentService {
  assignGestanteToMadrina(gestanteId: string, madrinaId: string): Promise<void>;
  assignGestanteToMedico(gestanteId: string, medicoId: string): Promise<void>;
  autoAssignGestantes(municipalityId?: string): Promise<void>;
  reassignGestantes(madrinaId: string): Promise<void>;
  getAssignmentHistory(gestanteId: string): Promise<Array<{ assignedTo: string; assignedToType: 'madrina' | 'medico'; assignedAt: Date; assignedBy: string; }>>;
  getMadrinaWorkload(madrinaId: string): Promise<{ total: number; highRisk: number; newThisMonth: number; }>;
  getMedicoWorkload(medicoId: string): Promise<{ total: number; highRisk: number; newThisMonth: number; }>;
}

export interface IGestanteRiskService {
  calculateRiskScore(gestanteId: string): Promise<number>;
  updateRiskFactors(gestanteId: string, riskFactors: any): Promise<void>;
  getHighRiskGestantes(): Promise<Gestante[]>;
  generateRiskReport(filters?: GestanteFilters): Promise<any>;
  scheduleRiskAssessment(gestanteId: string): Promise<void>;
  getRiskFactors(gestanteId: string): Promise<any>;
}

export interface IGestanteControlService {
  scheduleNextControl(gestanteId: string, controlDate: Date): Promise<void>;
  getControlSchedule(gestanteId: string, weeksAhead: number): Promise<Array<{ date: Date; type: string; notes?: string; }>>;
  getMissedControls(days: number): Promise<Array<{ gestanteId: string; gestanteName: string; missedDate: Date; }>>;
  generateControlReminders(days: number): Promise<Array<{ gestanteId: string; gestanteName: string; phone: string; nextControl: Date; }>>;
  updateControlFrequency(gestanteId: string, frequency: 'weekly' | 'biweekly' | 'monthly'): Promise<void>;
}