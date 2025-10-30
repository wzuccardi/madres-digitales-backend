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

    // Contenido
    this.addContent(doc, data);

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

