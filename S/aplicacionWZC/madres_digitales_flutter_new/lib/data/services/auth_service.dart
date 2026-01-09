import 'package:madres_digitales_flutter_new/domain/entities/user.dart';
import 'package:madres_digitales_flutter_new/core/network/api_service.dart';
import 'package:madres_digitales_flutter_new/core/exceptions/exceptions.dart';
import 'package:madres_digitales_flutter_new/data/services/cache_service.dart';
import 'package:dio/dio.dart';

class AuthService {
  
  AuthService._internal(this._apiService, this._cacheService);
  
  factory AuthService() {
    // Implementación singleton para mantener una única instancia
    return _instance ??= AuthService._internal(ApiService(), CacheService());
  }
  final ApiService _apiService;
  final CacheService _cacheService;
  User? _currentUser;
  
  static AuthService? _instance;
  
  Future<User> login(String email, String password) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );
      if (response.success) {
        final payload = response.data!;
        final user = User.fromJson(payload['user'] as Map<String, dynamic>);
        final token = payload['token'] as String;
        await _apiService.saveAccessToken(token);
        final rt = payload['refreshToken'];
        if (rt is String && rt.isNotEmpty) {
          await _apiService.saveRefreshToken(rt);
        }
        await _cacheService.saveUser(user);
        _currentUser = user;
        return user;
      }
      throw AuthException(response.message ?? 'Login failed');
    } on NetworkException catch (e) {
      throw AuthException('Network error: ${e.message}');
    } catch (e) {
      throw AuthException('Login failed: ${e.toString()}');
    }
  }
  
  Future<User> register({
    required String email,
    required String nombre,
    required String password,
    String? apellido,
    String? telefono,
    String? role,
  }) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/api/auth/register',
        data: {
          'email': email,
          'nombre': nombre,
          'apellido': apellido,
          'telefono': telefono,
          'password': password,
          'rol': role ?? 'gestante',
        },
      );
      if (response.success) {
        final payload = response.data!;
        final user = User.fromJson(payload['user'] as Map<String, dynamic>);
        final token = payload['token'] as String;
        await _apiService.saveAccessToken(token);
        final rt = payload['refreshToken'];
        if (rt is String && rt.isNotEmpty) {
          await _apiService.saveRefreshToken(rt);
        }
        await _cacheService.saveUser(user);
        _currentUser = user;
        return user;
      }
      throw AuthException(response.message ?? 'Registration failed');
    } on NetworkException catch (e) {
      throw AuthException('Network error: ${e.message}');
    } catch (e) {
      throw AuthException('Registration failed: ${e.toString()}');
    }
  }
  
  Future<void> logout() async {
    try {
      await _apiService.clearTokens();
      await _cacheService.clearUser();
      _currentUser = null;
    } catch (e) {
      throw AuthException('Logout failed: ${e.toString()}');
    }
  }
  
  Future<User?> getCurrentUser() async {
    try {
      final token = await _apiService.getAccessToken();
      if (token == null) return null;
      
      // Validar token con el servidor
      final response = await _apiService.get<Map<String, dynamic>>(
        '/auth/me',
        options: Options(headers: {
          'Authorization': 'Bearer $token',
        }),
      );
      if (response.success) {
        final userData = response.data?['user'] as Map<String, dynamic>?;
        if (userData != null) {
          final u = User.fromJson(userData);
          _currentUser = u;
          await _cacheService.saveUser(u);
          return u;
        }
      }
      
      // Token inválido, limpiar caché
      await _apiService.clearTokens();
      await _cacheService.clearUser();
      _currentUser = null;
      return null;
    } on NetworkException catch (e) {
      throw AuthException('Token validation failed: ${e.message}');
    } catch (e) {
      throw AuthException('Get current user failed: ${e.toString()}');
    }
  }
  
  Future<String> refreshToken() async {
    try {
      final refreshToken = await _apiService.getRefreshToken();
      if (refreshToken == null) {
        throw const AuthException('No refresh token available');
      }
      
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {
          'refreshToken': refreshToken,
        },
      );
      if (response.success) {
        final container = response.data?.containsKey('data') == true ? response.data!['data'] : response.data;
        final newToken = (container?['accessToken'] ?? container?['token']) as String;
        await _apiService.saveAccessToken(newToken);
        return newToken;
      }
      throw AuthException(response.message ?? 'Token refresh failed');
    } on NetworkException catch (e) {
      throw AuthException('Network error: ${e.message}');
    } catch (e) {
      throw AuthException('Token refresh failed: ${e.toString()}');
    }
  }
  
  Future<bool> isTokenValid() async {
    try {
      final token = await _apiService.getAccessToken();
      if (token == null) return false;
      
      final response = await _apiService.get<Map<String, dynamic>>(
        '/auth/me',
        options: Options(headers: {
          'Authorization': 'Bearer $token',
        }),
      );
      return response.success;
    } catch (e) {
      return false;
    }
  }
  
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final user = await getCurrentUser();
      if (user == null) {
        throw const AuthException('No authenticated user found');
      }
      
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/change-password',
        data: {
          'userId': user.id,
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      if (!response.success) {
        throw AuthException(response.message ?? 'Password change failed');
      }
    } on NetworkException catch (e) {
      throw AuthException('Network error: ${e.message}');
    } catch (e) {
      throw AuthException('Password change failed: ${e.toString()}');
    }
  }
  
  Future<void> resetPassword(String email) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/reset-password',
        data: {
          'email': email,
        },
      );
      if (!response.success) {
        throw AuthException(response.message ?? 'Password reset failed');
      }
    } on NetworkException catch (e) {
      throw AuthException('Network error: ${e.message}');
    } catch (e) {
      throw AuthException('Password reset failed: ${e.toString()}');
    }
  }
  
  Future<User> updateProfile({
    required String nombre,
    String? apellido,
    String? telefono,
  }) async {
    try {
      final user = await getCurrentUser();
      if (user == null) {
        throw const AuthException('No authenticated user found');
      }
      
      final response = await _apiService.put<Map<String, dynamic>>(
        '/auth/profile',
        data: {
          'userId': user.id,
          'nombre': nombre,
          'apellido': apellido,
          'telefono': telefono,
        },
      );
      if (response.success) {
        final updatedUser = User.fromJson(response.data?['user'] as Map<String, dynamic>);
        await _cacheService.saveUser(updatedUser);
        return updatedUser;
      }
      throw AuthException(response.message ?? 'Profile update failed');
    } on NetworkException catch (e) {
      throw AuthException('Network error: ${e.message}');
    } catch (e) {
      throw AuthException('Profile update failed: ${e.toString()}');
    }
  }
  
  // Stream para observar cambios en el estado de autenticación
  Stream<User?> get authStateChanges => _cacheService.userChanges;
  
  // Métodos utilitarios
  Future<bool> get isLoggedIn async => (await _apiService.getAccessToken()) != null;
  
  Future<bool> get hasValidToken async {
    try {
      final token = await _apiService.getAccessToken();
      return token != null && await isTokenValid();
    } catch (e) {
      return false;
    }
  }

  User? get currentUser => _currentUser;
  String? get userRole => _currentUser?.rol;
  String? get userId => _currentUser?.id;

  Future<void> initialize() async {
    try {
      await getCurrentUser();
    } catch (_) {}
  }
}