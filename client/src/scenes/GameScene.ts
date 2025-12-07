import { Scene } from 'phaser';
import { CharacterData, CHARACTER_CLASSES } from 'shared';

export class GameScene extends Scene {
  private character!: CharacterData;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { character: CharacterData }) {
    this.character = data.character;
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Character info
    const classData = CHARACTER_CLASSES[this.character.class];
    
    this.add.text(640, 100, `Добро пожаловать, ${this.character.name}!`, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 150, classData.name, {
      fontSize: '24px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Character icon
    this.add.circle(640, 250, 60, classData.color);

    // Stats
    const statsText = `
Уровень: ${this.character.level}
Опыт: ${this.character.experience}
HP: ${this.character.health}/${this.character.maxHealth}
MP: ${this.character.mana}/${this.character.maxMana}
    `.trim();

    this.add.text(640, 360, statsText, {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    // Info text
    this.add.text(640, 500, 'Игровой мир скоро будет доступен...', {
      fontSize: '16px',
      color: '#888888',
    }).setOrigin(0.5);

    // Back button
    this.createBackButton();
  }

  private createBackButton() {
    const button = this.add.text(20, 20, '← Выбор персонажа', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#667eea',
      padding: { x: 15, y: 10 },
    }).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setBackgroundColor('#5568d3');
    });

    button.on('pointerout', () => {
      button.setBackgroundColor('#667eea');
    });

    button.on('pointerdown', () => {
      // Go back to character selection
      window.location.reload();
    });
  }
}
