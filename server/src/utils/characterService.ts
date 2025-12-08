// Deprecated compatibility layer.
// This file remains to avoid breaking imports; prefer `server/src/services/character.service.ts`.
console.warn('Deprecated: server/src/utils/characterService.ts - re-exporting from services/character.service.ts');

export * from '../services/character.service';
