import 'package:madres_digitales_flutter_new/core/network/api_service.dart';
import 'package:madres_digitales_flutter_new/domain/entities/user.dart';
import 'package:madres_digitales_flutter_new/domain/repositories/auth_repository.dart';
import 'package:madres_digitales_flutter_new/core/types/result.dart';
import 'package:madres_digitales_flutter_new/core/errors/app_error.dart';
import 'package:madres_digitales_flutter_new/core/utils/logger.dart';



/// Implementación concreta del repositorio de autenticación
/// Utiliza ApiService para comunicarse con el backend
class AuthRepositoryImpl implements AuthRepository {

  AuthRepositoryImpl(this._apiService);
  final ApiService _apiService;

  @override
  Future<Result<User, AppError>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      AppLogger.info('Auth signIn start', context: {'email': email});
      final response = await _apiService.post<Map<String, dynamic>>(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );
      AppLogger.info('Auth signIn response', context: {
        'success': response.success,
        'statusCode': response.statusCode,
        'data': response.data,
        'message': response.message
      });
      if (!response.success) {
        final error = AuthenticationError(response.error?.message ?? 'Error al iniciar sesión');
      AppLogger.error('Auth signIn failed', context: {'email': email, 'statusCode': response.statusCode});
        return Result.failure(error);
      }
      final payload = response.data!;
      final container = payload.containsKey('data') ? payload['data'] : payload;
      AppLogger.info('Auth container data', context: {'container': container});
      final userJson = container['user'] ?? container['usuario'];
      final accessToken = container['accessToken'] ?? container['token'];
      final refreshToken = container['refreshToken'] ?? container['token']; // Use token as refreshToken if not provided
      AppLogger.info('Auth extracted data', context: {
        'userJson': userJson,
        'accessToken': accessToken != null ? 'present' : 'missing',
        'refreshToken': refreshToken != null ? 'present' : 'missing'
      });
      final user = User.fromJson(userJson as Map<String, dynamic>);
      await _apiService.saveTokens(accessToken as String, refreshToken as String);
      
      AppLogger.debug('REPOSITORY DEBUG: User from backend', context: {
        'email': user.email,
        'role': user.role,
        'userJson': userJson,
      });
      
