// src/routes/alertas-test.routes.ts
// Rutas simplificadas para probar el sistema de alertas automáticas
import { Router } from 'express';
import {
  evaluarSignosTest,
  casosPrueba,
  infoSistema
} from '../controllers/alertas-test.controller';

const router = Router();

/**
 * @route   POST /api/alertas-test/evaluar
 * @desc    Evaluar signos de alarma (endpoint de prueba)
 * @access  Public (para pruebas)
 * @body    {
 *   presion_sistolica?: number,
 *   presion_diastolica?: number,
 *   frecuencia_cardiaca?: number,
 *   temperatura?: number,
 *   semanas_gestacion?: number,
 *   movimientos_fetales?: boolean,
 *   edemas?: boolean,
 *   sintomas?: string[]
 * }
 */
router.post('/evaluar', evaluarSignosTest);

/**
 * @route   GET /api/alertas-test/casos-prueba
 * @desc    Ejecutar casos de prueba predefinidos
 * @access  Public (para pruebas)
 */
router.get('/casos-prueba', casosPrueba);

/**
 * @route   GET /api/alertas-test/info
 * @desc    Obtener información del sistema de alertas
 * @access  Public (para pruebas)
 */
router.get('/info', infoSistema);

export default router;
