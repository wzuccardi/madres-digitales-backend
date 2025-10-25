// Archivo temporal para mapear nombres de Prisma
// Este archivo corrige la discrepancia entre nombres singulares en el código
// y nombres plurales generados por Prisma

import { PrismaClient } from '@prisma/client';

// Crear una instancia de Prisma con mapeo de nombres
const prismaOriginal = new PrismaClient();

// Crear un proxy que mapee nombres singulares a plurales
export const prisma = new Proxy(prismaOriginal, {
  get(target, prop) {
    // Mapeo de nombres singulares a plurales
    const nameMapping: Record<string, string> = {
      'alerta': 'alertas',
      'gestante': 'gestantes',
      'usuario': 'usuarios',
      'medico': 'medicos',
      'municipio': 'municipios',
      'controlPrenatal': 'control_prenatal',
      'conversacion': 'conversaciones',
      'refreshToken': 'refresh_tokens',
      'syncLog': 'sync_logs',
      'syncQueue': 'sync_queue',
      'syncConflict': 'sync_conflicts',
      'dispositivo': 'dispositivos'
    };

    const propString = String(prop);
    const mappedProp = nameMapping[propString] || propString;
    
    return target[mappedProp as keyof typeof target];
  }
});

export default prisma;