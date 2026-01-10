const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Servicio para generar reportes en PDF y Excel
 */
class ReportesGeneratorService {
  /**
   * Genera un PDF del resumen general
   */
  async generateResumenGeneralPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('RESUMEN GENERAL DEL SISTEMA', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Fecha de generación: ${new Date(data.fecha_generacion).toLocaleString('es-CO')}`, { align: 'center' });
        doc.moveDown(2);

        // Sección de Gestantes
        doc.fontSize(14).font('Helvetica-Bold').text('GESTANTES', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total de gestantes: ${data.total_gestantes || 0}`);
        doc.text(`Gestantes activas: ${data.gestantes_activas || 0}`);
        doc.text(`Gestantes nuevas (este mes): ${data.gestantes_nuevas || 0}`);
        doc.text(`Gestantes de alto riesgo: ${data.gestantes_alto_riesgo || 0}`);
        doc.moveDown();

        // Sección de Controles
        doc.fontSize(14).font('Helvetica-Bold').text('CONTROLES PRENATALES', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total de controles: ${data.total_controles || 0}`);
        doc.text(`Controles realizados: ${data.controles_realizados || 0}`);
        doc.text(`Controles pendientes: ${data.controles_pendientes || 0}`);
        doc.text(`Controles este mes: ${data.controles_este_mes || 0}`);
        doc.text(`Promedio de controles por gestante: ${data.promedio_controles_por_gestante || 0}`);
        doc.moveDown();

        // Sección de Alertas
        doc.fontSize(14).font('Helvetica-Bold').text('ALERTAS', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total de alertas activas: ${data.total_alertas_activas || 0}`);
        doc.text(`Alertas críticas: ${data.alertas_criticas || 0}`);
        doc.moveDown(2);

        // Footer
        doc.fontSize(8).font('Helvetica-Oblique').text(
          'Generado por Sistema Madres Digitales',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un Excel del resumen general
   */
  async generateResumenGeneralExcel(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen General');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Categoría', key: 'categoria', width: 35 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];

    // Estilo del header
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Agregar datos
    worksheet.addRow({ categoria: 'GESTANTES', valor: '' });
    worksheet.addRow({ categoria: 'Total de gestantes', valor: data.total_gestantes || 0 });
    worksheet.addRow({ categoria: 'Gestantes activas', valor: data.gestantes_activas || 0 });
    worksheet.addRow({ categoria: 'Gestantes nuevas (este mes)', valor: data.gestantes_nuevas || 0 });
    worksheet.addRow({ categoria: 'Gestantes de alto riesgo', valor: data.gestantes_alto_riesgo || 0 });
    worksheet.addRow({ categoria: '', valor: '' });
    
    worksheet.addRow({ categoria: 'CONTROLES PRENATALES', valor: '' });
    worksheet.addRow({ categoria: 'Total de controles', valor: data.total_controles || 0 });
    worksheet.addRow({ categoria: 'Controles realizados', valor: data.controles_realizados || 0 });
    worksheet.addRow({ categoria: 'Controles pendientes', valor: data.controles_pendientes || 0 });
    worksheet.addRow({ categoria: 'Controles este mes', valor: data.controles_este_mes || 0 });
    worksheet.addRow({ categoria: 'Promedio de controles por gestante', valor: data.promedio_controles_por_gestante || 0 });
    worksheet.addRow({ categoria: '', valor: '' });
    
    worksheet.addRow({ categoria: 'ALERTAS', valor: '' });
    worksheet.addRow({ categoria: 'Total de alertas activas', valor: data.total_alertas_activas || 0 });
    worksheet.addRow({ categoria: 'Alertas críticas', valor: data.alertas_criticas || 0 });
    worksheet.addRow({ categoria: '', valor: '' });
    
    worksheet.addRow({ categoria: 'Fecha de generación', valor: new Date(data.fecha_generacion).toLocaleString('es-CO') });

    // Estilo para las filas de categoría
    [2, 8, 15].forEach(rowNum => {
      worksheet.getRow(rowNum).font = { bold: true };
      worksheet.getRow(rowNum).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' }
      };
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Genera un PDF de estadísticas de gestantes
   */
  async generateEstadisticasGestantesPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('ESTADÍSTICAS DE GESTANTES', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Fecha de generación: ${new Date(data.fechaGeneracion).toLocaleString('es-CO')}`, { align: 'center' });
        doc.moveDown(2);

        // Resumen
        doc.fontSize(14).font('Helvetica-Bold').text('RESUMEN', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total: ${data.resumen.total}`);
        doc.text(`Activas: ${data.resumen.activas}`);
        doc.text(`Inactivas: ${data.resumen.inactivas}`);
        doc.text(`Riesgo alto: ${data.resumen.riesgoAlto}`);
        doc.text(`Riesgo normal: ${data.resumen.riesgoNormal}`);
        doc.moveDown();

        // Distribución por municipio
        if (data.distribucionMunicipio && data.distribucionMunicipio.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR MUNICIPIO', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          data.distribucionMunicipio.forEach(item => {
            doc.text(`Municipio ${item.municipio_id}: ${item._count.id} gestantes`);
          });
          doc.moveDown();
        }

