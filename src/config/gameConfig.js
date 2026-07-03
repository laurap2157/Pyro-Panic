import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import TitleScene from '../scenes/TitleScene.js';
import WorldMapScene from '../scenes/WorldMapScene.js';
import BriefingScene from '../scenes/BriefingScene.js';
import VictoryScene from '../scenes/VictoryScene.js';
import GameOverScene from '../scenes/GameOverScene.js';

import Level1Scene from '../scenes/Level1Scene.js';
import Level2Scene from '../scenes/Level2Scene.js';
import Level3Scene from '../scenes/Level3Scene.js';
import Level4Scene from '../scenes/Level4Scene.js';
import FinalLevelScene from '../scenes/FinalLevelScene.js';

import * as Phaser from 'phaser';

const gameConfig = {
  type: Phaser.AUTO,

  // Résolution logique officielle du projet.
  // Le canvas s'adapte à l'écran avec Phaser.Scale.FIT,
  // sans déformer les assets ni changer les coordonnées du jeu.
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1376,
    height: 768,
  },

  backgroundColor: '#101018',
  parent: 'app',
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    WorldMapScene,
    BriefingScene,
    VictoryScene,
    GameOverScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    Level4Scene,
    FinalLevelScene
  ]
};

export default gameConfig;