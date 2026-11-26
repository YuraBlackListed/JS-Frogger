
export class Music {
  constructor() {
    this.tracks = {
      Classic: new Audio('assets/audio/classic.mp3'),
      Christmas: new Audio('assets/audio/christmas.mp3')
    };

    this.currentTrack = null;
    this.splat = new Audio('assets/audio/splat.mp3');
    this.splat.volume = 0.6;


    this.gameOver = new Audio('assets/audio/gameover.mp3');
    this.gameOver.volume = 0.6;
    this.gameOver.loop = false;

    for (const audio of Object.values(this.tracks)) {
      audio.loop = true;
      audio.volume = 0.3;
    }
  }

  play(theme) {
    const nextTrack = this.tracks[theme];

    if (!nextTrack) return;

    if (this.currentTrack !== nextTrack) {
      this.stop();
      this.currentTrack = nextTrack;
    }

    this.currentTrack.play().catch((error) => {
      console.warn('Music could not play:', error);
    });
  }

  playSplat() {
    this.splat.currentTime = 0;
    this.splat.play().catch((error) => {
      console.warn('Splat could not play:', error);
  });
}

  playGameOver() {
    this.stop();
    this.gameOver.currentTime = 0;
    this.gameOver.play().catch((error) => {
      console.warn('Game Over sound could not play:', error);
    });
  }

  stopGameOver() {
    this.gameOver.pause();
    this.gameOver.currentTime = 0;
  }

  stop() {
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
      this.currentTrack = null;
    }
  }
}
