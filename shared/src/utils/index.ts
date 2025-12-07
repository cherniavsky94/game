import { Position, IsometricPosition } from '../types';
import { GAME_CONFIG } from '../constants';

export function cartesianToIsometric(x: number, y: number): IsometricPosition {
  const col = Math.floor((x / GAME_CONFIG.TILE_WIDTH + y / GAME_CONFIG.TILE_HEIGHT) / 2);
  const row = Math.floor((y / GAME_CONFIG.TILE_HEIGHT - x / GAME_CONFIG.TILE_WIDTH) / 2);
  return { row, col };
}

export function isometricToCartesian(row: number, col: number): Position {
  const x = (col - row) * (GAME_CONFIG.TILE_WIDTH / 2);
  const y = (col + row) * (GAME_CONFIG.TILE_HEIGHT / 2);
  return { x, y };
}

export function distance(p1: Position, p2: Position): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
