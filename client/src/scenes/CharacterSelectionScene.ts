import { Scene } from 'phaser';
import { CHARACTER_CLASSES, GAME_CONFIG } from 'shared';
import { CharacterType } from 'shared/types';
import { AuthManager } from '../utils/AuthManager';
import { CharacterService } from '../utils/CharacterService';
import store, { ClientState } from '../store';

export class CharacterSelectionScene extends Scene {
  private characters: CharacterType[] = [];
  private loadingText?: Phaser.GameObjects.Text;
  private errorText?: Phaser.GameObjects.Text;
  private storeUnsub?: () => void;
  private gridContainer?: Phaser.GameObjects.Container;
  private newButton?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CharacterSelectionScene' });
  }

  init(data: { characters: CharacterType[] }) {
    this.characters = data.characters || [];
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add
      .text(640, 60, 'Выбор персонажа', {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // User info
    this.showUserInfo();

    // Character count (placeholder, will update after load)
    this.add
      .text(this.cameras.main.centerX, 120, '', {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setName('character-count');

    // Loading indicator
    this.loadingText = this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, 'Загрузка персонажей...', {
        fontSize: '18px',
        color: '#cccccc',
      })
      .setOrigin(0.5);

    // Buttons and other UI
    this.createNewCharacterButton();
    this.createSignOutButton();

    // Create a container for dynamic grid so we can clear it on updates
    this.gridContainer = this.add.container(0, 0);

    // Subscribe to store for characters and user updates
    this.storeUnsub = store.subscribe((s) => {
      this.characters = s.characters || [];

      // update count
      const countText = this.children.getByName('character-count') as
        | Phaser.GameObjects.Text
        | undefined;
      if (countText) {
        countText.setText(
          `Персонажей: ${this.characters.length}/${GAME_CONFIG.MAX_CHARACTERS_PER_USER}`
        );
      }

      // update new button state
      if (this.newButton) {
        const atLimit = this.characters.length >= GAME_CONFIG.MAX_CHARACTERS_PER_USER;
        this.newButton.setText(
          atLimit ? `Достигнут лимит персонажей (${GAME_CONFIG.MAX_CHARACTERS_PER_USER})` : '+ Создать нового персонажа'
        );
        this.newButton.setInteractive(atLimit ? undefined : { useHandCursor: true });
        this.newButton.setBackgroundColor(atLimit ? '#6c757d' : '#28a745');
      }

      // remove previous grid children
      if (this.gridContainer) {
        this.gridContainer.removeAll(true);
      }

      // render grid into the grid container
      this.createCharacterGrid();
    });

    // Initial load if store empty
    if ((store.getState().characters || []).length === 0) {
      this.loadCharacters();
    }
    // Fetch characters from API and render (only if needed above)
  }

  private async loadCharacters() {
    try {
      const svc = CharacterService.getInstance();
      const chars = await svc.getCharacters();
      this.characters = chars || [];

      // Update count text
      const countText = this.children.getByName('character-count') as
        | Phaser.GameObjects.Text
        | undefined;
      if (countText) {
        countText.setText(
          `Персонажей: ${this.characters.length}/${GAME_CONFIG.MAX_CHARACTERS_PER_USER}`
        );
      }

      // Remove loading indicator
      if (this.loadingText) {
        this.loadingText.destroy();
        this.loadingText = undefined;
      }

      // grid will be rendered by store subscription
    } catch (err: any) {
      console.error('Failed to load characters', err);
      if (this.loadingText) {
        this.loadingText.setText('Не удалось загрузить персонажей');
      }
      this.errorText = this.add
        .text(this.cameras.main.centerX, this.cameras.main.centerY + 40, err?.message || 'Ошибка', {
          fontSize: '14px',
          color: '#ff6b6b',
        })
        .setOrigin(0.5);
    }
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
    const cam = this.cameras.main;
    const camWidth = cam.width;
    const camCenterX = cam.centerX;

    const cardWidth = 200;
    const cardHeight = 280;
    const gap = 30;

    if (this.characters.length === 0) {
      this.add
        .text(camCenterX, cam.centerY, 'У вас пока нет персонажей', {
          fontSize: '18px',
          color: '#666666',
        })
        .setOrigin(0.5);
      return;
    }

    // Compute columns dynamically based on camera width
    let cols = Math.floor((camWidth - 200) / (cardWidth + gap));
    cols = Math.max(1, Math.min(6, cols));

    const totalWidth = cols * cardWidth + (cols - 1) * gap;
    const startX = (camWidth - totalWidth) / 2 + cardWidth / 2;
    const startY = 180;

    this.characters.forEach((character, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      const card = this.createCharacterCard(x, y, cardWidth, cardHeight, character);
      if (this.gridContainer && card) this.gridContainer.add(card);
    });
  }

  private createCharacterCard(
    x: number,
    y: number,
    width: number,
    height: number,
    character: CharacterType
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
    const nameText = this.add
      .text(0, -20, character.name, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Class name
    const classText = this.add
      .text(0, 10, classData.name, {
        fontSize: '14px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    // Level
    const levelText = this.add
      .text(0, 40, `Уровень ${character.level}`, {
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Stats
    const statsText = this.add
      .text(
        0,
        70,
        `HP: ${character.health}/${character.maxHealth}\nMP: ${character.mana}/${character.maxMana}`,
        {
          fontSize: '12px',
          color: '#888888',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    // Play button
    const playButton = this.add
      .text(0, 115, 'Играть', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#667eea',
        padding: { x: 20, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

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
    // return the container so caller can add to grid container
    return container;
  }

  private createNewCharacterButton() {
    const cam = this.cameras.main;
    const atLimit = this.characters.length >= GAME_CONFIG.MAX_CHARACTERS_PER_USER;

    const button = this.add
      .text(
        cam.centerX,
        cam.height - 60,
        atLimit ? 'Достигнут лимит персонажей (10)' : '+ Создать нового персонажа',
        {
          fontSize: '18px',
          color: '#ffffff',
          backgroundColor: atLimit ? '#6c757d' : '#28a745',
          padding: { x: 30, y: 15 },
        }
      )
      .setOrigin(0.5)
      .setInteractive(atLimit ? undefined : { useHandCursor: true });

    this.newButton = button;

    button.on('pointerover', () => {
      button.setBackgroundColor('#218838');
    });

    button.on('pointerout', () => {
      button.setBackgroundColor('#28a745');
    });

    button.on('pointerdown', () => {
      if (atLimit) return;
      this.scene.start('CharacterCreationScene');
    });
  }

  shutdown() {
    if (this.storeUnsub) this.storeUnsub();
    if (this.gridContainer) {
      this.gridContainer.removeAll(true);
      this.gridContainer.destroy();
    }
  }

  private createSignOutButton() {
    const button = this.add
      .text(1260, 20, 'Выйти', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#dc3545',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

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

  private selectCharacter(character: CharacterType) {
    console.log('Selected character:', character);
    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('character-selected', {
        detail: character,
      })
    );

    // Start game scene
    this.scene.start('GameScene', { character });
  }
}