      AppLogger.info('Auth signIn success', context: {'email': email});
      return Result.success(user);
    } catch (e) {
      final error = e is AppError ? e : NetworkError('Error de red al iniciar sesión: ${e.toString()}');
      AppLogger.error('Auth signIn exception', error: e, context: {'email': email});
      return Result.failure(error);
    }
  }

  @override
  Future<Result<User, AppError>> signUp({
    required String name,
    required String email,
    required String password,
    String? role,
    String? documento,
    String? tipoDocumento,
    String? telefono,
    String? municipioId,
  }) async {
    try {
      AppLogger.info('Auth signUp start', context: {'email': email});
      
      // Preparar datos del registro
      final Map<String, dynamic> registerData = {
        'nombre': name,
        'email': email,
        'password': password,
        'rol': role ?? 'gestante',
      };
      
      // Agregar campos opcionales solo si tienen valor
      if (documento != null && documento.isNotEmpty) {
        registerData['documento'] = documento;
      }
      if (tipoDocumento != null && tipoDocumento.isNotEmpty) {
        registerData['tipo_documento'] = tipoDocumento;
      }
      if (telefono != null && telefono.isNotEmpty) {
        registerData['telefono'] = telefono;
      }
      if (municipioId != null && municipioId.isNotEmpty) {
        registerData['municipioId'] = municipioId;
      }
      
      final response = await _apiService.post<Map<String, dynamic>>(
        '/api/auth/register',
        data: registerData,
      );
      if (!response.success) {
        final error = AuthenticationError(response.error?.message ?? 'Error al registrar usuario');
        AppLogger.error('Auth signUp failed', context: {'email': email, 'statusCode': response.statusCode});
        return Result.failure(error);
      }
      final payload = response.data!;
      final container = payload.containsKey('data') ? payload['data'] : payload;
      final userJson = container['user'] ?? container['usuario'] ?? container;
      final accessToken = container['accessToken'] ?? container['token'] ?? '';
      final refreshToken = container['refreshToken'] ?? '';
      final user = User.fromJson(userJson as Map<String, dynamic>);
      if (accessToken.isNotEmpty) {
        await _apiService.saveTokens(accessToken as String, refreshToken as String);
      }
      AppLogger.info('Auth signUp success', context: {'email': email});
      return Result.success(user);
    } catch (e) {
      final error = e is AppError ? e : NetworkError('Error de red al registrar usuario: ${e.toString()}');
      AppLogger.error('Auth signUp exception', error: e, context: {'email': email});
      return Result.failure(error);
    }
  }

  @override
  Future<Result<void, AppError>> signOut() async {
    try {
      try { await _apiService.post<Map<String, dynamic>>('/auth/logout'); } catch (_) {}
      await _apiService.clearTokens();
      return const Result.success(null);
    } catch (e) {
      await _apiService.clearTokens();
      final error = e is AppError ? e : NetworkError('Error al cerrar sesión: ${e.toString()}');
      return Result.failure(error);
    }
  }

  @override
  Future<Result<String, AppError>> refreshToken(String refreshToken) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      if (!response.success) {
        final error = AuthenticationError(response.error?.message ?? 'Error al refrescar token');
        return Result.failure(error);
      }
      final newToken = response.data!['accessToken'];
      await _apiService.saveTokens(newToken, refreshToken);
      return Result.success(newToken);
    } catch (e) {
      final error = e is AppError ? e : NetworkError('Error de red al refrescar token: ${e.toString()}');
      return Result.failure(error);
    }
  }

  @override
  Future<Result<User?, AppError>> getCurrentUser() async {
    try {
      final token = await _apiService.getAccessToken();
      if (token == null) return const Result.success(null);

      final response = await _apiService.get<Map<String, dynamic>>('/auth/me');

      if (!response.success) {
        if (response.statusCode == 401) {
          await _apiService.clearTokens();
          return const Result.success(null);
        }
        final error = AuthenticationError(response.error?.message ?? 'Error al obtener usuario actual');
        return Result.failure(error);
      }

      final userData = response.data!;
      return Result.success(User.fromJson(userData['user']));
    } catch (e) {
      final error = e is AppError ? e : NetworkError('Error de red al obtener usuario actual: ${e.toString()}');
      return Result.failure(error);
    }
  }

  @override
  Future<Result<void, AppError>> sendPasswordResetEmail(String email) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/forgot-password',
        data: {'email': email},
      );

      if (!response.success) {
        final error = ServerError(response.error?.message ?? 'Error al enviar correo de restablecimiento');
        return Result.failure(error);
      }
      return const Result.success(null);
    } catch (e) {
      final error = e is AppError ? e : NetworkError('Error de red al enviar correo: ${e.toString()}');
      return Result.failure(error);
    }
  }

  @override
  Future<Result<void, AppError>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/reset-password',
        data: {
          'token': token,
          'newPassword': newPassword,
        },
      );

      if (!response.success) {
        final error = ServerError(response.error?.message ?? 'Error al restablecer contraseña');
        return Result.failure(error);
      }
      return const Result.success(null);
    } catch (e) {
      final error = e is AppError ? e : NetworkError('Error de red al restablecer contraseña: ${e.toString()}');
      return Result.failure(error);
    }
  }

  @override
  Future<Result<void, AppError>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (!response.success) {
        final error = ServerError(response.error?.message ?? 'Error al cambiar contraseña');
        return Result.failure(error);
      }
      return const Result.success(null);
    } catch (e) {
      final error = e is AppError ? e : NetworkError('Error de red al cambiar contraseña: ${e.toString()}');
      return Result.failure(error);
    }
  }

  @override
  Future<Result<bool, AppError>> isAuthenticated() async {
    try {
      final token = await _apiService.getAccessToken();
      if (token == null) return const Result.success(false);

      final response = await _apiService.get<Map<String, dynamic>>('/auth/me');

      if (!response.success) {
        if (response.statusCode == 401) {
          await _apiService.clearTokens();
          return const Result.success(false);
        }
        return Result.failure(response.error ?? const UnknownError('Error al verificar autenticación'));
      }

      return const Result.success(true);
    } catch (e) {
      final error = e is AppError ? e : UnknownError(e.toString());
      return Result.failure(error);
    }
  }

  @override
  Future<Result<String?, AppError>> getAccessToken() async {
    try {
      final token = await _apiService.getAccessToken();
      return Result.success(token);
    } catch (e) {
      return Result.failure(UnknownError('Error al obtener token de acceso: ${e.toString()}'));
    }
  }

  @override
  Future<Result<void, AppError>> saveAccessToken(String token) async {
    try {
      // Este método podría necesitar el refresh token también
      // Por ahora, solo guardamos el access token
      final refreshToken = await _apiService.getRefreshToken();
      await _apiService.saveTokens(token, refreshToken ?? '');
      return const Result.success(null);
    } catch (e) {
      return Result.failure(UnknownError('Error al guardar token de acceso: ${e.toString()}'));
    }
  }

  @override
  Future<Result<void, AppError>> removeAccessToken() async {
    try {
      await _apiService.clearTokens();
      return const Result.success(null);
    } catch (e) {
      return Result.failure(UnknownError('Error al eliminar token de acceso: ${e.toString()}'));
    }
  }
}
