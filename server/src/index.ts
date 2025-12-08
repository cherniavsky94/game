import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from '@colyseus/core';
import { monitor } from '@colyseus/monitor';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { characterService } from './utils/characterService';
import { verifyToken } from './utils/supabase';
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
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Character endpoints
app.get('/api/characters', authMiddleware, async (req: any, res) => {
  try {
    const characters = await characterService.getCharactersByUserId(req.user.id);
    res.json(characters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/characters', authMiddleware, async (req: any, res) => {
  try {
    const { name, class: characterClass } = req.body;

    if (!name || !characterClass) {
      return res.status(400).json({ error: 'Name and class are required' });
    }

    if (name.length < 3 || name.length > 16) {
      return res.status(400).json({ error: 'Name must be 3-16 characters' });
    }

    // Validate class value
    if (!(characterClass in CHARACTER_CLASSES)) {
      return res.status(400).json({ error: 'Invalid character class' });
    }

    const character = await characterService.createCharacter(req.user.id, name, characterClass);
    res.status(201).json(character);
  } catch (error: any) {
    // Map known errors to appropriate status codes
    const msg = error?.message || 'Unknown error';
    if (msg.includes('Maximum')) {
      return res.status(403).json({ error: msg });
    }
    if (msg.includes('already exists')) {
      return res.status(409).json({ error: msg });
    }

    res.status(400).json({ error: msg });
  }
});

app.get('/api/characters/:id', authMiddleware, async (req: any, res) => {
  try {
    const character = await characterService.getCharacterById(req.params.id);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    if (character.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(character);
  } catch (error: any) {
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
