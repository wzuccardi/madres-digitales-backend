import 'package:madres_digitales_flutter_new/core/network/api_service.dart';
import '../../models/simple_models.dart';

class SimpleUsuarioService {
  SimpleUsuarioService() : _api = ApiService();
  final ApiService _api;

  // Obtener todos los usuarios
  Future<List<SimpleUsuario>> getUsuarios() async {
    try {
      
      final resp = await _api.get<List<dynamic>>('/auth/users');
      if (resp.success && resp.data != null) {
        final usuarios = resp.data!.map((json) => SimpleUsuario.fromJson(json as Map<String, dynamic>)).toList();
        return usuarios;
      }
      throw Exception('Error al cargar usuarios: ${resp.statusCode}');
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Crear nuevo usuario
  Future<SimpleUsuario> createUsuario(SimpleUsuario usuario, String password) async {
    try {
      
      final createData = usuario.toCreateJson();
      createData['password'] = password; // Agregar password para creación
      

      final resp = await _api.post<Map<String, dynamic>>(
        '/api/auth/register',
        data: createData,
      );
      if (resp.success && resp.data != null) {
        final container = resp.data!.containsKey('data') ? resp.data!['data'] : resp.data!;
        final usuarioCreado = SimpleUsuario.fromJson(container['user']);
        return usuarioCreado;
      }
      throw Exception(resp.message ?? 'Error al crear usuario');
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Actualizar usuario
  Future<SimpleUsuario> updateUsuario(String id, SimpleUsuario usuario) async {
    try {
      
      final resp = await _api.put<Map<String, dynamic>>(
        '/usuarios/$id',
        data: usuario.toJson(),
      );
      if (resp.success && resp.data != null) {
        final container = resp.data!.containsKey('data') ? resp.data!['data'] : resp.data!;
        final usuarioActualizado = SimpleUsuario.fromJson((container['user'] ?? container) as Map<String, dynamic>);
        return usuarioActualizado;
      }
      throw Exception('Error al actualizar usuario: ${resp.statusCode}');
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Eliminar usuario
  Future<void> deleteUsuario(String id) async {
    try {
      
      final resp = await _api.delete<dynamic>('/usuarios/$id');
      if (!resp.success) {
        throw Exception('Error al eliminar usuario: ${resp.statusCode}');
      }
      
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Activar/Desactivar usuario
  Future<SimpleUsuario> toggleUsuarioActivo(String id, bool activo) async {
    try {
      
      final resp = await _api.put<Map<String, dynamic>>(
        '/usuarios/$id/${activo ? "activate" : "deactivate"}',
      );
      if (resp.success && resp.data != null) {
        final container = resp.data!.containsKey('data') ? resp.data!['data'] : resp.data!;
        final usuarioActualizado = SimpleUsuario.fromJson((container['user'] ?? container) as Map<String, dynamic>);
        return usuarioActualizado;
      }
      throw Exception('Error al cambiar estado del usuario: ${resp.statusCode}');
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}

