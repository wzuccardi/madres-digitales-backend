const ReportesService = require('./api/reportes.service');

async function testReportes() {
  try {
    console.log('🧪 Probando servicio de reportes...');
    
    const reportesService = new ReportesService();
    
    console.log('1. Probando obtener municipios...');
    const municipios = await reportesService.obtenerMunicipios();
    console.log('✅ Municipios:', municipios.length);
    
    console.log('2. Probando obtener madrinas...');
    const madrinas = await reportesService.obtenerMadrinas();
    console.log('✅ Madrinas:', madrinas.length);
    
    console.log('3. Probando generar reporte...');
    const reporte = await reportesService.generarReporteCompleto({});
    console.log('✅ Reporte generado:', reporte.indicadores.length, 'indicadores');
    
    console.log('🎉 Todas las pruebas pasaron');
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }
}

testReportes();