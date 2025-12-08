import { Game, AUTO } from 'phaser';
import { GameScene } from './scenes/GameScene';
import { CharacterSelectionScene } from './scenes/CharacterSelectionScene';
import { CharacterCreationScene } from './scenes/CharacterCreationScene';
import { LoadingScene } from './scenes/LoadingScene';
import { AuthManager } from './utils/AuthManager';
import { CharacterService } from './utils/CharacterService';

let game: Game | null = null;

const config = {
  type: AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  scene: [LoadingScene, CharacterSelectionScene, CharacterCreationScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

function startGame() {
  if (game) return;
  console.log('✅ Starting game...');
  game = new Game(config);
  (window as any).game = game;

  // Global listeners
  window.addEventListener('character-created', async (event: any) => {
    await handleCharacterCreated(event.detail);
  });
}

async function handleCharacterCreated(data: any) {
  try {
    console.log('Creating character:', data);
    const characterService = CharacterService.getInstance();
    const character = await characterService.createCharacter(data);
    console.log('✅ Character created:', character);

    // Reload characters and go to selection scene with updated list
    const characters = await characterService.getCharacters();
    if (game) {
      game.scene.start('CharacterSelectionScene', { characters });
    }
  } catch (error: any) {
    console.error('Character creation failed:', error);
    alert(error.message || 'Failed to create character');
  }
}

// Initialize auth first, then create game instance (LoadingScene handles loading work)
(async function bootstrap() {
  console.log('🎮 Isometric RPG Client Starting...');
  const authManager = AuthManager.getInstance();
  await authManager.initialize();
  startGame();
})();
