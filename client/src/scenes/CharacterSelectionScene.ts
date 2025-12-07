import { Scene } from 'phaser';
import { CharacterData, CHARACTER_CLASSES, GAME_CONFIG } from 'shared';
import { AuthManager } from '../utils/AuthManager';

export class CharacterSelectionScene extends Scene {
  private characters: CharacterData[] = [];

  constructor() {
    super({ key: 'CharacterSelectionScene' });
  }

  init(data: { characters: CharacterData[] }) {
    this.characters = data.characters || [];
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(640, 60, 'Выбор персонажа', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // User info
    this.showUserInfo();

    // Character count
    this.add.text(640, 120, `Персонажей: ${this.characters.length}/${GAME_CONFIG.MAX_CHARACTERS_PER_USER}`, {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Create character grid
    this.createCharacterGrid();

    // Create "New Character" button if not at limit
    if (this.characters.length < GAME_CONFIG.MAX_CHARACTERS_PER_USER) {
      this.createNewCharacterButton();
    }

    // Sign out button
    this.createSignOutButton();
  }

  private async showUserInfo() {
    const authManager = AuthManager.getInstance();
    const user = await authManager.getCurrentUser();

    if (user) {
      this.add.text(20, 20, `${user.email}`, {
        fontSize: '14px',
        color: '#888888',
      });
    }
  }

  private createCharacterGrid() {
    if (this.characters.length === 0) {
      this.add.text(640, 360, 'У вас пока нет персонажей', {
        fontSize: '18px',
        color: '#666666',
      }).setOrigin(0.5);
      return;
    }

    const startX = 200;
    const startY = 180;
    const cardWidth = 200;
    const cardHeight = 280;
    const gap = 30;
    const cols = 5;

    this.characters.forEach((character, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      this.createCharacterCard(x, y, cardWidth, cardHeight, character);
    });
  }

  private createCharacterCard(
    x: number,
    y: number,
    width: number,
    height: number,
    character: CharacterData
  ) {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, width, height, 0x2d2d44, 1);
    bg.setStrokeStyle(2, 0x444466);
    bg.setInteractive({ useHandCursor: true });

    // Class color indicator
    const classData = CHARACTER_CLASSES[character.class];
    const classColor = this.add.rectangle(0, -height / 2 + 5, width, 10, classData.color);

    // Character icon (colored circle)
    const icon = this.add.circle(0, -80, 40, classData.color);

    // Character name
    const nameText = this.add.text(0, -20, character.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Class name
    const classText = this.add.text(0, 10, classData.name, {
      fontSize: '14px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Level
    const levelText = this.add.text(0, 40, `Уровень ${character.level}`, {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Stats
    const statsText = this.add.text(0, 70, `HP: ${character.health}/${character.maxHealth}\nMP: ${character.mana}/${character.maxMana}`, {
      fontSize: '12px',
      color: '#888888',
      align: 'center',
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.text(0, 115, 'Играть', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#667eea',
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => {
      playButton.setBackgroundColor('#5568d3');
    });

    playButton.on('pointerout', () => {
      playButton.setBackgroundColor('#667eea');
    });

    playButton.on('pointerdown', () => {
      this.selectCharacter(character);
    });

    container.add([bg, classColor, icon, nameText, classText, levelText, statsText, playButton]);

    // Hover effect
    bg.on('pointerover', () => {
      bg.setStrokeStyle(3, 0x667eea);
    });

    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, 0x444466);
    });
  }

  private createNewCharacterButton() {
    const button = this.add.text(640, 650, '+ Создать нового персонажа', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#28a745',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setBackgroundColor('#218838');
    });

    button.on('pointerout', () => {
      button.setBackgroundColor('#28a745');
    });

    button.on('pointerdown', () => {
      this.scene.start('CharacterCreationScene');
    });
  }

  private createSignOutButton() {
    const button = this.add.text(1260, 20, 'Выйти', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#dc3545',
      padding: { x: 15, y: 8 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setBackgroundColor('#c82333');
    });

    button.on('pointerout', () => {
      button.setBackgroundColor('#dc3545');
    });

    button.on('pointerdown', async () => {
      const authManager = AuthManager.getInstance();
      await authManager.signOut();
      
      this.game.destroy(true);
      (window as any).game = null;
    });
  }

  private selectCharacter(character: CharacterData) {
    console.log('Selected character:', character);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('character-selected', {
      detail: character,
    }));

    // Start game scene
    this.scene.start('GameScene', { character });
  }
}
