// Servicio para exportar reportes a Excel
import XLSX from 'xlsx';
import { Response } from 'express';

export class ExportExcelService {
  /**
   * Generar reporte en Excel
   */
  generateReporteExcel(data: any, titulo: string): Buffer {
    const ws = XLSX.utils.json_to_sheet(
      Array.isArray(data) ? data : [data]
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, titulo);

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Generar reporte de resumen general
   */
  generateResumenGeneralExcel(data: any): Buffer {
    const resumenData = [
      { Concepto: 'Total de gestantes', Valor: data.total_gestantes },
      { Concepto: 'Gestantes en alto riesgo', Valor: data.gestantes_alto_riesgo },
      { Concepto: 'Total de controles', Valor: data.total_controles },
      { Concepto: 'Controles este mes', Valor: data.controles_este_mes },
      { Concepto: 'Promedio por gestante', Valor: data.promedio_controles_por_gestante },
      { Concepto: 'Total de alertas activas', Valor: data.total_alertas_activas },
      { Concepto: 'Alertas críticas', Valor: data.alertas_criticas },
      { Concepto: 'Fecha de generación', Valor: new Date().toLocaleString('es-CO') }
    ];

    const ws = XLSX.utils.json_to_sheet(resumenData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resumen General');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Generar reporte de estadísticas de gestantes
   */
  generateEstadisticasGestantesExcel(data: any[]): Buffer {
    const gestantesData = data.map(municipio => ({
      'Municipio': municipio.municipio_nombre,
      'Total Gestantes': municipio.total_gestantes,
      'Alto Riesgo': municipio.gestantes_alto_riesgo,
      'Porcentaje Riesgo': `${municipio.porcentaje_riesgo}%`
    }));

    const ws = XLSX.utils.json_to_sheet(gestantesData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estadísticas Gestantes');

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Generar reporte de estadísticas de controles
   */
  generateEstadisticasControlesExcel(data: any): Buffer {
    const controlesData = [
      { Concepto: 'Fecha Inicio', Valor: data.fecha_inicio },
      { Concepto: 'Fecha Fin', Valor: data.fecha_fin },
      { Concepto: 'Total Controles', Valor: data.total_controles }
    ];

    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen
    const ws1 = XLSX.utils.json_to_sheet(controlesData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

    // Hoja 2: Evolución por mes
    const evolucionData = data.evolucion.map((item: any) => ({
      'Período': item.periodo,
      'Total Controles': item.total_controles
    }));
    const ws2 = XLSX.utils.json_to_sheet(evolucionData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Evolución');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Generar reporte de estadísticas de alertas
   */
  generateEstadisticasAlertasExcel(data: any): Buffer {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen
    const resumenData = [
      { Concepto: 'Total de alertas', Valor: data.total_alertas },
      { Concepto: 'Alertas activas', Valor: data.alertas_activas },
      { Concepto: 'Alertas resueltas', Valor: data.alertas_resueltas }
    ];
    const ws1 = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

    // Hoja 2: Distribución por tipo
    const tipoData = data.distribucion_por_tipo.map((item: any) => ({
      'Tipo': item.tipo,
      'Cantidad': item.cantidad,
      'Porcentaje': `${item.porcentaje}%`
    }));
    const ws2 = XLSX.utils.json_to_sheet(tipoData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Por Tipo');

    // Hoja 3: Distribución por prioridad
    const prioridadData = data.distribucion_por_prioridad.map((item: any) => ({
      'Prioridad': item.prioridad,
      'Cantidad': item.cantidad,
      'Porcentaje': `${item.porcentaje}%`
    }));
    const ws3 = XLSX.utils.json_to_sheet(prioridadData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Por Prioridad');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Generar reporte de estadísticas de riesgo
   */
  generateEstadisticasRiesgoExcel(data: any): Buffer {
    const riesgoData = data.distribucion.map((item: any) => ({
      'Categoría': item.categoria,
      'Cantidad': item.cantidad,
      'Porcentaje': `${item.porcentaje}%`
    }));

    const ws = XLSX.utils.json_to_sheet(riesgoData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Distribución Riesgo');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Generar reporte de tendencias
   */
  generateTendenciasExcel(data: any[]): Buffer {
    const tendenciasData = data.map((item: any) => ({
      'Período': item.periodo,
      'Total Controles': item.total_controles,
      'Total Alertas': item.total_alertas
    }));

    const ws = XLSX.utils.json_to_sheet(tendenciasData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tendencias');

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Enviar Excel como respuesta HTTP
   */
  sendExcel(res: Response, buffer: Buffer, nombreArchivo: string) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
}

export default new ExportExcelService();

