import { Room, Client } from '@colyseus/core';
import { GameState } from '../schemas/GameState';
import { Player } from '../schemas/Player';
import { characterServiceNew } from '../services/character.service';
import { authService } from '../services/auth.service';
import { AppError } from '../types/errors';

export class GameRoom extends Room<GameState> {
  maxClients = 50;

  onCreate(options: any) {
    this.setState(new GameState());
    
    this.onMessage('input', (client, input) => {
      this.handlePlayerInput(client, input);
    });

    // Game loop - update at 60 FPS
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 1000 / 60);

    console.log('GameRoom created:', this.roomId);
  }

  onJoin(client: Client, options: any) {
    console.log(`Player ${client.sessionId} joined`);

    (async () => {
      try {
        // If client provided a token and characterId, try to load the character
        if (options?.token && options?.characterId) {
          const user = await authService.verifyAndGetUser(options.token);
          const character = await characterServiceNew.getById(options.characterId);

          if (character.userId !== user.id) {
            console.warn('Character does not belong to authenticated user:', client.sessionId);
            client.leave();
            return;
          }

          const player = new Player();
          player.id = client.sessionId;
          player.x = character.x ?? Math.random() * 800;
          player.y = character.y ?? Math.random() * 600;
          player.username = character.name;

          this.state.players.set(client.sessionId, player);
          return;
        }

        // Fallback: create a guest player
        const player = new Player();
        player.id = client.sessionId;
        player.x = Math.random() * 800;
        player.y = Math.random() * 600;
        player.username = options.username || `Player_${client.sessionId.substring(0, 4)}`;

        this.state.players.set(client.sessionId, player);
      } catch (err: any) {
        console.error('Error during onJoin:', err instanceof AppError ? err.message : err);
        try {
          client.leave();
        } catch (_) {
          // ignore
        }
      }
    })();
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('GameRoom disposed:', this.roomId);
  }

  private handlePlayerInput(client: Client, input: any) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const speed = 5;

    if (input.left) player.x -= speed;
    if (input.right) player.x += speed;
    if (input.up) player.y -= speed;
    if (input.down) player.y += speed;

    // Keep player in bounds
    player.x = Math.max(0, Math.min(1280, player.x));
    player.y = Math.max(0, Math.min(720, player.y));
  }

  private update(deltaTime: number) {
    // Game logic updates here
    // This runs 60 times per second
  }
}
