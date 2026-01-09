#!/usr/bin/env ts-node

/**
 * Script de diagnóstico para problemas de permisos en reportes
 * 
 * Este script ayuda a identificar la causa raíz del problema de permisos
 * en el formulario de reportes.
 */

import { PrismaClient } from '@prisma/client';
import { PermissionService } from '../services/permission.service';
import { tokenService } from '../services/token.service';

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  passed: boolean;
  details: any;
  error?: string;
}

class ReportesPermissionDiagnostic {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🔍 INICIANDO DIAGNÓSTICO DE PERMISOS DE REPORTES\n');

    // Test 1: Verificar usuarios en la base de datos
    await this.testDatabaseUsers();

    // Test 2: Verificar consistencia de roles
    await this.testRoleConsistency();

    // Test 3: Verificar PermissionService
    await this.testPermissionService();

    // Test 4: Verificar generación de tokens
    await this.testTokenGeneration();

    // Test 5: Verificar validación de permisos del controlador
    await this.testControllerPermissionValidation();

    // Test 6: Verificar rutas de reportes
    await this.testReportesRoutes();

    // Mostrar resumen
    this.showSummary();
  }

  private async testDatabaseUsers(): Promise<void> {
    console.log('📋 TEST 1: Verificando usuarios en la base de datos...');
    
    try {
      const users = await prisma.usuarios.findMany({
        select: {
          id: true,
          email: true,
          rol: true,
          municipio_id: true,
          activo: true
        },
        take: 10
      });

      // Obtener conteo de gestantes asignadas para cada usuario
      const usersWithGestantesCount = await Promise.all(
        users.map(async (user) => {
          const gestantesCount = await prisma.gestantes.count({
            where: {
              madrina_id: user.id,
              activa: true
            }
          });
          
          return {
            ...user,
            gestantesAsignadas: gestantesCount
          };
        })
      );

      const roles = users.map(u => u.rol);
      const uniqueRoles = [...new Set(roles)];

      this.results.push({
        test: 'Database Users',
        passed: users.length > 0,
        details: {
          totalUsers: users.length,
          uniqueRoles,
          sampleUsers: usersWithGestantesCount.map(u => ({
            id: u.id,
            email: u.email,
            rol: u.rol,
            activo: u.activo,
            gestantesAsignadas: u.gestantesAsignadas
          }))
        }
      });

      console.log(`✅ Encontrados ${users.length} usuarios con roles: ${uniqueRoles.join(', ')}`);
    } catch (error) {
      this.results.push({
        test: 'Database Users',
        passed: false,
        details: null,
        error: error.message
      });
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async testRoleConsistency(): Promise<void> {
    console.log('\n🔄 TEST 2: Verificando consistencia de roles...');
    
    try {
      const users = await prisma.usuarios.findMany({
        select: { id: true, rol: true },
        take: 5
      });

      const roleIssues: string[] = [];

      for (const user of users) {
        const dbRole = user.rol;
        const upperRole = dbRole.toUpperCase();
        const lowerRole = dbRole.toLowerCase();

        // Verificar si el rol coincide con los valores esperados
        const validRoles = ['admin', 'super_admin', 'administrador', 'coordinador', 'madrina', 'medico'];
        const controllerRoles = ['ADMIN', 'SUPER_ADMIN', 'COORDINADOR', 'MADRINA'];
        
        if (!validRoles.includes(lowerRole) && !validRoles.includes(dbRole)) {
          roleIssues.push(`Usuario ${user.id}: Rol '${dbRole}' no está en la lista de roles válidos`);
        }

        if (!controllerRoles.includes(upperRole) && !controllerRoles.includes(dbRole.toUpperCase())) {
          roleIssues.push(`Usuario ${user.id}: Rol '${dbRole}' no coincide con roles del controlador`);
        }
      }

      this.results.push({
        test: 'Role Consistency',
        passed: roleIssues.length === 0,
        details: {
          issues: roleIssues,
          totalIssues: roleIssues.length
        }
      });

      if (roleIssues.length === 0) {
        console.log('✅ Todos los roles son consistentes');
      } else {
        console.log(`❌ Se encontraron ${roleIssues.length} problemas de consistencia:`);
        roleIssues.forEach(issue => console.log(`   - ${issue}`));
      }
    } catch (error) {
      this.results.push({
        test: 'Role Consistency',
        passed: false,
        details: null,
        error: error.message
      });
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async testPermissionService(): Promise<void> {
    console.log('\n🔐 TEST 3: Verificando PermissionService...');
    
    try {
      const permissionService = new PermissionService();
      const users = await prisma.usuarios.findMany({
        select: { id: true, rol: true },
        take: 3
      });

      const permissionResults: any[] = [];

      for (const user of users) {
        try {
          const permissions = await permissionService.getUserPermissions(user.id);
          permissionResults.push({
            userId: user.id,
            dbRole: user.rol,
            permissions: permissions
          });
        } catch (error) {
          permissionResults.push({
            userId: user.id,
            dbRole: user.rol,
            error: error.message
          });
        }
      }

      const errors = permissionResults.filter(r => r.error);
      
      this.results.push({
        test: 'Permission Service',
        passed: errors.length === 0,
        details: {
          results: permissionResults,
          errors: errors.length
        }
      });

      if (errors.length === 0) {
        console.log('✅ PermissionService funciona correctamente');
        permissionResults.forEach(result => {
          console.log(`   Usuario ${result.userId} (${result.dbRole}): ${result.permissions.role}`);
        });
      } else {
        console.log(`❌ ${errors.length} errores en PermissionService:`);
        errors.forEach(error => console.log(`   - ${error.userId}: ${error.error}`));
      }
    } catch (error) {
      this.results.push({
        test: 'Permission Service',
        passed: false,
        details: null,
        error: error.message
      });
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async testTokenGeneration(): Promise<void> {
    console.log('\n🎟️  TEST 4: Verificando generación de tokens...');
    
    try {
      const testUser = await prisma.usuarios.findFirst({
        select: { id: true, email: true, rol: true }
      });

      if (!testUser) {
        throw new Error('No hay usuarios para probar');
      }

      // Generar token de acceso
      const tokens = tokenService.generateTokenPair({
        id: testUser.id,
        email: testUser.email,
        rol: testUser.rol
      });

      // Verificar token
      const decoded = tokenService.verifyAccessToken(tokens.accessToken);

      const tokenValid = decoded.id === testUser.id && decoded.rol === testUser.rol;

      this.results.push({
        test: 'Token Generation',
        passed: tokenValid,
        details: {
          user: testUser,
          tokenGenerated: !!tokens.accessToken,
          decoded: decoded,
          roleMatch: decoded.rol === testUser.rol
        }
      });

      if (tokenValid) {
        console.log(`✅ Token generado y verificado correctamente para ${testUser.email} (${testUser.rol})`);
      } else {
        console.log(`❌ Problema con token: Rol en DB=${testUser.rol}, Rol en token=${decoded.rol}`);
      }
    } catch (error) {
      this.results.push({
        test: 'Token Generation',
        passed: false,
        details: null,
        error: error.message
      });
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async testControllerPermissionValidation(): Promise<void> {
    console.log('\n🎮 TEST 5: Verificando validación de permisos del controlador...');
    
    try {
      // Simular la lógica del controlador
      const users = await prisma.usuarios.findMany({
        select: { id: true, rol: true },
        take: 3
      });

      const validationResults: any[] = [];
      const rolesPermitidos = ['ADMIN', 'SUPER_ADMIN', 'COORDINADOR', 'MADRINA'];

      for (const user of users) {
        const userRol = user.rol?.toUpperCase();
        const hasPermission = rolesPermitidos.includes(userRol || '');
        
        validationResults.push({
          userId: user.id,
          dbRole: user.rol,
          upperRole: userRol,
          hasPermission,
          rolesPermitidos
        });
      }

      const hasPermissionIssues = validationResults.some(r => !r.hasPermission && r.dbRole);

      this.results.push({
        test: 'Controller Permission Validation',
        passed: !hasPermissionIssues,
        details: {
          results: validationResults,
          rolesPermitidos
        }
      });

      if (!hasPermissionIssues) {
        console.log('✅ Validación de permisos del controlador funciona correctamente');
      } else {
        console.log('❌ Problemas en validación de permisos:');
        validationResults.forEach(result => {
          if (!result.hasPermission && result.dbRole) {
            console.log(`   - Usuario ${result.userId}: Rol '${result.dbRole}' no está en roles permitidos`);
          }
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Controller Permission Validation',
        passed: false,
        details: null,
        error: error.message
      });
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async testReportesRoutes(): Promise<void> {
    console.log('\n🛣️  TEST 6: Verificando rutas de reportes...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      const routesPath = path.join(__dirname, '../routes/reportes.routes.ts');
      const routesContent = fs.readFileSync(routesPath, 'utf8');

      // Verificar si las rutas principales usan authMiddleware
      const mainRoutes = [
        "router.get('/', authMiddleware, getListaReportes)",
        "router.get('/resumen-general', authMiddleware, getResumenGeneral)",
        "router.get('/estadisticas-gestantes', authMiddleware, getEstadisticasGestantes)"
      ];

      const downloadRoutes = [
        "router.get('/descargar/resumen-general/pdf', getResumenGeneralPDF)",
        "router.get('/descargar/estadisticas-gestantes/pdf', getEstadisticasGestantesPDF)"
      ];

      const mainRoutesWithAuth = mainRoutes.filter(route => routesContent.includes(route));
      const downloadRoutesWithoutAuth = downloadRoutes.filter(route => 
        routesContent.includes(route) && !route.includes('authMiddleware')
      );

      const allMainRoutesHaveAuth = mainRoutesWithAuth.length === mainRoutes.length;
      const downloadRoutesIssue = downloadRoutesWithoutAuth.length > 0;

      this.results.push({
        test: 'Reportes Routes',
        passed: allMainRoutesHaveAuth && !downloadRoutesIssue,
        details: {
          mainRoutesWithAuth: mainRoutesWithAuth.length,
          totalMainRoutes: mainRoutes.length,
          downloadRoutesWithoutAuth: downloadRoutesWithoutAuth,
          allMainRoutesHaveAuth,
          downloadRoutesIssue
        }
      });

      if (allMainRoutesHaveAuth && !downloadRoutesIssue) {
        console.log('✅ Todas las rutas de reportes tienen autenticación');
      } else {
        if (!allMainRoutesHaveAuth) {
          console.log('❌ Algunas rutas principales no tienen authMiddleware');
        }
        if (downloadRoutesIssue) {
          console.log('❌ Rutas de descarga sin autenticación:');
          downloadRoutesWithoutAuth.forEach(route => console.log(`   - ${route}`));
        }
      }
    } catch (error) {
      this.results.push({
        test: 'Reportes Routes',
        passed: false,
        details: null,
        error: error.message
      });
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private showSummary(): void {
    console.log('\n📊 RESUMEN DE DIAGNÓSTICO\n');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    console.log(`Tests pasados: ${passed}/${this.results.length}`);
    console.log(`Tests fallidos: ${failed}/${this.results.length}\n`);

    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      
      if (!result.passed) {
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        if (result.details && result.details.issues) {
          result.details.issues.forEach((issue: string) => {
            console.log(`   - ${issue}`);
          });
        }
      }
    });

    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:\n');
    
    const failedTests = this.results.filter(r => !r.passed);
    
    if (failedTests.some(t => t.test === 'Role Consistency')) {
      console.log('1. Corregir inconsistencia en roles entre base de datos y controlador');
      console.log('   - Asegurar que los roles en la base de datos coincidan con los esperados por el controlador');
      console.log('   - Considerar normalizar roles a minúsculas en la base de datos');
    }

    if (failedTests.some(t => t.test === 'Controller Permission Validation')) {
      console.log('2. Actualizar lista de roles permitidos en el controlador');
      console.log('   - Verificar que todos los roles válidos estén incluidos en rolesPermitidos');
    }

    if (failedTests.some(t => t.test === 'Reportes Routes')) {
      console.log('3. Agregar authMiddleware a rutas de descarga');
      console.log('   - Todas las rutas de reportes deben requerir autenticación');
    }

    if (failedTests.some(t => t.test === 'Permission Service')) {
      console.log('4. Revisar implementación de PermissionService');
      console.log('   - Asegurar que todos los roles sean manejados correctamente');
    }

    if (failedTests.some(t => t.test === 'Token Generation')) {
      console.log('5. Revisar generación y verificación de tokens');
      console.log('   - Asegurar que el rol se incluya correctamente en el token JWT');
    }

    console.log('\n🔧 ACCIONES INMEDIATAS SUGERIDAS:');
    console.log('1. Ejecutar este script en el entorno afectado');
    console.log('2. Identificar el test fallido específico');
    console.log('3. Aplicar la corrección correspondiente');
    console.log('4. Probar el formulario de reportes nuevamente');
  }
}

// Ejecutar diagnóstico si se llama directamente
if (require.main === module) {
  const diagnostic = new ReportesPermissionDiagnostic();
  diagnostic.runAllTests()
    .then(() => {
      console.log('\n🎯 Diagnóstico completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en diagnóstico:', error);
      process.exit(1);
    });
}

export { ReportesPermissionDiagnostic };