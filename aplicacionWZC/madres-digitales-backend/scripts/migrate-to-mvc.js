const fs = require('fs');
const path = require('path');

/**
 * Script de migración a la nueva estructura MVC
 * Este script facilita la transición de los archivos existentes
 * a la nueva estructura organizada según el patrón MVC
 */

console.log('🔄 Iniciando migración a estructura MVC...');

// Directorios base
const baseDir = path.join(__dirname, '..');
const srcDir = path.join(baseDir, 'src');

// Estructura MVC objetivo
const mvcStructure = {
  controllers: path.join(srcDir, 'controllers'),
  services: path.join(srcDir, 'services'),
  models: path.join(srcDir, 'models'),
  routes: path.join(srcDir, 'routes'),
  middlewares: path.join(srcDir, 'middlewares'),
  types: path.join(srcDir, 'types'),
  config: path.join(srcDir, 'config'),
  core: path.join(srcDir, 'core')
};

// Archivos a migrar
const filesToMigrate = [
  // Controladores existentes
  { 
    from: 'controllers/reporte.controller.ts',
    to: 'controllers/reporte.controller.ts',
    action: 'Mover controlador de reportes a nueva estructura MVC'
  },
  { 
    from: 'controllers/auth.controller.ts',
    to: 'controllers/auth.controller.ts',
    action: 'Mover controlador de auth a nueva estructura MVC'
  },
  { 
    from: 'controllers/gestante.controller.ts',
    to: 'controllers/gestante.controller.ts',
    action: 'Mover controlador de gestante a nueva estructura MVC'
  },
  { 
    from: 'controllers/alerta.controller.ts',
    to: 'controllers/alerta.controller.ts',
    action: 'Mover controlador de alerta a nueva estructura MVC'
  },
  { 
    from: 'controllers/contenido.controller.ts',
    to: 'controllers/contenido.controller.ts',
    action: 'Mover controlador de contenido a nueva estructura MVC'
  },
  { 
    from: 'controllers/dashboard.controller.ts',
    to: 'controllers/dashboard.controller.ts',
    action: 'Mover controlador de dashboard a nueva estructura MVC'
  },
  { 
    from: 'controllers/medico.controller.ts',
    to: 'controllers/medico.controller.ts',
    action: 'Mover controlador de medico a nueva estructura MVC'
  },
  { 
    from: 'controllers/ips.controller.ts',
    to: 'controllers/ips.controller.ts',
    action: 'Mover controlador de IPS a nueva estructura MVC'
  },
  { 
    from: 'controllers/municipio.controller.ts',
    to: 'controllers/municipio.controller.ts',
    action: 'Mover controlador de municipio a nueva estructura MVC'
  },
  { 
    from: 'controllers/usuario.controller.ts',
    to: 'controllers/usuario.controller.ts',
    action: 'Mover controlador de usuario a nueva estructura MVC'
  },
  { 
    from: 'controllers/control.controller.ts',
    to: 'controllers/control.controller.ts',
    action: 'Mover controlador de control a nueva estructura MVC'
  },
  { 
    from: 'controllers/assignment.controller.ts',
    to: 'controllers/assignment.controller.ts',
    action: 'Mover controlador de assignment a nueva estructura MVC'
  },
  { 
    from: 'controllers/smart-alerts.controller.ts',
    to: 'controllers/smart-alerts.controller.ts',
    action: 'Mover controlador de smart-alerts a nueva estructura MVC'
  },
  { 
    from: 'controllers/alertas-automaticas.controller.ts',
    to: 'controllers/alertas-automaticas.controller.ts',
    action: 'Mover controlador de alertas automáticas a nueva estructura MVC'
  },
  { 
    from: 'controllers/alertas-test.controller.ts',
    to: 'controllers/alertas-test.controller.ts',
    action: 'Mover controlador de alertas-test a nueva estructura MVC'
  },
  { 
    from: 'controllers/sync.controller.ts',
    to: 'controllers/sync.controller.ts',
    action: 'Mover controlador de sync a nueva estructura MVC'
  },
  { 
    from: 'controllers/mensajes.controller.ts',
    to: 'controllers/mensajes.controller.ts',
    action: 'Mover controlador de mensajes a nueva estructura MVC'
  },
  { 
    from: 'controllers/geolocalizacion.controller.ts',
    to: 'controllers/geolocalizacion.controller.ts',
    action: 'Mover controlador de geolocalización a nueva estructura MVC'
  },
  { 
    from: 'controllers/contenido-crud.controller.ts',
    to: 'controllers/contenido-crud.controller.ts',
    action: 'Mover controlador de contenido-crud a nueva estructura MVC'
  },
  { 
    from: 'controllers/ips-crud.controller.ts',
    to: 'controllers/ips-crud.controller.ts',
    action: 'Mover controlador de ips-crud a nueva estructura MVC'
  },
  { 
    from: 'controllers/medico-crud.controller.ts',
    to: 'controllers/medico-crud.controller.ts',
    action: 'Mover controlador de medico-crud a nueva estructura MVC'
  },
  { 
    from: 'controllers/admin.controller.ts',
    to: 'controllers/admin.controller.ts',
    action: 'Mover controlador de admin a nueva estructura MVC'
  },
  { 
    from: 'controllers/websocket.controller.ts',
    to: 'controllers/websocket.controller.ts',
    action: 'Mover controlador de websocket a nueva estructura MVC'
  },
  // Servicios existentes
  { 
    from: 'services/auth.service.ts',
    to: 'services/auth.service.ts',
    action: 'Mover servicio de auth a nueva estructura MVC'
  },
  { 
    from: 'services/gestante.service.ts',
    to: 'services/gestante.service.ts',
    action: 'Mover servicio de gestante a nueva estructura MVC'
  },
  { 
    from: 'services/alerta.service.ts',
    to: 'services/alerta.service.ts',
    action: 'Mover servicio de alerta a nueva estructura MVC'
  },
  { 
    from: 'services/contenido.service.ts',
    to: 'services/contenido.service.ts',
    action: 'Mover servicio de contenido a nueva estructura MVC'
  },
  { 
    from: 'services/control.service.ts',
    to: 'services/control.service.ts',
    action: 'Mover servicio de control a nueva estructura MVC'
  },
  { 
    from: 'services/dashboard.service.ts',
    to: 'services/dashboard.service.ts',
    action: 'Mover servicio de dashboard a nueva estructura MVC'
  },
  { 
    from: 'services/ips.service.ts',
    to: 'services/ips.service.ts',
    action: 'Mover servicio de IPS a nueva estructura MVC'
  },
  { 
    from: 'services/medico.service.ts',
    to: 'services/medico.service.ts',
    action: 'Mover servicio de médico a nueva estructura MVC'
  },
  { 
    from: 'services/municipio.service.ts',
    to: 'services/municipio.service.ts',
    action: 'Mover servicio de municipio a nueva estructura MVC'
  },
  { 
    from: 'services/usuario.service.ts',
    to: 'services/usuario.service.ts',
    action: 'Mover servicio de usuario a nueva estructura MVC'
  },
  { 
    from: 'services/assignment.service.ts',
    to: 'services/assignment.service.ts',
    action: 'Mover servicio de assignment a nueva estructura MVC'
  },
  { 
    from: 'services/smart-alerts.service.ts',
    to: 'services/smart-alerts.service.ts',
    action: 'Mover servicio de smart-alerts a nueva estructura MVC'
  },
  { 
    from: 'services/auto-alert.service.ts',
    to: 'services/auto-alert.service.ts',
    action: 'Mover servicio de auto-alert a nueva estructura MVC'
  },
  { 
    from: 'services/reporte.service.ts',
    to: 'services/reporte.service.ts',
    action: 'Mover servicio de reporte a nueva estructura MVC'
  },
  { 
    from: 'services/ips-crud.service.ts',
    to: 'services/ips-crud.service.ts',
    action: 'Mover servicio de ips-crud a nueva estructura MVC'
  },
  { 
    from: 'services/medico-crud.service.ts',
    to: 'services/medico-crud.service.ts',
    action: 'Mover servicio de medico-crud a nueva estructura MVC'
  },
  { 
    from: 'services/sync.service.ts',
    to: 'services/sync.service.ts',
    action: 'Mover servicio de sync a nueva estructura MVC'
  },
  { 
    from: 'services/mensaje.service.ts',
    to: 'services/mensaje.service.ts',
    action: 'Mover servicio de mensaje a nueva estructura MVC'
  },
  { 
    from: 'services/geolocalizacion.service.ts',
    to: 'services/geolocalizacion.service.ts',
    action: 'Mover servicio de geolocalización a nueva estructura MVC'
  },
  { 
    from: 'services/contenido-crud.service.ts',
    to: 'services/contenido-crud.service.ts',
    action: 'Mover servicio de contenido-crud a nueva estructura MVC'
  },
  { 
    from: 'services/websocket.service.ts',
    to: 'services/websocket.service.ts',
    action: 'Mover servicio de websocket a nueva estructura MVC'
  },
  { 
    from: 'services/token.service.ts',
    to: 'services/token.service.ts',
    action: 'Mover servicio de token a nueva estructura MVC'
  },
  { 
    from: 'services/refresh-token.service.ts',
    to: 'services/refresh-token.service.ts',
    action: 'Mover servicio de refresh-token a nueva estructura MVC'
  },
  { 
    from: 'services/permission.service.ts',
    to: 'services/permission.service.ts',
    action: 'Mover servicio de permission a nueva estructura MVC'
  },
  { 
    from: 'services/log.service.ts',
    to: 'services/log.service.ts',
    action: 'Mover servicio de log a nueva estructura MVC'
  },
  { 
    from: 'services/notification.service.ts',
    to: 'services/notification.service.ts',
    action: 'Mover servicio de notification a nueva estructura MVC'
  },
  { 
    from: 'services/error-handling.service.ts',
    to: 'services/error-handling.service.ts',
    action: 'Mover servicio de error-handling a nueva estructura MVC'
  },
  { 
    from: 'services/scoring.service.ts',
    to: 'services/scoring.service.ts',
    action: 'Mover servicio de scoring a nueva estructura MVC'
  },
  { 
    from: 'services/alert-rules-engine.service.ts',
    to: 'services/alert-rules-engine.service.ts',
    action: 'Mover servicio de alert-rules-engine a nueva estructura MVC'
  }
];

