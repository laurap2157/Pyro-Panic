import Phaser from 'phaser'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1d1d1d',
  scene: {
    create() {
      this.add.text(200, 250, 'Salut Phaser !', {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff'
      })
    }
  }
}

new Phaser.Game(config)
