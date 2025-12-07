import { Scene } from 'phaser';
import { CharacterClass, CHARACTER_CLASSES } from 'shared';

export class CharacterCreationScene extends Scene {
  private selectedClass: CharacterClass | null = null;
  private characterName: string = '';
  private nameInputElement: HTMLInputElement | null = null;

  constructor() {
    super({ key: 'CharacterCreationScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(640, 60, 'Создание персонажа', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(640, 110, 'Выберите класс персонажа', {
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Create class selection grid
    this.createClassGrid();

    // Create name input
    this.createNameInput();

    // Create button
    this.createCreateButton();
  }

  private createClassGrid() {
    const classes = Object.entries(CHARACTER_CLASSES);
    const startX = 200;
    const startY = 180;
    const cardWidth = 240;
    const cardHeight = 140;
    const gap = 20;
    const cols = 4;

    classes.forEach(([classKey, classData], index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      this.createClassCard(
        x,
        y,
        cardWidth,
        cardHeight,
        classKey as CharacterClass,
        classData
      );
    });
  }

  private createClassCard(
    x: number,
    y: number,
    width: number,
    height: number,
    classKey: CharacterClass,
    classData: typeof CHARACTER_CLASSES[keyof typeof CHARACTER_CLASSES]
  ) {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, width, height, 0x2d2d44, 1);
    bg.setStrokeStyle(2, 0x444466);
    bg.setInteractive({ useHandCursor: true });

    // Class icon placeholder (colored circle)
    const icon = this.add.circle(0, -30, 25, classData.color);

    // Class name
    const nameText = this.add.text(0, 10, classData.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Description
    const descText = this.add.text(0, 35, classData.description, {
      fontSize: '12px',
      color: '#aaaaaa',
      wordWrap: { width: width - 20 },
      align: 'center',
    }).setOrigin(0.5);

    // Stats
    const statsText = this.add.text(0, 60, `HP: ${classData.baseHealth} | MP: ${classData.baseMana}`, {
      fontSize: '11px',
      color: '#888888',
    }).setOrigin(0.5);

    container.add([bg, icon, nameText, descText, statsText]);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(0x3d3d54);
      bg.setStrokeStyle(3, 0x667eea);
    });

    bg.on('pointerout', () => {
      if (this.selectedClass !== classKey) {
        bg.setFillStyle(0x2d2d44);
        bg.setStrokeStyle(2, 0x444466);
      }
    });

    bg.on('pointerdown', () => {
      this.selectClass(classKey, bg);
    });

    // Store reference
    (bg as any).classKey = classKey;
  }

  private selectClass(classKey: CharacterClass, bg: Phaser.GameObjects.Rectangle) {
    // Deselect previous
    if (this.selectedClass) {
      const allRects = this.children.list.filter(
        (child) => child instanceof Phaser.GameObjects.Rectangle && (child as any).classKey
      ) as Phaser.GameObjects.Rectangle[];

      allRects.forEach((rect) => {
        if ((rect as any).classKey !== classKey) {
          rect.setFillStyle(0x2d2d44);
          rect.setStrokeStyle(2, 0x444466);
        }
      });
    }

    // Select new
    this.selectedClass = classKey;
    bg.setFillStyle(0x3d3d54);
    bg.setStrokeStyle(3, 0x667eea);

    console.log('Selected class:', classKey);
  }

  private createNameInput() {
    // Label
    this.add.text(640, 500, 'Имя персонажа:', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Create HTML input
    this.nameInputElement = document.createElement('input');
    this.nameInputElement.type = 'text';
    this.nameInputElement.placeholder = 'Введите имя (3-16 символов)';
    this.nameInputElement.maxLength = 16;
    this.nameInputElement.style.cssText = `
      position: absolute;
      left: 50%;
      top: 530px;
      transform: translateX(-50%);
      width: 300px;
      padding: 12px 16px;
      border: 2px solid #444466;
      border-radius: 8px;
      background: #2d2d44;
      color: white;
      font-size: 14px;
      outline: none;
      font-family: Arial, sans-serif;
    `;

    this.nameInputElement.addEventListener('focus', () => {
      if (this.nameInputElement) {
        this.nameInputElement.style.borderColor = '#667eea';
      }
    });

    this.nameInputElement.addEventListener('blur', () => {
      if (this.nameInputElement) {
        this.nameInputElement.style.borderColor = '#444466';
      }
    });

    this.nameInputElement.addEventListener('input', (e) => {
      this.characterName = (e.target as HTMLInputElement).value;
    });

    document.body.appendChild(this.nameInputElement);
  }

  private createCreateButton() {
    const button = this.add.text(640, 600, 'Создать персонажа', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#667eea',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setBackgroundColor('#5568d3');
    });

    button.on('pointerout', () => {
      button.setBackgroundColor('#667eea');
    });

    button.on('pointerdown', () => {
      this.createCharacter();
    });
  }

  private async createCharacter() {
    if (!this.selectedClass) {
      this.showError('Выберите класс персонажа');
      return;
    }

    if (this.characterName.length < 3) {
      this.showError('Имя должно быть не менее 3 символов');
      return;
    }

    if (this.characterName.length > 16) {
      this.showError('Имя должно быть не более 16 символов');
      return;
    }

    try {
      console.log('Creating character:', this.characterName, this.selectedClass);
      
      // Dispatch event with character data
      window.dispatchEvent(new CustomEvent('character-created', {
        detail: {
          name: this.characterName,
          class: this.selectedClass,
        },
      }));

      // Clean up
      this.cleanup();
    } catch (error) {
      console.error('Character creation error:', error);
      this.showError('Ошибка создания персонажа');
    }
  }

  private showError(message: string) {
    const errorText = this.add.text(640, 650, message, {
      fontSize: '14px',
      color: '#ff6b6b',
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      errorText.destroy();
    });
  }

  private cleanup() {
    if (this.nameInputElement) {
      this.nameInputElement.remove();
      this.nameInputElement = null;
    }
  }

  shutdown() {
    this.cleanup();
  }
}
