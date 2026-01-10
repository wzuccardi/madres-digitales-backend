# ❌ Error al Descargar Reportes PDF/Excel - Diagnóstico y Solución

## 📋 Problema Reportado

**Error mostrado:**
```
Error al descargar: Exception: Error al descargar PDF: DioException [unknown]: null
Error: AppError: Error en el servidor. Intenta más tarde
```

## 🔍 Diagnóstico

### Frontend
El frontend está llamando correctamente a:
```dart
// En reportes_service.dart
Future<List<int>> descargarPDF(String endpoint, {Map<String, dynamic>? params}) async {
  final response = await _dio.get(
    '/reportes/descargar/$endpoint/pdf',  // ← Endpoint correcto
    queryParameters: params,
    options: Options(responseType: ResponseType.bytes),  // ← Espera bytes
  );
  return response.data as List<int>;
}
```

### Backend
El backend tiene endpoints pero **NO están devolviendo PDFs reales**:

#### ✅ Endpoints que Existen
```javascript
GET /api/reportes/descargar/resumen-general/pdf
GET /api/reportes/descargar/resumen-general/excel
GET /api/reportes/descargar/estadisticas-gestantes
GET /api/reportes/descargar/estadisticas-controles
GET /api/reportes/descargar/estadisticas-alertas
```

#### ❌ Problemas Encontrados

1. **Resumen General PDF** (`/api/reportes/descargar/resumen-general/pdf`)
   - Devuelve texto plano, NO un PDF real
   - Usa `Buffer.from(pdfContent, 'utf8')` que no genera un PDF válido
   - Necesita una librería como `pdfkit`, `puppeteer` o `jspdf`

2. **Estadísticas de Gestantes** (`/api/reportes/descargar/estadisticas-gestantes`)
   - Devuelve JSON, NO un archivo descargable
   - No tiene endpoints `/pdf` o `/excel`

3. **Estadísticas de Controles y Alertas**
   - Mismos problemas que estadísticas de gestantes

## 🎯 Endpoints Necesarios

Para que funcione correctamente, el backend necesita:

```javascript
// Resumen General
GET /api/reportes/descargar/resumen-general/pdf    // ✅ Existe pero mal implementado
GET /api/reportes/descargar/resumen-general/excel  // ✅ Existe pero mal implementado

// Estadísticas de Gestantes
GET /api/reportes/descargar/estadisticas-gestantes/pdf    // ❌ NO EXISTE
GET /api/reportes/descargar/estadisticas-gestantes/excel  // ❌ NO EXISTE

// Estadísticas de Controles
GET /api/reportes/descargar/estadisticas-controles/pdf    // ❌ NO EXISTE
GET /api/reportes/descargar/estadisticas-controles/excel  // ❌ NO EXISTE

// Estadísticas de Alertas
GET /api/reportes/descargar/estadisticas-alertas/pdf      // ❌ NO EXISTE
GET /api/reportes/descargar/estadisticas-alertas/excel    // ❌ NO EXISTE
```

## 🔧 Solución Requerida

### Opción 1: Implementar Generación Real de PDFs (Recomendado)

Usar una librería de generación de PDFs en Node.js:

#### Con PDFKit (Más ligero)
```javascript
const PDFDocument = require('pdfkit');

app.get('/api/reportes/descargar/:tipo/pdf', async (req, res) => {
  try {
    const { tipo } = req.params;
    
    // Obtener datos
    const datos = await obtenerDatosReporte(tipo);
    
    // Crear PDF
    const doc = new PDFDocument();
    
    // Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}.pdf"`);
    
    // Pipe al response
    doc.pipe(res);
    
    // Generar contenido
    doc.fontSize(20).text('Reporte: ' + tipo, 100, 100);
    doc.fontSize(12).text(JSON.stringify(datos, null, 2), 100, 150);
    
    // Finalizar
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### Con Puppeteer (Más potente, genera desde HTML)
```javascript
const puppeteer = require('puppeteer');

app.get('/api/reportes/descargar/:tipo/pdf', async (req, res) => {
  try {
    const { tipo } = req.params;
    const datos = await obtenerDatosReporte(tipo);
    
    // Generar HTML
    const html = generarHTMLReporte(tipo, datos);
    
    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    
    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}.pdf"`);
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Opción 2: Implementar Generación de Excel

Usar `exceljs` para generar archivos Excel reales:

