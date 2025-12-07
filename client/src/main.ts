import { Game, AUTO } from 'phaser';
import { GameScene } from './scenes/GameScene';
import { CharacterSelectionScene } from './scenes/CharacterSelectionScene';
import { CharacterCreationScene } from './scenes/CharacterCreationScene';
import { AuthManager } from './utils/AuthManager';
import { CharacterService } from './utils/CharacterService';

let game: Game | null = null;
let isLoadingCharacters = false;

const config = {
  type: AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  scene: [CharacterSelectionScene, CharacterCreationScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

async function initializeApp() {
  console.log('🎮 Isometric RPG Client Starting...');
  
  const authManager = AuthManager.getInstance();
  const isAuthenticated = await authManager.initialize();

  if (isAuthenticated) {
    await loadCharacters();
  }

  // Listen for successful authentication (only once)
  window.addEventListener('auth-success', async () => {
    if (!isLoadingCharacters && !game) {
      await loadCharacters();
    }
  }, { once: false });

  // Listen for character creation
  window.addEventListener('character-created', async (event: any) => {
    await handleCharacterCreated(event.detail);
  });
}

async function loadCharacters() {
  if (game || isLoadingCharacters) {
    console.log('Game already running or loading');
    return;
  }

  isLoadingCharacters = true;

  try {
    console.log('📦 Loading characters...');
    const characterService = CharacterService.getInstance();
    const characters = await characterService.getCharacters();

    console.log(`✅ Loaded ${characters.length} characters`);

    // Start game with character selection
    startGame(characters);
  } catch (error) {
    console.error('Failed to load characters:', error);
    // Start with empty character list
    startGame([]);
  } finally {
    isLoadingCharacters = false;
  }
}

function startGame(characters: any[]) {
  if (game) {
    return;
  }

  console.log('✅ Starting game...');
  game = new Game(config);

  // Make game globally accessible
  (window as any).game = game;

  // Wait for game to be ready, then start appropriate scene
  game.events.once('ready', () => {
    if (characters.length === 0) {
      // No characters, go to creation
      game!.scene.start('CharacterCreationScene');
    } else {
      // Has characters, go to selection
      game!.scene.start('CharacterSelectionScene', { characters });
    }
  });
}

async function handleCharacterCreated(data: any) {
  try {
    console.log('Creating character:', data);
    const characterService = CharacterService.getInstance();
    const character = await characterService.createCharacter(data);
    
    console.log('✅ Character created:', character);

    // Reload characters and restart selection scene
    const characters = await characterService.getCharacters();
    
    if (game) {
      game.scene.start('CharacterSelectionScene', { characters });
    }
  } catch (error: any) {
    console.error('Character creation failed:', error);
    alert(error.message || 'Failed to create character');
  }
}

// Start the app
initializeApp();
