const { Server: SocketIOServer } = require('socket.io');
const { env } = require('./env');

let io = null;

const initSocket = (server) => {
  const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.loca.lt')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

    socket.on('joinOrder', (orderId) => {
      socket.join(orderId);
      console.log(`👤 Socket ${socket.id} joined order room: ${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