```javascript
const ExcelJS = require('exceljs');

app.get('/api/reportes/descargar/:tipo/excel', async (req, res) => {
  try {
    const { tipo } = req.params;
    const datos = await obtenerDatosReporte(tipo);
    
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');
    
    // Agregar headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Valor', key: 'valor', width: 15 },
    ];
    
    // Agregar datos
    datos.forEach(item => {
      worksheet.addRow(item);
    });
    
    // Enviar Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Opción 3: Solución Temporal - Devolver JSON y Generar en Frontend

Si no se pueden implementar los PDFs en el backend inmediatamente:

```javascript
// Backend: Devolver datos en JSON
app.get('/api/reportes/descargar/:tipo/pdf', async (req, res) => {
  try {
    const { tipo } = req.params;
    const datos = await obtenerDatosReporte(tipo);
    
    // Devolver JSON con flag de que es para PDF
    res.json({
      success: true,
      tipo: 'pdf',
      datos: datos,
      formato: 'json-to-pdf'  // Flag para el frontend
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

```dart
// Frontend: Generar PDF localmente
Future<List<int>> descargarPDF(String endpoint, {Map<String, dynamic>? params}) async {
  try {
    final response = await _dio.get(
      '/reportes/descargar/$endpoint/pdf',
      queryParameters: params,
    );
    
    // Si el backend devuelve JSON, generar PDF localmente
    if (response.data is Map) {
      final datos = response.data['datos'];
      return await _generarPDFLocal(datos);  // Usar pdf package
    }
    
    // Si devuelve bytes, usarlos directamente
    return response.data as List<int>;
  } catch (e) {
    throw Exception('Error al descargar PDF: $e');
  }
}
```

## 📦 Dependencias Necesarias (Backend)

```json
{
  "dependencies": {
    "pdfkit": "^0.13.0",           // Para PDFs simples
    "puppeteer": "^21.0.0",        // Para PDFs desde HTML
    "exceljs": "^4.3.0",           // Para Excel
    "csv-writer": "^1.6.0"         // Para CSV (alternativa)
  }
}
```

## 🚀 Implementación Recomendada

### Paso 1: Instalar Dependencias
```bash
cd S/aplicacionWZC/madres-digitales-backend
npm install pdfkit exceljs
```

### Paso 2: Crear Servicio de Reportes
Crear `src/services/reportes-pdf.service.js`:
```javascript
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

class ReportesPDFService {
  async generarPDF(tipo, datos) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Generar contenido según tipo
      this._generarContenidoPDF(doc, tipo, datos);
      
      doc.end();
    });
  }
  
  async generarExcel(tipo, datos) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');
    
    // Generar contenido según tipo
    this._generarContenidoExcel(worksheet, tipo, datos);
    
    return await workbook.xlsx.writeBuffer();
  }
  
  _generarContenidoPDF(doc, tipo, datos) {
    doc.fontSize(20).text(`Reporte: ${tipo}`, 100, 100);
    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, 100, 130);
    // ... más contenido
  }
  
  _generarContenidoExcel(worksheet, tipo, datos) {
    worksheet.columns = [
      { header: 'Campo', key: 'campo', width: 30 },
      { header: 'Valor', key: 'valor', width: 20 },
    ];
    // ... más contenido
  }
}

module.exports = new ReportesPDFService();
```

### Paso 3: Actualizar Endpoints
```javascript
const reportesPDFService = require('./services/reportes-pdf.service');

app.get('/api/reportes/descargar/:tipo/pdf', async (req, res) => {
  try {
    const { tipo } = req.params;
    const datos = await obtenerDatosReporte(tipo);
    const pdf = await reportesPDFService.generarPDF(tipo, datos);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}.pdf"`);
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## ⏰ Solución Temporal Inmediata

Mientras se implementa la solución completa, deshabilitar los botones de descarga:

```dart
// En reportes_screen.dart
OutlinedButton.icon(
  onPressed: null,  // Deshabilitar temporalmente
  icon: const Icon(Icons.picture_as_pdf, size: 18),
  label: const Text('PDF (Próximamente)'),
  style: OutlinedButton.styleFrom(
    foregroundColor: Colors.grey,
  ),
),
```

O mostrar un mensaje informativo:

```dart
OutlinedButton.icon(
  onPressed: () {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('La descarga de reportes estará disponible próximamente'),
        backgroundColor: Colors.orange,
      ),
    );
  },
  icon: const Icon(Icons.picture_as_pdf, size: 18),
  label: const Text('PDF'),
),
```

## 📝 Resumen

**Problema:** Los endpoints de descarga de reportes no están generando archivos reales (PDF/Excel)

**Causa:** 
- Endpoints devuelven JSON o texto plano
- No hay librería de generación de PDFs/Excel implementada
- Algunos endpoints ni siquiera existen

**Solución:**
1. Instalar `pdfkit` y `exceljs`
2. Crear servicio de generación de reportes
3. Actualizar endpoints para devolver archivos binarios reales
4. Implementar para todos los tipos de reportes

**Solución Temporal:**
- Deshabilitar botones de descarga
- Mostrar mensaje "Próximamente"
- O implementar descarga de JSON como alternativa

## 🔗 Referencias

- PDFKit: https://pdfkit.org/
- ExcelJS: https://github.com/exceljs/exceljs
- Puppeteer: https://pptr.dev/
- Flutter PDF: https://pub.dev/packages/pdf
