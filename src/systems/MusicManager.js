class MusicManager {
  constructor() {
    this.currentMusic = null;
    this.currentKey = null;

    // Volume de secours si une scène ne précise rien.
    this.defaultVolume = 0.5;
  }

  play(scene, musicKey, options = {}) {
    const volume = options.volume ?? this.defaultVolume;
    const fadeDuration = options.fadeDuration ?? 900;

    // Si la musique demandée joue déjà, on ne la relance pas.
    // On ajuste simplement son volume au besoin.
    if (this.currentKey === musicKey && this.currentMusic?.isPlaying) {
      this.fadeTo(scene, this.currentMusic, volume, fadeDuration);
      return;
    }

    const previousMusic = this.currentMusic;

    const nextMusic = scene.sound.add(musicKey, {
      loop: true,
      volume: 0,
    });

    nextMusic.play();

    this.currentMusic = nextMusic;
    this.currentKey = musicKey;

    // Fondu entrant de la nouvelle musique.
    this.fadeTo(scene, nextMusic, volume, fadeDuration);

    // Fondu sortant de l’ancienne musique.
    if (previousMusic?.isPlaying) {
      scene.tweens.add({
        targets: previousMusic,
        volume: 0,
        duration: fadeDuration,
        ease: 'Linear',
        onComplete: () => {
          previousMusic.stop();
          previousMusic.destroy();
        },
      });
    }
  }

  stop(scene, options = {}) {
    const fadeDuration = options.fadeDuration ?? 700;

    if (!this.currentMusic?.isPlaying) {
      this.currentMusic = null;
      this.currentKey = null;
      return;
    }

    const musicToStop = this.currentMusic;

    scene.tweens.add({
      targets: musicToStop,
      volume: 0,
      duration: fadeDuration,
      ease: 'Linear',
      onComplete: () => {
        musicToStop.stop();
        musicToStop.destroy();
      },
    });

    this.currentMusic = null;
    this.currentKey = null;
  }

  fadeTo(scene, music, targetVolume, duration) {
    scene.tweens.add({
      targets: music,
      volume: targetVolume,
      duration,
      ease: 'Linear',
    });
  }
}

export default new MusicManager();