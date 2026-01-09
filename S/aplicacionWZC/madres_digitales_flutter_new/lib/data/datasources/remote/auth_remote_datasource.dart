import 'package:madres_digitales_flutter_new/core/network/api_service.dart';
import 'package:madres_digitales_flutter_new/core/utils/logger.dart';
import 'package:madres_digitales_flutter_new/data/models/user_model.dart';

/// Interfaz abstracta para el data source remoto de autenticación
abstract class AuthRemoteDataSource {
  /// Inicia sesión con email y contraseña
  Future<AuthResultModel> signIn(String email, String password);

  /// Registra un nuevo usuario
  Future<AuthResultModel> signUp({
    required String name,
    required String email,
    required String password,
    String? role,
  });

  /// Cierra la sesión del usuario
  Future<void> signOut();

  /// Refresca el token de autenticación
  Future<String> refreshToken(String refreshToken);

  /// Obtiene el usuario actual desde el servidor
  Future<UserModel> getCurrentUser();

  /// Verifica si el token es válido
  Future<bool> verifyToken(String token);

  /// Envía email de restablecimiento de contraseña
  Future<void> sendPasswordResetEmail(String email);

  /// Restablece la contraseña con token
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  });

  /// Cambia la contraseña del usuario
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  });
}

/// Modelo para el resultado de autenticación
class AuthResultModel {

  AuthResultModel({
    required this.user,
    required this.token,
    required this.refreshToken,
  });

  factory AuthResultModel.fromJson(Map<String, dynamic> json) {
    return AuthResultModel(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String,
      refreshToken: json['refreshToken'] as String,
    );
  }
  final UserModel user;
  final String token;
  final String refreshToken;

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'token': token,
      'refreshToken': refreshToken,
    };
  }
}

