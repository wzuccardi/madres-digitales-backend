const { Server } = require('socket.io');
const http = require('http');

// Crear servidor HTTP simple para WebSocket
const server = http.createServer();

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3008',
      'http://localhost:3009',
      'http://localhost:3000',
      'http://localhost:54112',
      'https://madres-digitales-frontend.vercel.app',
      'https://madres-digitales.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Mapa de usuarios conectados
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Autenticación del socket
  socket.on('authenticate', (data) => {
    const { userId, role, email } = data;
    connectedUsers.set(socket.id, { userId, role, email, socketId: socket.id, connectedAt: new Date() });
    console.log('✅ Usuario autenticado:', email, 'Rol:', role);
    socket.emit('authenticated', { success: true });
  });

  // Unirse a salas por rol
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`📍 Socket ${socket.id} se unió a la sala: ${room}`);
  });

  // Evento de alerta creada
  socket.on('alerta:created', (data) => {
    console.log('🚨 Nueva alerta creada:', data);
    // Emitir a todos los clientes conectados
    io.emit('alerta:created', data);
  });

  // Evento de SOS EMERGENCIA
  socket.on('sos:emergencia', (data) => {
    console.log('🚨🚨🚨 EMERGENCIA SOS:', data);
    // Emitir a TODOS los clientes conectados con máxima prioridad
    io.emit('sos:emergencia', data);
    // Emitir específicamente a salas de roles críticos
    io.to('admin').emit('sos:emergencia', data);
    io.to('coordinador').emit('sos:emergencia', data);
    io.to('medico').emit('sos:emergencia', data);
    console.log('📡 Notificación SOS emitida a todos los usuarios');
  });

  // Evento de control creado
  socket.on('control:created', (data) => {
    console.log('📋 Nuevo control creado:', data);
    // Emitir a todos los clientes conectados
    io.emit('control:created', data);
  });

  // Evento de alerta leída
  socket.on('alerta:read', (data) => {
    console.log('👁️ Alerta leída:', data);
    io.emit('alerta:read', data);
  });

  // Evento de cambio de estado de alerta
  socket.on('alerta:status', (data) => {
    console.log('🔄 Estado de alerta cambiado:', data);
    io.emit('alerta:status', data);
  });

  // Desconexión
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log('👋 Usuario desconectado:', user.email);
      connectedUsers.delete(socket.id);
    } else {
      console.log('👋 Cliente desconectado:', socket.id);
    }
  });
});

// Iniciar servidor en puerto 3001
const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket Server running on http://localhost:${PORT}`);
  console.log(`📊 Usuarios conectados: ${connectedUsers.size}`);
});

// Manejo de errores
server.on('error', (error) => {
  console.error('❌ Error en WebSocket Server:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor WebSocket...');
  server.close(() => {
    console.log('✅ Servidor WebSocket cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor WebSocket...');
  server.close(() => {
    console.log('✅ Servidor WebSocket cerrado');
    process.exit(0);
  });
});
