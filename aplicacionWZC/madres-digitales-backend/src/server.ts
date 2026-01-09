import { createServer } from 'http';
import app from './app';
import { WebSocketService } from './services/websocket.service';
import { NotificationService } from './services/notification.service';

const PORT = process.env.PORT || 54112;
const HOST = '0.0.0.0';
const WS_PORT = 3001; // Puerto fijo para WebSocket

// Crear servidor HTTP
const server = createServer(app);

// Inicializar WebSocket en un puerto separado
const wsServer = createServer();
const webSocketService = new WebSocketService(wsServer);

// Configurar NotificationService con WebSocket
// Nota: Esto se puede hacer de manera más elegante con inyección de dependencias
global.webSocketService = webSocketService;

server.listen(Number(PORT), () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Acceso desde red local: http://192.168.1.60:${PORT}`);
  console.log(`🌐 Swagger: http://192.168.1.60:${PORT}/api-docs`);
});

wsServer.listen(WS_PORT, () => {
  console.log(`🔌 WebSocket server running on ws://${HOST}:${WS_PORT}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default server;