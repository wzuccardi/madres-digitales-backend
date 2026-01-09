// Servicio para exportar reportes a PDF
import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class ExportPdfService {
  /**
   * Generar reporte en PDF
   */
  generateReportePDF(data: any, titulo: string, subtitulo?: string): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    // Encabezado
    doc.fontSize(24).font('Helvetica-Bold').text(titulo, { align: 'center' });
    doc.moveDown(0.5);

    if (subtitulo) {
      doc.fontSize(14).font('Helvetica').text(subtitulo, { align: 'center' });
      doc.moveDown(0.5);
    }

    // Línea separadora
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    // Fecha de generación
    doc.fontSize(10).font('Helvetica').text(
      `Generado: ${new Date().toLocaleString('es-CO')}`,
      { align: 'right' }
    );
    doc.moveDown(1);

    // Contenido (se agrega en métodos específicos)
    // El contenido se maneja en cada método específico de generación

    // Pie de página
    doc.fontSize(8).text(
      'Madres Digitales - Sistema de Gestión de Salud Materna',
      40,
      doc.page.height - 40,
      { align: 'center' }
    );

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Generar reporte de resumen general
   */
  generateResumenGeneralPDF(data: any): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Título
    doc.fontSize(24).font('Helvetica-Bold').text('RESUMEN GENERAL DEL SISTEMA', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Fecha
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown(1);

    // Sección 1: Gestantes
    doc.fontSize(14).font('Helvetica-Bold').text('📊 GESTANTES');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total de gestantes: ${data.total_gestantes}`);
    doc.text(`Gestantes en alto riesgo: ${data.gestantes_alto_riesgo}`);
    doc.moveDown(0.5);

    // Sección 2: Controles
    doc.fontSize(14).font('Helvetica-Bold').text('📋 CONTROLES PRENATALES');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total de controles: ${data.total_controles}`);
    doc.text(`Controles este mes: ${data.controles_este_mes}`);
    doc.text(`Promedio por gestante: ${data.promedio_controles_por_gestante}`);
    doc.moveDown(0.5);

    // Sección 3: Alertas
    doc.fontSize(14).font('Helvetica-Bold').text('🚨 ALERTAS');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total de alertas activas: ${data.total_alertas_activas}`);
    doc.text(`Alertas críticas: ${data.alertas_criticas}`);
    doc.moveDown(1);

    // Pie de página
    doc.fontSize(8).text(
      'Madres Digitales - Sistema de Gestión de Salud Materna',
      40,
      doc.page.height - 40,
      { align: 'center' }
    );

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Generar reporte de estadísticas de gestantes
   */
  generateEstadisticasGestantesPDF(data: any[]): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Título
    doc.fontSize(24).font('Helvetica-Bold').text('ESTADÍSTICAS DE GESTANTES POR MUNICIPIO', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Fecha
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown(1);

    // Tabla
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 250;
    const col3 = 350;
    const col4 = 450;
    const rowHeight = 25;

    // Encabezados
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Municipio', col1, tableTop);
    doc.text('Total', col2, tableTop);
    doc.text('Alto Riesgo', col3, tableTop);
    doc.text('% Riesgo', col4, tableTop);

    // Línea separadora
    doc.moveTo(40, tableTop + 20).lineTo(555, tableTop + 20).stroke();

    // Datos
    doc.fontSize(10).font('Helvetica');
    let y = tableTop + 30;

    data.forEach((municipio) => {
      doc.text(municipio.municipio_nombre, col1, y);
      doc.text(municipio.total_gestantes.toString(), col2, y);
      doc.text(municipio.gestantes_alto_riesgo.toString(), col3, y);
      doc.text(`${municipio.porcentaje_riesgo}%`, col4, y);
      y += rowHeight;

      // Nueva página si es necesario
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 40;
      }
    });

    // Pie de página
    doc.fontSize(8).text(
      'Madres Digitales - Sistema de Gestión de Salud Materna',
      40,
      doc.page.height - 40,
      { align: 'center' }
    );

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Generar reporte de estadísticas de alertas
   */
  generateEstadisticasAlertasPDF(data: any): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Título
    doc.fontSize(24).font('Helvetica-Bold').text('ESTADÍSTICAS DE ALERTAS', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Fecha
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown(1);

    // Resumen general
    doc.fontSize(14).font('Helvetica-Bold').text('RESUMEN GENERAL');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total de alertas: ${data.total_alertas}`);
    doc.text(`Alertas activas: ${data.alertas_activas}`);
    doc.text(`Alertas resueltas: ${data.alertas_resueltas}`);
    doc.moveDown(1);

    // Distribución por tipo
    doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR TIPO');
    doc.fontSize(11).font('Helvetica');
    data.distribucion_por_tipo.forEach((tipo: any) => {
      doc.text(`${tipo.tipo}: ${tipo.cantidad} (${tipo.porcentaje}%)`);
    });
    doc.moveDown(1);

    // Distribución por prioridad
    doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR PRIORIDAD');
    doc.fontSize(11).font('Helvetica');
    data.distribucion_por_prioridad.forEach((prioridad: any) => {
      doc.text(`${prioridad.prioridad}: ${prioridad.cantidad} (${prioridad.porcentaje}%)`);
    });

    // Pie de página
    doc.fontSize(8).text(
      'Madres Digitales - Sistema de Gestión de Salud Materna',
      40,
      doc.page.height - 40,
      { align: 'center' }
    );

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Generar reporte de estadísticas de controles
   */
  generateEstadisticasControlesPDF(data: any): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Título
    doc.fontSize(24).font('Helvetica-Bold').text('ESTADÍSTICAS DE CONTROLES PRENATALES', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Fecha
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown(1);

    // Resumen general
    doc.fontSize(14).font('Helvetica-Bold').text('RESUMEN GENERAL');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total de controles: ${data.total_controles}`);
    doc.text(`Controles este mes: ${data.controles_este_mes}`);
    doc.text(`Promedio por gestante: ${data.promedio_controles_por_gestante}`);
    doc.moveDown(1);

    // Distribución por municipio
    if (data.distribucion_por_municipio && data.distribucion_por_municipio.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR MUNICIPIO');
      doc.fontSize(11).font('Helvetica');
      data.distribucion_por_municipio.forEach((municipio: any) => {
        doc.text(`${municipio.municipio_nombre}: ${municipio.total_controles} controles`);
      });
      doc.moveDown(1);
    }

    // Pie de página
    doc.fontSize(8).text(
      'Madres Digitales - Sistema de Gestión de Salud Materna',
      40,
      doc.page.height - 40,
      { align: 'center' }
    );

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Generar reporte de estadísticas de riesgo
   */
  generateEstadisticasRiesgoPDF(data: any): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Título
    doc.fontSize(24).font('Helvetica-Bold').text('ESTADÍSTICAS DE RIESGO', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Fecha
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown(1);

    // Distribución por nivel de riesgo
    doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR NIVEL DE RIESGO');
    doc.fontSize(11).font('Helvetica');
    
    if (data.distribucion_riesgo && data.distribucion_riesgo.length > 0) {
      data.distribucion_riesgo.forEach((nivel: any) => {
        doc.text(`${nivel.nivel_riesgo}: ${nivel.cantidad} gestantes (${nivel.porcentaje}%)`);
      });
    }
    doc.moveDown(1);

    // Factores de riesgo más comunes
    if (data.factores_riesgo_comunes && data.factores_riesgo_comunes.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('FACTORES DE RIESGO MÁS COMUNES');
      doc.fontSize(11).font('Helvetica');
      data.factores_riesgo_comunes.forEach((factor: any, index: number) => {
        doc.text(`${index + 1}. ${factor.factor}: ${factor.cantidad} casos`);
      });
    }

    // Pie de página
    doc.fontSize(8).text(
      'Madres Digitales - Sistema de Gestión de Salud Materna',
      40,
      doc.page.height - 40,
      { align: 'center' }
    );

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Generar reporte de tendencias
   */
  generateTendenciasPDF(data: any): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Título
    doc.fontSize(24).font('Helvetica-Bold').text('ANÁLISIS DE TENDENCIAS', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Fecha
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown(1);

    // Tendencias de gestantes
    if (data.tendencias_gestantes && data.tendencias_gestantes.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('TENDENCIAS DE GESTANTES');
      doc.fontSize(11).font('Helvetica');
      data.tendencias_gestantes.forEach((mes: any) => {
        doc.text(`${mes.mes}/${mes.anio}: ${mes.total} gestantes`);
      });
      doc.moveDown(1);
    }

    // Tendencias de controles
    if (data.tendencias_controles && data.tendencias_controles.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('TENDENCIAS DE CONTROLES');
      doc.fontSize(11).font('Helvetica');
      data.tendencias_controles.forEach((mes: any) => {
        doc.text(`${mes.mes}/${mes.anio}: ${mes.total} controles`);
      });
      doc.moveDown(1);
    }

    // Tendencias de alertas
    if (data.tendencias_alertas && data.tendencias_alertas.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('TENDENCIAS DE ALERTAS');
      doc.fontSize(11).font('Helvetica');
      data.tendencias_alertas.forEach((mes: any) => {
        doc.text(`${mes.mes}/${mes.anio}: ${mes.total} alertas`);
      });
    }

    // Pie de página
    doc.fontSize(8).text(
      'Madres Digitales - Sistema de Gestión de Salud Materna',
      40,
      doc.page.height - 40,
      { align: 'center' }
    );

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Método genérico para generar reportes PDF según tipo
   */
  async generateReportPDF(tipo: string, data: any): Promise<Buffer> {
    switch (tipo) {
      case 'resumen-general':
        return this.generateResumenGeneralPDFNew(data);
      default:
        throw new Error(`Tipo de reporte PDF no soportado: ${tipo}`);
    }
  }

  /**
   * Generar PDF de resumen general (versión mejorada)
   */
  private generateResumenGeneralPDFNew(data: any): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Validar datos
    if (!data) {
      throw new Error('No se proporcionaron datos para generar el PDF');
    }

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Resumen General - Madres Digitales', { align: 'center' });
    doc.moveDown();

    // Fecha de generación
    const fechaGeneracion = data.fecha_generacion 
      ? new Date(data.fecha_generacion).toLocaleDateString()
      : new Date().toLocaleDateString();
    doc.fontSize(12).font('Helvetica').text(`Fecha de generación: ${fechaGeneracion}`, { align: 'right' });
    doc.moveDown();

    // Filtros aplicados
    if (data.filtros_aplicados) {
      doc.fontSize(14).font('Helvetica-Bold').text('Filtros Aplicados:', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      
      if (data.filtros_aplicados.fecha_inicio && data.filtros_aplicados.fecha_fin) {
        doc.text(`Período: ${data.filtros_aplicados.fecha_inicio} - ${data.filtros_aplicados.fecha_fin}`);
      }
      if (data.filtros_aplicados.municipio_id) {
        doc.text(`Municipio ID: ${data.filtros_aplicados.municipio_id}`);
      }
      if (data.filtros_aplicados.madrina_id) {
        doc.text(`Madrina ID: ${data.filtros_aplicados.madrina_id}`);
      }
      doc.moveDown();
    }

    // Estadísticas generales
    doc.fontSize(16).font('Helvetica-Bold').text('Estadísticas Generales', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica');
    doc.text(`Total de gestantes: ${data.total_gestantes || 0}`);
    doc.text(`Gestantes de alto riesgo: ${data.gestantes_alto_riesgo || 0}`);
    doc.text(`Gestantes sin FUM: ${data.gestantes_sin_fum || 0}`);
    doc.text(`Total de controles: ${data.total_controles || 0}`);
    doc.text(`Total de alertas: ${data.total_alertas || 0}`);
    doc.text(`Alertas activas: ${data.alertas_activas || 0}`);
    doc.moveDown();

    // Distribución por municipio
    if (data.distribucion_municipios && data.distribucion_municipios.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Distribución por Municipio', { underline: true });
      doc.moveDown(0.5);

      data.distribucion_municipios.forEach((municipio: any) => {
        doc.fontSize(12).font('Helvetica').text(`${municipio.municipio}: ${municipio.total} gestantes`);
      });
    } else {
      doc.fontSize(12).font('Helvetica').text('No hay datos de distribución por municipio disponibles.');
    }

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Enviar PDF como respuesta HTTP
   */
  sendPDF(res: Response, buffer: Buffer, nombreArchivo: string) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
}

export default new ExportPdfService();

