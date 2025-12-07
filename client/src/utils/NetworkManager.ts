import * as Colyseus from 'colyseus.js';
import { GameState } from 'shared';

export class NetworkManager {
  private static instance: NetworkManager;
  private client!: Colyseus.Client;
  private room?: Colyseus.Room<GameState>;

  private constructor() {
    let serverUrl: string;
    
    if (window.location.hostname.includes('gitpod.dev')) {
      // Gitpod environment - replace port in URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const baseUrl = window.location.host.replace('3000--', '2567--');
      serverUrl = `${protocol}//${baseUrl}`;
    } else {
      // Local development
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      serverUrl = `${protocol}//${host}:2567`;
    }
    
    console.log('Colyseus server URL:', serverUrl);
    this.client = new Colyseus.Client(serverUrl);
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  async connect(): Promise<void> {
    try {
      this.room = await this.client.joinOrCreate<GameState>('game_room');
      console.log('Joined room:', this.room.id);
      
      this.room.onMessage('*', (type, message) => {
        console.log('Message from server:', type, message);
      });

      this.room.onError((code, message) => {
        console.error('Room error:', code, message);
      });

      this.room.onLeave((code) => {
        console.log('Left room:', code);
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  onStateChange(callback: (state: GameState) => void): void {
    if (this.room) {
      this.room.onStateChange(callback);
    }
  }

  sendInput(input: { left?: boolean; right?: boolean; up?: boolean; down?: boolean }): void {
    if (this.room) {
      this.room.send('input', input);
    }
  }

  disconnect(): void {
    if (this.room) {
      this.room.leave();
    }
  }
}