        // Distribución por régimen
        if (data.distribucionRegimen && data.distribucionRegimen.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR RÉGIMEN DE SALUD', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          data.distribucionRegimen.forEach(item => {
            doc.text(`${item.regimen_salud || 'Sin régimen'}: ${item._count.id} gestantes`);
          });
        }

        // Footer
        doc.fontSize(8).font('Helvetica-Oblique').text(
          'Generado por Sistema Madres Digitales',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un Excel de estadísticas de gestantes
   */
  async generateEstadisticasGestantesExcel(data) {
    const workbook = new ExcelJS.Workbook();
    
    // Hoja de resumen
    const resumenSheet = workbook.addWorksheet('Resumen');
    resumenSheet.columns = [
      { header: 'Indicador', key: 'indicador', width: 25 },
      { header: 'Valor', key: 'valor', width: 15 }
    ];
    
    resumenSheet.getRow(1).font = { bold: true, size: 12 };
    resumenSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    resumenSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    resumenSheet.addRows([
      { indicador: 'Total', valor: data.resumen.total },
      { indicador: 'Activas', valor: data.resumen.activas },
      { indicador: 'Inactivas', valor: data.resumen.inactivas },
      { indicador: 'Riesgo alto', valor: data.resumen.riesgoAlto },
      { indicador: 'Riesgo normal', valor: data.resumen.riesgoNormal }
    ]);

    // Hoja de distribución por municipio
    if (data.distribucionMunicipio && data.distribucionMunicipio.length > 0) {
      const municipioSheet = workbook.addWorksheet('Por Municipio');
      municipioSheet.columns = [
        { header: 'Municipio ID', key: 'municipio', width: 20 },
        { header: 'Cantidad', key: 'cantidad', width: 15 }
      ];
      
      municipioSheet.getRow(1).font = { bold: true, size: 12 };
      municipioSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      municipioSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      data.distribucionMunicipio.forEach(item => {
        municipioSheet.addRow({
          municipio: item.municipio_id,
          cantidad: item._count.id
        });
      });
    }

    // Hoja de distribución por régimen
    if (data.distribucionRegimen && data.distribucionRegimen.length > 0) {
      const regimenSheet = workbook.addWorksheet('Por Régimen');
      regimenSheet.columns = [
        { header: 'Régimen de Salud', key: 'regimen', width: 25 },
        { header: 'Cantidad', key: 'cantidad', width: 15 }
      ];
      
      regimenSheet.getRow(1).font = { bold: true, size: 12 };
      regimenSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      regimenSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      data.distribucionRegimen.forEach(item => {
        regimenSheet.addRow({
          regimen: item.regimen_salud || 'Sin régimen',
          cantidad: item._count.id
        });
      });
    }

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Genera un PDF de estadísticas de controles
   */
  async generateEstadisticasControlesPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('ESTADÍSTICAS DE CONTROLES PRENATALES', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Fecha de generación: ${new Date(data.fechaGeneracion).toLocaleString('es-CO')}`, { align: 'center' });
        doc.moveDown(2);

        // Resumen
        doc.fontSize(14).font('Helvetica-Bold').text('RESUMEN', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total: ${data.resumen.total}`);
        doc.text(`Realizados: ${data.resumen.realizados}`);
        doc.text(`Pendientes: ${data.resumen.pendientes}`);
        doc.text(`Vencidos: ${data.resumen.vencidos}`);
        doc.text(`Porcentaje realizados: ${data.resumen.porcentajeRealizados}%`);
        doc.moveDown();

        // Distribución por médico
        if (data.distribucionMedico && data.distribucionMedico.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR MÉDICO', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          data.distribucionMedico.forEach(item => {
            doc.text(`Médico ${item.medico_id || 'Sin asignar'}: ${item._count.id} controles`);
          });
        }

        // Footer
        doc.fontSize(8).font('Helvetica-Oblique').text(
          'Generado por Sistema Madres Digitales',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un Excel de estadísticas de controles
   */
  async generateEstadisticasControlesExcel(data) {
    const workbook = new ExcelJS.Workbook();
    
    // Hoja de resumen
    const resumenSheet = workbook.addWorksheet('Resumen');
    resumenSheet.columns = [
      { header: 'Indicador', key: 'indicador', width: 30 },
      { header: 'Valor', key: 'valor', width: 15 }
    ];
    
    resumenSheet.getRow(1).font = { bold: true, size: 12 };
    resumenSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    resumenSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    resumenSheet.addRows([
      { indicador: 'Total', valor: data.resumen.total },
      { indicador: 'Realizados', valor: data.resumen.realizados },
      { indicador: 'Pendientes', valor: data.resumen.pendientes },
      { indicador: 'Vencidos', valor: data.resumen.vencidos },
      { indicador: 'Porcentaje realizados', valor: `${data.resumen.porcentajeRealizados}%` }
    ]);

    // Hoja de distribución por médico
    if (data.distribucionMedico && data.distribucionMedico.length > 0) {
      const medicoSheet = workbook.addWorksheet('Por Médico');
      medicoSheet.columns = [
        { header: 'Médico ID', key: 'medico', width: 20 },
        { header: 'Cantidad de Controles', key: 'cantidad', width: 20 }
      ];
      
      medicoSheet.getRow(1).font = { bold: true, size: 12 };
      medicoSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      medicoSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      data.distribucionMedico.forEach(item => {
        medicoSheet.addRow({
          medico: item.medico_id || 'Sin asignar',
          cantidad: item._count.id
        });
      });
    }

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Genera un PDF de estadísticas de alertas
   */
  async generateEstadisticasAlertasPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('ESTADÍSTICAS DE ALERTAS', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Fecha de generación: ${new Date(data.fechaGeneracion).toLocaleString('es-CO')}`, { align: 'center' });
        doc.moveDown(2);

        // Resumen
        doc.fontSize(14).font('Helvetica-Bold').text('RESUMEN', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total: ${data.resumen.total}`);
        doc.text(`Activas: ${data.resumen.activas}`);
        doc.text(`Resueltas: ${data.resumen.resueltas}`);
        doc.text(`Porcentaje resueltas: ${data.resumen.porcentajeResueltas}%`);
        doc.moveDown();

        // Distribución por tipo
        if (data.distribucionTipo && data.distribucionTipo.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR TIPO', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          data.distribucionTipo.forEach(item => {
            doc.text(`${item.tipo_alerta}: ${item._count.id} alertas`);
          });
          doc.moveDown();
        }

        // Distribución por prioridad
        if (data.distribucionPrioridad && data.distribucionPrioridad.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR PRIORIDAD', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          data.distribucionPrioridad.forEach(item => {
            doc.text(`${item.nivel_prioridad}: ${item._count.id} alertas`);
          });
        }

        // Footer
        doc.fontSize(8).font('Helvetica-Oblique').text(
          'Generado por Sistema Madres Digitales',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un Excel de estadísticas de alertas
   */
  async generateEstadisticasAlertasExcel(data) {
    const workbook = new ExcelJS.Workbook();
    
    // Hoja de resumen
    const resumenSheet = workbook.addWorksheet('Resumen');
    resumenSheet.columns = [
      { header: 'Indicador', key: 'indicador', width: 30 },
      { header: 'Valor', key: 'valor', width: 15 }
    ];
    
    resumenSheet.getRow(1).font = { bold: true, size: 12 };
    resumenSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    resumenSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    resumenSheet.addRows([
      { indicador: 'Total', valor: data.resumen.total },
      { indicador: 'Activas', valor: data.resumen.activas },
      { indicador: 'Resueltas', valor: data.resumen.resueltas },
      { indicador: 'Porcentaje resueltas', valor: `${data.resumen.porcentajeResueltas}%` }
    ]);

    // Hoja de distribución por tipo
    if (data.distribucionTipo && data.distribucionTipo.length > 0) {
      const tipoSheet = workbook.addWorksheet('Por Tipo');
      tipoSheet.columns = [
        { header: 'Tipo de Alerta', key: 'tipo', width: 30 },
        { header: 'Cantidad', key: 'cantidad', width: 15 }
      ];
      
      tipoSheet.getRow(1).font = { bold: true, size: 12 };
      tipoSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      tipoSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      data.distribucionTipo.forEach(item => {
        tipoSheet.addRow({
          tipo: item.tipo_alerta,
          cantidad: item._count.id
        });
      });
    }

    // Hoja de distribución por prioridad
    if (data.distribucionPrioridad && data.distribucionPrioridad.length > 0) {
      const prioridadSheet = workbook.addWorksheet('Por Prioridad');
      prioridadSheet.columns = [
        { header: 'Nivel de Prioridad', key: 'prioridad', width: 25 },
        { header: 'Cantidad', key: 'cantidad', width: 15 }
      ];
      
      prioridadSheet.getRow(1).font = { bold: true, size: 12 };
      prioridadSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      prioridadSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      data.distribucionPrioridad.forEach(item => {
        prioridadSheet.addRow({
          prioridad: item.nivel_prioridad,
          cantidad: item._count.id
        });
      });
    }

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Genera un PDF del dashboard de reportes
   */
  async generateDashboardReportesPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('DASHBOARD DE REPORTES', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Fecha de generación: ${new Date(data.fechaGeneracion).toLocaleString('es-CO')}`, { align: 'center' });
        doc.moveDown();

        // Filtros aplicados
        if (data.filtrosAplicados) {
          doc.fontSize(12).font('Helvetica-Bold').text('FILTROS APLICADOS:', { underline: true });
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica');
          if (data.filtrosAplicados.municipioId) {
            doc.text(`Municipio: ${data.filtrosAplicados.municipioId}`);
          }
          if (data.filtrosAplicados.madrinaId) {
            doc.text(`Madrina: ${data.filtrosAplicados.madrinaId}`);
          }
          if (data.filtrosAplicados.fechaInicio) {
            doc.text(`Fecha inicio: ${new Date(data.filtrosAplicados.fechaInicio).toLocaleDateString('es-CO')}`);
          }
          if (data.filtrosAplicados.fechaFin) {
            doc.text(`Fecha fin: ${new Date(data.filtrosAplicados.fechaFin).toLocaleDateString('es-CO')}`);
          }
          doc.moveDown();
        }

        // Resumen general
        doc.fontSize(14).font('Helvetica-Bold').text('RESUMEN GENERAL', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total de gestantes: ${data.totalGestantes}`);
        doc.moveDown();

        // Indicadores de porcentaje
        const indicadoresPorcentaje = data.indicadores.filter(i => i.tipo === 'porcentaje');
        if (indicadoresPorcentaje.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('INDICADORES DE CALIDAD (%)', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica');
          
          indicadoresPorcentaje.forEach(indicador => {
            const porcentaje = indicador.porcentaje.toFixed(1);
            doc.text(`${indicador.nombre}: ${indicador.valor}/${indicador.total} (${porcentaje}%)`);
          });
          doc.moveDown();
        }

        // Indicadores numéricos
        const indicadoresNumericos = data.indicadores.filter(i => i.tipo === 'numero');
        if (indicadoresNumericos.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('INDICADORES DEMOGRÁFICOS', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica');
          
          indicadoresNumericos.forEach(indicador => {
            doc.text(`${indicador.nombre}: ${indicador.valor}`);
          });
        }

        // Footer
        doc.fontSize(8).font('Helvetica-Oblique').text(
          'Generado por Sistema Madres Digitales - Dashboard de Reportes',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un Excel del dashboard de reportes
   */
  async generateDashboardReportesExcel(data) {
    const workbook = new ExcelJS.Workbook();
    
    // Hoja de resumen
    const resumenSheet = workbook.addWorksheet('Resumen');
    resumenSheet.columns = [
      { header: 'Información', key: 'info', width: 30 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];
    
    // Estilo del header
    resumenSheet.getRow(1).font = { bold: true, size: 12 };
    resumenSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    resumenSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Información general
    resumenSheet.addRow({ info: 'Fecha de generación', valor: new Date(data.fechaGeneracion).toLocaleString('es-CO') });
    resumenSheet.addRow({ info: 'Total de gestantes', valor: data.totalGestantes });
    resumenSheet.addRow({ info: '', valor: '' });

    // Filtros aplicados
    if (data.filtrosAplicados) {
      resumenSheet.addRow({ info: 'FILTROS APLICADOS', valor: '' });
      if (data.filtrosAplicados.municipioId) {
        resumenSheet.addRow({ info: 'Municipio', valor: data.filtrosAplicados.municipioId });
      }
      if (data.filtrosAplicados.madrinaId) {
        resumenSheet.addRow({ info: 'Madrina', valor: data.filtrosAplicados.madrinaId });
      }
      if (data.filtrosAplicados.fechaInicio) {
        resumenSheet.addRow({ info: 'Fecha inicio', valor: new Date(data.filtrosAplicados.fechaInicio).toLocaleDateString('es-CO') });
      }
      if (data.filtrosAplicados.fechaFin) {
        resumenSheet.addRow({ info: 'Fecha fin', valor: new Date(data.filtrosAplicados.fechaFin).toLocaleDateString('es-CO') });
      }
      resumenSheet.addRow({ info: '', valor: '' });
    }

    // Hoja de indicadores de porcentaje
    const indicadoresPorcentaje = data.indicadores.filter(i => i.tipo === 'porcentaje');
    if (indicadoresPorcentaje.length > 0) {
      const porcentajeSheet = workbook.addWorksheet('Indicadores de Calidad');
      porcentajeSheet.columns = [
        { header: 'Indicador', key: 'nombre', width: 50 },
        { header: 'Valor', key: 'valor', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Porcentaje', key: 'porcentaje', width: 15 }
      ];
      
      // Estilo del header
      porcentajeSheet.getRow(1).font = { bold: true, size: 12 };
      porcentajeSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      porcentajeSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      indicadoresPorcentaje.forEach(indicador => {
        porcentajeSheet.addRow({
          nombre: indicador.nombre,
          valor: indicador.valor,
          total: indicador.total,
          porcentaje: `${indicador.porcentaje.toFixed(1)}%`
        });
      });
    }

    // Hoja de indicadores numéricos
    const indicadoresNumericos = data.indicadores.filter(i => i.tipo === 'numero');
    if (indicadoresNumericos.length > 0) {
      const numericosSheet = workbook.addWorksheet('Indicadores Demográficos');
      numericosSheet.columns = [
        { header: 'Indicador', key: 'nombre', width: 50 },
        { header: 'Cantidad', key: 'valor', width: 15 }
      ];
      
      // Estilo del header
      numericosSheet.getRow(1).font = { bold: true, size: 12 };
      numericosSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      numericosSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      indicadoresNumericos.forEach(indicador => {
        numericosSheet.addRow({
          nombre: indicador.nombre,
          valor: indicador.valor
        });
      });
    }

    return await workbook.xlsx.writeBuffer();
  }
}

module.exports = new ReportesGeneratorService();
