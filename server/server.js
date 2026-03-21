require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const summaryRoutes = require('./src/routes/summaryRoutes');
const transcriptionRoutes = require('./src/routes/transcriptionRoutes');
const translationRoutes = require('./src/routes/translationRoutes');
const { registerTranslationSocketHandlers } = require('./src/sockets/translationSocket');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST'],
  credentials: true,
};

const io = new Server(server, { cors: corsOptions });

app.use(express.json({ limit: '20mb' }));
app.use(cors(corsOptions));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'voicebridge-api', timestamp: new Date().toISOString() });
});

app.use('/', summaryRoutes);
app.use('/', transcriptionRoutes);
app.use('/', translationRoutes);

io.on('connection', (socket) => {
  console.log('A user connected');
  registerTranslationSocketHandlers(socket);

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. VoiceBridge API is likely already running in another terminal.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error?.message || error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
