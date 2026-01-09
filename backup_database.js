// Script para generar backup completo de la base de datos
// Genera archivos SQL con todos los datos de las tablas principales

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateBackup() {
  try {
    console.log('🔄 Iniciando backup de la base de datos...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup_${timestamp}`;
    
    // Crear directorio de backup
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Backup de usuarios
    console.log('📥 Descargando usuarios...');
    const usuarios = await prisma.usuarios.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'usuarios.json'),
      JSON.stringify(usuarios, null, 2)
    );
    
    // Backup de gestantes
    console.log('📥 Descargando gestantes...');
    const gestantes = await prisma.gestantes.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'gestantes.json'),
      JSON.stringify(gestantes, null, 2)
    );
    
    // Backup de controles prenatales
    console.log('📥 Descargando controles prenatales...');
    const controles = await prisma.control_prenatal.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'control_prenatal.json'),
      JSON.stringify(controles, null, 2)
    );
    
    // Backup de alertas
    console.log('📥 Descargando alertas...');
    const alertas = await prisma.alertas.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'alertas.json'),
      JSON.stringify(alertas, null, 2)
    );
    
    // Backup de puerperio
    console.log('📥 Descargando puerperio...');
    const puerperio = await prisma.puerperio.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'puerperio.json'),
      JSON.stringify(puerperio, null, 2)
    );
    
    // Backup de municipios
    console.log('📥 Descargando municipios...');
    const municipios = await prisma.municipios.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'municipios.json'),
      JSON.stringify(municipios, null, 2)
    );
    
    // Backup de IPS
    console.log('📥 Descargando IPS...');
    const ips = await prisma.ips.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'ips.json'),
      JSON.stringify(ips, null, 2)
    );
    
    // Backup de médicos
    console.log('📥 Descargando médicos...');
    const medicos = await prisma.medicos.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'medicos.json'),
      JSON.stringify(medicos, null, 2)
    );
    
    // Generar resumen del backup
    const resumen = {
      fecha_backup: new Date().toISOString(),
      tablas: {
        usuarios: usuarios.length,
        gestantes: gestantes.length,
        control_prenatal: controles.length,
        alertas: alertas.length,
        puerperio: puerperio.length,
        municipios: municipios.length,
        ips: ips.length,
        medicos: medicos.length
      },
      total_registros: usuarios.length + gestantes.length + controles.length + 
                      alertas.length + puerperio.length + municipios.length + 
                      ips.length + medicos.length
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'resumen_backup.json'),
      JSON.stringify(resumen, null, 2)
    );
    
    console.log('✅ Backup completado exitosamente!');
    console.log(`📁 Directorio: ${backupDir}`);
    console.log(`📊 Total registros: ${resumen.total_registros}`);
    console.log('📋 Resumen por tabla:');
    Object.entries(resumen.tablas).forEach(([tabla, count]) => {
      console.log(`   ${tabla}: ${count} registros`);
    });
    
    return backupDir;
    
  } catch (error) {
    console.error('❌ Error generando backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateBackup()
    .then((backupDir) => {
      console.log(`\n🎉 Backup guardado en: ${backupDir}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { generateBackup };