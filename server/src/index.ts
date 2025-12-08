import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from '@colyseus/core';
import { monitor } from '@colyseus/monitor';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { characterServiceNew } from './services/character.service';
import { authService } from './services/auth.service';
import { AppError } from './types/errors';
import { CHARACTER_CLASSES } from 'shared';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 2567;

app.use(cors());
app.use(express.json());

const server = createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  }),
});

// Register room handlers
gameServer.define('game_room', GameRoom);

// Register Colyseus monitor (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/colyseus', monitor());
}

// Auth middleware
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const user = await authService.verifyAndGetUser(token);
    req.user = user;
    next();
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.status).json({ error: error.message });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Character endpoints
app.get('/api/characters', authMiddleware, async (req: any, res) => {
  try {
    const characters = await characterServiceNew.listByUser(req.user.id);
    res.json(characters);
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.status).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/characters', authMiddleware, async (req: any, res) => {
  try {
    const { name, class: characterClass } = req.body;

    const created = await characterServiceNew.create(req.user.id, name, characterClass);
    res.status(201).json(created);
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.status).json({ error: error.message });
    const msg = error?.message || 'Unknown error';
    res.status(400).json({ error: msg });
  }
});

app.get('/api/characters/:id', authMiddleware, async (req: any, res) => {
  try {
    const character = await characterServiceNew.getById(req.params.id);

    if (character.userId !== req.user.id) throw new AppError('Access denied', 403);

    res.json(character);
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.status).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

gameServer.listen(port as number);

console.log(`🚀 Game server listening on port ${port}`);
console.log(`📊 Colyseus monitor available at http://localhost:${port}/colyseus`);
