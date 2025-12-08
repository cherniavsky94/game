import { Scene } from 'phaser';
import { CharacterService } from '../utils/CharacterService';
import { AuthManager } from '../utils/AuthManager';

export class LoadingScene extends Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#111218');

    this.add.text(this.cameras.main.centerX, 200, 'Загрузка игры...', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Progress bar background
    const barWidth = 600;
    const barHeight = 24;
    const x = this.cameras.main.centerX - barWidth / 2;
    const y = this.cameras.main.centerY - barHeight / 2;

    const bg = this.add.rectangle(x, y, barWidth, barHeight, 0x222233).setOrigin(0, 0);
    const fg = this.add.rectangle(x + 2, y + 2, 0, barHeight - 4, 0x4caf50).setOrigin(0, 0);

    const progressText = this.add.text(this.cameras.main.centerX, y + barHeight + 20, '0%', {
      fontSize: '14px',
      color: '#cccccc',
    }).setOrigin(0.5, 0);

    const updateProgress = (p: number) => {
      const w = Math.max(0, Math.min(1, p)) * (barWidth - 4);
      fg.width = w;
      progressText.setText(`${Math.round(p * 100)}%`);
    };

    (async () => {
      // Step 1: initialize auth (if any)
      updateProgress(0.1);
      const auth = AuthManager.getInstance();
      const isAuth = await auth.initialize();
      updateProgress(0.3);

      // Step 2: load characters (if authenticated)
      let characters: any[] = [];
      try {
        if (isAuth) {
          const svc = CharacterService.getInstance();
          // simulate progress
          updateProgress(0.45);
          characters = await svc.getCharacters();
          updateProgress(0.9);
        }
      } catch (e) {
        console.warn('Loading characters failed', e);
      }

      // Finalize
      updateProgress(1);
      this.time.delayedCall(300, () => {
        if (!characters || characters.length === 0) {
          this.scene.start('CharacterCreationScene');
        } else {
          this.scene.start('CharacterSelectionScene', { characters });
        }
      });
    })();
  }
}