/// Implementación del data source remoto de autenticación
/// 
/// Maneja todas las llamadas HTTP relacionadas con autenticación
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {

  AuthRemoteDataSourceImpl(this._apiService);
  final ApiService _apiService;

  @override
  Future<AuthResultModel> signIn(String email, String password) async {
    try {
      AppLogger.info('Attempting sign in for email: $email');

      final response = await _apiService.post(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.success && response.data != null) {
        final authResult = AuthResultModel.fromJson(response.data!);
        AppLogger.info('Sign in successful for user: ${authResult.user.email}');
        return authResult;
      } else {
        final errorMessage = response.error?.message ?? 'Login failed';
        AppLogger.error('Sign in failed: $errorMessage');
        throw ServerException(errorMessage);
      }
    } catch (e) {
      AppLogger.error('Sign in exception: $e');
      if (e is ServerException) rethrow;
      throw NetworkException('Network error during sign in: ${e.toString()}');
    }
  }

  @override
  Future<AuthResultModel> signUp({
    required String name,
    required String email,
    required String password,
    String? role,
  }) async {
    try {
      AppLogger.info('Attempting sign up for email: $email');

      final response = await _apiService.post(
        '/api/auth/register',
        data: {
          'nombre': name,
          'email': email,
          'password': password,
          'rol': role ?? 'gestante',
        },
      );

      if (response.success && response.data != null) {
        final authResult = AuthResultModel.fromJson(response.data!);
        AppLogger.info('Sign up successful for user: ${authResult.user.email}');
        return authResult;
      } else {
        final errorMessage = response.error?.message ?? 'Registration failed';
        AppLogger.error('Sign up failed: $errorMessage');
        throw ServerException(errorMessage);
      }
    } catch (e) {
      AppLogger.error('Sign up exception: $e');
      if (e is ServerException) rethrow;
      throw NetworkException('Network error during sign up: ${e.toString()}');
    }
  }

  @override
  Future<void> signOut() async {
    try {
      AppLogger.info('Attempting sign out');

      final response = await _apiService.post('/auth/logout');

      if (response.success) {
        AppLogger.info('Sign out successful');
      } else {
        final errorMessage = response.error?.message ?? 'Logout failed';
        AppLogger.error('Sign out failed: $errorMessage');
        throw ServerException(errorMessage);
      }
    } catch (e) {
      AppLogger.error('Sign out exception: $e');
      if (e is ServerException) rethrow;
      throw NetworkException('Network error during sign out: ${e.toString()}');
    }
  }

  @override
  Future<String> refreshToken(String refreshToken) async {
    try {
      AppLogger.info('Attempting token refresh');

      final response = await _apiService.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      if (response.success && response.data != null) {
        final newToken = response.data!['token'] as String;
        AppLogger.info('Token refresh successful');
        return newToken;
      } else {
        final errorMessage = response.error?.message ?? 'Token refresh failed';
        AppLogger.error('Token refresh failed: $errorMessage');
        throw ServerException(errorMessage);
      }
    } catch (e) {
      AppLogger.error('Token refresh exception: $e');
      if (e is ServerException) rethrow;
      throw NetworkException('Network error during token refresh: ${e.toString()}');
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      AppLogger.info('Attempting to get current user');

      final response = await _apiService.get('/auth/me');

      if (response.success && response.data != null) {
        final userModel = UserModel.fromJson(response.data!['user'] as Map<String, dynamic>);
        AppLogger.info('Get current user successful: ${userModel.email}');
        return userModel;
      } else {
        final errorMessage = response.error?.message ?? 'Failed to get current user';
        AppLogger.error('Get current user failed: $errorMessage');
        throw ServerException(errorMessage);
      }
    } catch (e) {
      AppLogger.error('Get current user exception: $e');
      if (e is ServerException) rethrow;
      throw NetworkException('Network error getting current user: ${e.toString()}');
    }
  }

  @override
  Future<bool> verifyToken(String token) async {
    try {
      AppLogger.info('Attempting token verification');

      final response = await _apiService.get('/auth/me');

      if (response.success) {
        AppLogger.info('Token verification successful');
        return true;
      } else {
        AppLogger.info('Token verification failed');
        return false;
      }
    } catch (e) {
      AppLogger.error('Token verification exception: $e');
      return false;
    }
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      AppLogger.info('Attempting to send password reset email to: $email');

      final response = await _apiService.post(
        '/auth/password-reset',
        data: {'email': email},
      );

      if (response.success) {
        AppLogger.info('Password reset email sent successfully');
      } else {
        final errorMessage = response.error?.message ?? 'Failed to send password reset email';
        AppLogger.error('Send password reset email failed: $errorMessage');
        throw ServerException(errorMessage);
      }
    } catch (e) {
      AppLogger.error('Send password reset email exception: $e');
      if (e is ServerException) rethrow;
      throw NetworkException('Network error sending password reset email: ${e.toString()}');
    }
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      AppLogger.info('Attempting password reset');

      final response = await _apiService.post(
        '/auth/password-reset/confirm',
        data: {
          'token': token,
          'newPassword': newPassword,
        },
      );

      if (response.success) {
        AppLogger.info('Password reset successful');
      } else {
        final errorMessage = response.error?.message ?? 'Password reset failed';
        AppLogger.error('Password reset failed: $errorMessage');
        throw ServerException(errorMessage);
      }
    } catch (e) {
      AppLogger.error('Password reset exception: $e');
      if (e is ServerException) rethrow;
      throw NetworkException('Network error during password reset: ${e.toString()}');
    }
  }

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      AppLogger.info('Attempting password change');

      final response = await _apiService.post(
        '/auth/password-change',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (response.success) {
        AppLogger.info('Password change successful');
      } else {
        final errorMessage = response.error?.message ?? 'Password change failed';
        AppLogger.error('Password change failed: $errorMessage');
        throw ServerException(errorMessage);
      }
    } catch (e) {
      AppLogger.error('Password change exception: $e');
      if (e is ServerException) rethrow;
      throw NetworkException('Network error during password change: ${e.toString()}');
    }
  }
}

/// Excepciones para errores del servidor
class ServerException implements Exception {
  
  ServerException(this.message);
  final String message;
  
  @override
  String toString() => 'ServerException: $message';
}

/// Excepciones para errores de red
class NetworkException implements Exception {
  
  NetworkException(this.message);
  final String message;
  
  @override
  String toString() => 'NetworkException: $message';
}
