import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Question from './models/Question.js';
import Round from './models/Round.js';

import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import roundRoutes from './routes/roundRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach socket.io instance to Express app
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rounds', roundRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  const defaultRound = await Round.findOneAndUpdate(
    { order: 1 },
    { $setOnInsert: { order: 1, title: 'Round 1', passingMark: 1, isOpen: true } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const legacyRounds = await Round.find({ passingPercentage: { $exists: true } });
  for (const round of legacyRounds) {
    const questionCount = await Question.countDocuments({ roundId: round._id });
    round.passingMark = Math.ceil((questionCount * round.passingPercentage) / 100) || 1;
    round.passingPercentage = undefined;
    await round.save();
  }
  await Question.updateMany({ roundId: { $exists: false } }, { $set: { roundId: defaultRound._id } });
  await Question.syncIndexes();
  server.listen(PORT, () => {
    console.log(`🚀 [Server] EnigmaGrid Backend listening on port ${PORT}`);
  });
});