// Función para crear directorios si no existen
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Directorio creado: ${dirPath}`);
    return true;
  }
  return false;
}

// Función para mover archivo
function moveFile(from, to, action) {
  const fromPath = path.join(baseDir, from);
  const toPath = path.join(baseDir, to);
  
  // Verificar si el archivo origen existe
  if (!fs.existsSync(fromPath)) {
    console.log(`⚠️  Archivo no encontrado: ${fromPath}`);
    return false;
  }
  
  // Verificar si el directorio destino existe
  ensureDirectoryExists(path.dirname(toPath));
  
  try {
    fs.renameSync(fromPath, toPath);
    console.log(`✅ ${action}: ${from} → ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Error moviendo ${from} a ${to}:`, error);
    return false;
  }
}

// Función para actualizar importaciones en archivos
function updateImports(filePath, oldImport, newImport) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(
      new RegExp(`from ['${oldImport}']`),
      `from ['${newImport}']`
    );
    
    fs.writeFileSync(filePath, updatedContent);
    console.log(`🔄 Importaciones actualizadas en: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error actualizando importaciones en ${filePath}:`, error);
    return false;
  }
}

// Ejecutar migración
console.log('🔄 Ejecutando migración a estructura MVC...');

let successCount = 0;
let errorCount = 0;

// Crear estructura MVC si no existe
console.log('📁 Verificando estructura MVC...');
Object.values(mvcStructure).forEach(dirPath => {
  ensureDirectoryExists(dirPath);
});

// Migrar archivos
filesToMigrate.forEach(({ from, to, action }) => {
  if (moveFile(from, to, action)) {
    successCount++;
  } else {
    errorCount++;
  }
});

// Actualizar importaciones en archivos clave
const keyFilesToUpdate = [
  { file: 'src/routes/index.ts', oldImport: 'reportes.routes', newImport: 'reportes.routes.new' },
  { file: 'src/app.ts', oldImport: './routes/reportes.routes', newImport: './routes/reportes.routes.new' }
];

keyFilesToUpdate.forEach(({ file, oldImport, newImport }) => {
  if (updateImports(path.join(baseDir, file), oldImport, newImport)) {
    successCount++;
  } else {
    errorCount++;
  }
});

// Resumen
console.log('\n📊 RESUMEN DE MIGRACIÓN:');
console.log(`✅ Archivos migrados exitosamente: ${successCount}`);
console.log(`❌ Errores en migración: ${errorCount}`);
console.log(`📁 Estructura MVC creada en: ${srcDir}`);

if (errorCount === 0) {
  console.log('\n🎉 MIGRACIÓN COMPLETADA CON ÉXITO');
  console.log('\n📋 SIGUIENTES PASOS:');
  console.log('1. Los archivos existentes han sido migrados a la nueva estructura MVC');
  console.log('2. Las importaciones en archivos clave han sido actualizadas');
  console.log('3. La estructura MVC está lista para usarse');
  console.log('\n📝 Para completar la migración:');
  console.log('- Reemplace los archivos antiguos por los nuevos en los imports donde sea necesario');
  console.log('- Ejecute las pruebas para verificar que todo funciona correctamente');
  console.log('- Realice el commit y push de los cambios');
  process.exit(0);
} else {
  console.log('\n❌ MIGRACIÓN COMPLETADA CON ERRORES');
  console.log('\n📋 REVISE LOS SIGUIENTES ERRORES:');
  console.log('- Asegúrese de que todos los archivos se hayan migrado correctamente');
  console.log('- Verifique las importaciones en los archivos clave');
  console.log('- Corrija manualmente cualquier error y ejecute el script nuevamente');
  process.exit(1);
}