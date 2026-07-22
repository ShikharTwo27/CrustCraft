const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { env } = require('./config/env');
const { initScheduler } = require('./services/scheduler');
const { initSocket } = require('./config/socket');

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

connectDB().then(() => {
  initScheduler();
});

const server = http.createServer(app);

initSocket(server);

const PORT = env.PORT;
const httpServer = server.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err?.name, err?.message, err?.stack);
  httpServer.close(() => {
    process.exit(1);
  });
});
