import { CharacterType } from '../types/Character';
import { PlayerState } from '../types/GameState';

// Messages from client to server
export type ClientInputMessage = {
  type: 'input';
  payload: { left?: boolean; right?: boolean; up?: boolean; down?: boolean };
};

export type ClientSelectCharacter = {
  type: 'select_character';
  payload: { characterId: string };
};

// Messages from server to client
export type ServerStateUpdate = {
  type: 'state_update';
  payload: { state: Partial<PlayerState> };
};

export type ServerCharacterCreated = {
  type: 'character_created';
  payload: { character: CharacterType };
};
