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

import Phaser from 'phaser';

const gameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
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