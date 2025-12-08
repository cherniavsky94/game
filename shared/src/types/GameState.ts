import { PlayerState } from './PlayerState';

export interface GameState {
  players: Map<string, PlayerState>;
  serverTime: number;
}
