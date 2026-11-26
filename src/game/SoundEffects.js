
export class SoundEffects {
  constructor() {
    this.jumpSound = new Audio('assets/audio/jump.mp3');
    this.jumpSound.volume = 0.5;
    this.jumpSound.preload = 'auto';
  }

  playJump() {
    this.jumpSound.currentTime = 0;

    this.jumpSound.play().catch((error) => {
      console.warn('Jump sound could not play:', error);
    });
  }
}
