// Configuración centralizada de la aplicación
// Asegura consistencia en todas las configuraciones del sistema
// FORCE REDEPLOY: 2026-01-09 - Widget Puerperio Implementado

class AppConfig {
  static const String environment = String.fromEnvironment('ENVIRONMENT', defaultValue: 'production');
  static bool get isLocalMode => environment != 'production';

  // URLs configurables desde variables de entorno
  static const String backendBaseUrlProductionEnv = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://madres-digitales-backend.vercel.app',
  );
  static const String backendUrlPlainEnv = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: '',
  );
  static const String backendBaseUrlLocal = 'http://localhost:3000';
  static const String androidEmulatorUrl = 'http://10.0.2.2:3000';
  static const String webUrlProduction = 'https://madres-digitales-frontend.vercel.app';
  static const String webUrlLocal = 'http://localhost:3008';

  static String get backendBaseUrlEffective {
    final base = backendUrlPlainEnv.isNotEmpty ? backendUrlPlainEnv : backendBaseUrlProductionEnv;
    // No agregar /api aquí porque se agrega en el endpoint específico
    return base;
  }
  static String get backendBaseUrl => backendBaseUrlEffective;
  static String get webUrl => isLocalMode ? webUrlLocal : webUrlProduction;

  // Configuración de timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sosTimeout = Duration(seconds: 10);
  
  // Configuración de cache
  static const Duration cacheDuration = Duration(minutes: 15);
  static const int maxCacheSize = 100;
  
  // Configuración de SOS
  static const int sosVibrationCount = 20;
  static const Duration sosVibrationInterval = Duration(milliseconds: 1200);
  static const Duration sosCountdownDuration = Duration(seconds: 5);
  static const Duration sosFlashInterval = Duration(milliseconds: 500);
  
  // Configuración de ubicación
  static const double defaultLocationAccuracy = 10.0; // metros
  static const Duration locationTimeout = Duration(seconds: 10);
  
  // Configuración de paginación
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Configuración de archivos
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif'];
  static const List<String> allowedVideoTypes = ['mp4', 'mov', 'avi'];
  static const List<String> allowedDocumentTypes = ['pdf', 'doc', 'docx'];
  
  // Configuración de roles
  static const List<String> rolesConAccesoCompleto = [
    'admin',
    'super_admin',
    'coordinador',
    'medico',
  ];
  
  static const List<String> rolesConAccesoRestringido = [
    'madrina',
  ];
  
  // Configuración de permisos
  static const String permisoVer = 'ver';
  static const String permisoEditar = 'editar';
  static const String permisoEliminar = 'eliminar';
  static const String permisoCrearControl = 'crear_control';
  static const String permisoAsignar = 'asignar';
  static const String permisoTransferir = 'transferir';
  
  // Configuración de alertas
  static const Map<String, String> tipoAlerta = {
    'sos': 'sos',
    'medica': 'medica',
    'control': 'control',
    'recordatorio': 'recordatorio',
  };
  
  static const Map<String, String> nivelPrioridad = {
    'baja': 'baja',
    'media': 'media',
    'alta': 'alta',
    'critica': 'critica',
  };
  
  // Configuración de desarrollo
  static const bool isDebugMode = false;
  static const bool enableLogging = false;
  static const bool enableDebugPrints = false;
  
  // Configuración de animaciones
  static const Duration defaultAnimationDuration = Duration(milliseconds: 300);
  static const Duration fastAnimationDuration = Duration(milliseconds: 150);
  static const Duration slowAnimationDuration = Duration(milliseconds: 500);
  
  // Configuración de UI
  static const double defaultBorderRadius = 8.0;
  static const double cardElevation = 4.0;
  static const double buttonElevation = 2.0;
  
  // Configuración de colores (pueden ser personalizados)
  static const int primaryColorValue = 0xFFE91E63;
  static const int accentColorValue = 0xFFFF4081;
  static const int errorColorValue = 0xFFF44336;
  static const int warningColorValue = 0xFFFF9800;
  static const int successColorValue = 0xFF4CAF50;
  static const int infoColorValue = 0xFF2196F3;
  
  // Configuración de rutas
  static const String routeLogin = '/login';
  static const String routeHome = '/home';
  static const String routeGestantes = '/gestantes';
  static const String routeGestanteDetail = '/gestante-detail';
  static const String routeGestanteForm = '/gestante-form';
  static const String routeSOS = '/sos';
  static const String routeProfile = '/profile';
  static const String routeSettings = '/settings';
  
  // Configuración de almacenamiento seguro
  static const String authTokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const String permissionsCacheKey = 'permissions_cache';
  static const String lastSyncKey = 'last_sync';
  
  // Configuración de notificaciones
  static const String notificationChannelId = 'madres_digitales';
  static const String notificationChannelName = 'Madres Digitales';
  static const String notificationChannelDescription = 'Notificaciones de Madres Digitales';
  
  // Configuración de API
  static const Map<String, String> apiHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Configuración de endpoints
  static const String endpointAuth = '/auth';
  static const String endpointGestantes = '/gestantes';
  static const String endpointAlertas = '/alertas';
  static const String endpointControles = '/controles';
  static const String endpointMunicipios = '/municipios';
  static const String endpointIPS = '/ips';
  static const String endpointMedicos = '/medicos';
  static const String endpointUsuarios = '/usuarios';
  
  // Configuración de endpoints específicos para madrinas
  static const String endpointGestantesPorMadrina = '/gestantes/madrina';
  static const String endpointAsignarGestante = '/gestantes/asignar';
  static const String endpointTransferirGestante = '/gestantes/transferir';
  static const String endpointPermisosGestante = '/gestantes/permiso';
  static const String endpointSOS = '/alertas/sos';
  
  // Configuración de errores
  static const String errorNetwork = 'Error de conexión';
  static const String errorTimeout = 'Tiempo de conexión agotado';
  static const String errorUnauthorized = 'No autorizado';
  static const String errorForbidden = 'Acceso denegado';
  static const String errorNotFound = 'Recurso no encontrado';
  static const String errorServerError = 'Error del servidor';
  static const String errorUnknown = 'Error desconocido';
  
  // Configuración de mensajes
  static const String messageLoginSuccess = 'Inicio de sesión exitoso';
  static const String messageLoginError = 'Error en inicio de sesión';
  static const String messageLogoutSuccess = 'Sesión cerrada';
  static const String messageSaveSuccess = 'Guardado exitosamente';
  static const String messageSaveError = 'Error al guardar';
  static const String messageDeleteSuccess = 'Eliminado exitosamente';
  static const String messageDeleteError = 'Error al eliminar';
  static const String messageSOSActivated = 'Alerta SOS activada';
  static const String messagePermissionDenied = 'Permiso denegado';
  
  static String get apiBaseUrl => backendBaseUrl;

  static String getEnvironmentMode() {
    return environment;
  }
  
  // Método para verificar si un rol tiene acceso completo
  static bool tieneAccesoCompleto(String? rol) {
    if (rol == null) return false;
    return rolesConAccesoCompleto.contains(rol);
  }
  
  // Método para verificar si un rol tiene acceso restringido
  static bool tieneAccesoRestringido(String? rol) {
    if (rol == null) return false;
    return rolesConAccesoRestringido.contains(rol);
  }
  
  // Método para obtener permisos por rol
  static List<String> getPermisosPorRol(String? rol) {
    if (rol == null) return [];
    
    if (tieneAccesoCompleto(rol)) {
      return [
        permisoVer,
        permisoEditar,
        permisoEliminar,
        permisoCrearControl,
        permisoAsignar,
        permisoTransferir,
      ];
    }
    
    if (tieneAccesoRestringido(rol)) {
      return [
        permisoVer,
        permisoCrearControl,
      ];
    }
    
    return [];
  }
  
  // Método para obtener configuración de cache
  static Duration getCacheDuration() {
    return isDebugMode ? const Duration(minutes: 5) : cacheDuration;
  }
  
  // Método para obtener configuración de logging
  static bool shouldEnableLogging() {
    return isDebugMode && enableLogging && isLocalMode;
  }
  
  // Método para obtener configuración de debug prints
  static bool shouldEnableDebugPrints() {
    return isDebugMode && enableDebugPrints && isLocalMode;
  }
  
  static const bool enableNewDashboard = bool.fromEnvironment('ENABLE_NEW_DASHBOARD');
  static const bool enableAdvancedSearch = bool.fromEnvironment('ENABLE_ADVANCED_SEARCH');
  static const bool enableOfflineMode = bool.fromEnvironment('ENABLE_OFFLINE_MODE');
}
