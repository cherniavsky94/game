import * as Colyseus from 'colyseus.js';
import { GameState } from 'shared';
import { store } from '../store';

type MessageHandler = (type: string, payload: any) => void;
type StateHandler = (state: Partial<GameState>) => void;
type SimpleHandler = () => void;

export class NetworkManager {
  private static instance: NetworkManager;
  private client!: Colyseus.Client;
  private room?: Colyseus.Room<GameState>;

  // connection/reconnect config
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelayMs = 1000; // 1s
  private backoffFactor = 1.8;
  private reconnectTimer?: number;

  // heartbeat
  private heartbeatIntervalMs = 5000;
  private heartbeatTimer?: number;
  private lastPongAt = 0;
  private heartbeatTimeoutMs = 15000; // if no pong for 15s -> reconnect

  // outgoing queue while disconnected
  private outgoingQueue: Array<{ type: string; payload: any }> = [];

  // external handlers
  private messageHandlers: MessageHandler[] = [];
  private stateHandlers: StateHandler[] = [];
  private onConnectHandlers: SimpleHandler[] = [];
  private onDisconnectHandlers: SimpleHandler[] = [];
  private onErrorHandlers: ((err: any) => void)[] = [];

  private isConnected = false;

  private constructor() {
    const serverUrl = this.resolveServerUrl();
    console.log('Colyseus server URL:', serverUrl);
    this.client = new Colyseus.Client(serverUrl);
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private resolveServerUrl(): string {
    if (window.location.hostname.includes('gitpod.dev')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const baseUrl = window.location.host.replace('3000--', '2567--');
      return `${protocol}//${baseUrl}`;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    return `${protocol}//${host}:2567`;
  }

  async connect(roomName = 'game_room', options?: Record<string, any>): Promise<void> {
    try {
      this.clearReconnectTimer();
      this.room = await this.client.joinOrCreate<GameState>(roomName, options || {});
      this.isConnected = true;
      this.reconnectAttempts = 0;

      console.log('Joined room:', this.room.id);

      this.attachRoomHandlers(this.room);

      // fire external connect handlers
      this.onConnectHandlers.forEach((h) => h());

      this.startHeartbeat();
      this.flushQueue();
    } catch (error) {
      console.error('Failed to join room:', error);
      this.onErrorHandlers.forEach((h) => h(error));
      this.scheduleReconnect(roomName, options);
    }
  }

  private attachRoomHandlers(room: Colyseus.Room<GameState>) {
    room.onMessage('*', (type: string, message: any) => {
      // heartbeat ack handling
      if (type === 'heartbeat_ack') {
        this.lastPongAt = Date.now();
      }

      // pass to external message handlers
      this.messageHandlers.forEach((h) => {
        try {
          h(type, message);
        } catch (e) {
          console.error('NetworkManager handler error', e);
        }
      });
    });

    room.onStateChange((state: GameState) => {
      try {
        const s = { ...state } as Partial<GameState>;
        store.setColyseusState(s);
        this.stateHandlers.forEach((h) => h(s));
      } catch (e) {
        console.error('Failed to map colyseus state to store', e);
      }
    });

    room.onError((code, message) => {
      console.error('Room error:', code, message);
      this.onErrorHandlers.forEach((h) => h({ code, message }));
    });

    room.onLeave((code) => {
      console.log('Left room:', code);
      this.isConnected = false;
      this.onDisconnectHandlers.forEach((h) => h());
      // attempt reconnection
      this.scheduleReconnect(room.name);
    });
  }

  private scheduleReconnect(roomName = 'game_room', options?: Record<string, any>) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts += 1;
    const delay = Math.round(this.baseReconnectDelayMs * Math.pow(this.backoffFactor, this.reconnectAttempts - 1));
    console.log(`Scheduling reconnect #${this.reconnectAttempts} in ${delay}ms`);

    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(() => {
      this.connect(roomName, options).catch(() => {
        // if connect fails, schedule again
        this.scheduleReconnect(roomName, options);
      });
    }, delay) as unknown as number;
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.lastPongAt = Date.now();
    this.heartbeatTimer = window.setInterval(() => {
      try {
        if (!this.room) return;
        // send lightweight heartbeat
        this.room.send('heartbeat', { ts: Date.now() });

        // check last pong
        if (Date.now() - this.lastPongAt > this.heartbeatTimeoutMs) {
          console.warn('Heartbeat timeout detected, reconnecting');
          // force reconnect
          this.disconnect();
          this.scheduleReconnect(this.room?.name);
        }
      } catch (e) {
        console.error('Heartbeat error', e);
      }
    }, this.heartbeatIntervalMs) as unknown as number;
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private flushQueue() {
    if (!this.room) return;
    while (this.outgoingQueue.length > 0) {
      const item = this.outgoingQueue.shift();
      try {
        this.room.send(item!.type, item!.payload);
      } catch (e) {
        console.warn('Failed to flush queued message, re-enqueue', e);
        this.outgoingQueue.unshift(item!);
        break;
      }
    }
  }

  // Public API: event registration
  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
  }

  offMessage(handler: MessageHandler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  onState(handler: StateHandler) {
    this.stateHandlers.push(handler);
  }

  offState(handler: StateHandler) {
    this.stateHandlers = this.stateHandlers.filter((h) => h !== handler);
  }

  onConnect(handler: SimpleHandler) {
    this.onConnectHandlers.push(handler);
  }

  offConnect(handler: SimpleHandler) {
    this.onConnectHandlers = this.onConnectHandlers.filter((h) => h !== handler);
  }

  onDisconnect(handler: SimpleHandler) {
    this.onDisconnectHandlers.push(handler);
  }

  offDisconnect(handler: SimpleHandler) {
    this.onDisconnectHandlers = this.onDisconnectHandlers.filter((h) => h !== handler);
  }

  onError(handler: (err: any) => void) {
    this.onErrorHandlers.push(handler);
  }

  offError(handler: (err: any) => void) {
    this.onErrorHandlers = this.onErrorHandlers.filter((h) => h !== handler);
  }

  send(type: string, payload: any) {
    if (this.room && this.isConnected) {
      try {
        this.room.send(type, payload);
      } catch (e) {
        console.warn('Send failed, queuing message', e);
        this.outgoingQueue.push({ type, payload });
      }
    } else {
      // queue until connected
      this.outgoingQueue.push({ type, payload });
    }
  }

  sendInput(input: { left?: boolean; right?: boolean; up?: boolean; down?: boolean }) {
    this.send('input', input);
  }

  disconnect(clearReconnect = true) {
    this.isConnected = false;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    if (this.room) {
      try {
        this.room.leave();
      } catch (e) {
        console.warn('Error leaving room', e);
      }
      this.room = undefined;
    }
    if (clearReconnect) {
      this.reconnectAttempts = 0;
    }
  }

  // Configuration helpers
  setMaxReconnectAttempts(n: number) {
    this.maxReconnectAttempts = Math.max(0, Math.floor(n));
  }

  setHeartbeatInterval(ms: number) {
    this.heartbeatIntervalMs = Math.max(100, ms);
    if (this.isConnected) {
      this.startHeartbeat();
    }
  }

  setHeartbeatTimeout(ms: number) {
    this.heartbeatTimeoutMs = Math.max(1000, ms);
  }

  setBackoffFactor(f: number) {
    this.backoffFactor = Math.max(1.1, f);
  }

  isOnline() {
    return this.isConnected;
  }
}

