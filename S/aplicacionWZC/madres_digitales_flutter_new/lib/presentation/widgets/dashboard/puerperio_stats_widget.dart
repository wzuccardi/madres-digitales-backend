import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:madres_digitales_flutter_new/core/providers/service_providers.dart';

// Provider para las estadísticas de puerperio
final puerperioStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final apiService = ref.read(apiServiceProvider);
  final response = await apiService.get<Map<String, dynamic>>('/api/puerperio/estadisticas');
  
  if (response.success && response.data != null) {
    return response.data!;
  } else {
    throw Exception('Error obteniendo estadísticas de puerperio: ${response.error?.message ?? "Error desconocido"}');
  }
});

class PuerperioStatsWidget extends ConsumerWidget {
  const PuerperioStatsWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(puerperioStatsProvider);

    return Card(
      elevation: 4,
      margin: const EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.pink.shade50,
              Colors.purple.shade50,
            ],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.pink.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.pregnant_woman,
                      color: Colors.pink.shade700,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Estadísticas Generales',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.pink.shade700,
                          ),
                        ),
                        Text(
                          'Gestantes y Puerperio',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              statsAsync.when(
                data: (stats) => _buildStatsContent(context, stats),
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: CircularProgressIndicator(),
                  ),
                ),
                error: (error, stack) => _buildErrorContent(context, error),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsContent(BuildContext context, Map<String, dynamic> stats) {
    // Los datos pueden venir directamente o dentro de un campo 'data'
    final data = stats.containsKey('data') ? stats['data'] as Map<String, dynamic> : stats;
    final resumen = data['resumen'] as Map<String, dynamic>? ?? {};
    
    final totalGestantesActivas = resumen['total_gestantes_activas'] ?? 0;
    final totalPuerperio = resumen['total_puerperio'] ?? 0;
    final totalCombinado = resumen['total_combinado'] ?? 0;

    return Column(
      children: [
        // Estadísticas principales - 3 tarjetas
        Row(
          children: [
            _buildStatCard(
              context,
              'Total\nGestantes',
              totalGestantesActivas.toString(),
              Icons.pregnant_woman,
              Colors.purple,
            ),
            const SizedBox(width: 12),
            _buildStatCard(
              context,
              'Total\nPuerperio',
              totalPuerperio.toString(),
              Icons.child_care,
              Colors.pink,
            ),
            const SizedBox(width: 12),
            _buildStatCard(
              context,
              'Total\nGeneral',
              totalCombinado.toString(),
              Icons.people,
              Colors.blue,
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // Información adicional
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.7),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              Text(
                'Resumen del Sistema',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.pink.shade700,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildInfoItem(
                    'Gestantes Activas',
                    totalGestantesActivas.toString(),
                    Colors.purple,
                  ),
                  Container(
                    width: 1,
                    height: 40,
                    color: Colors.grey.shade300,
                  ),
                  _buildInfoItem(
                    'En Puerperio',
                    totalPuerperio.toString(),
                    Colors.pink,
                  ),
                ],
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 16),
        
        // Botón para ver detalles
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Funcionalidad de detalles próximamente'),
                  backgroundColor: Colors.pink.shade600,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            icon: const Icon(Icons.visibility),
            label: const Text('Ver Detalles'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.pink.shade600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: color,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildErrorContent(BuildContext context, Object error) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Icon(
            Icons.error_outline,
            color: Colors.red.shade400,
            size: 48,
          ),
          const SizedBox(height: 12),
          Text(
            'Error cargando estadísticas',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.red.shade600,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No se pudieron cargar las estadísticas de puerperio',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey.shade600,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () {
              // Recargar el provider
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (context.mounted) {
                  // Invalidar el provider para forzar recarga
                  ProviderScope.containerOf(context).invalidate(puerperioStatsProvider);
                }
              });
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Reintentar'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.pink.shade600,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}