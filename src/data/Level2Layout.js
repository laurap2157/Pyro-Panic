export const level2Layout = {
  playerSpawn: { x: 70, y: 360 },

  fires: [
    { x: 360, y: 430, size: 'small', type: 'normal' },
    { x: 735, y: 560, size: 'small', type: 'normal' },
    { x: 960, y: 455, size: 'large', type: 'normal' },
    { x: 1185, y: 585, size: 'large', type: 'normal' },

    // feu caché derrière une porte, à gérer plus tard avec la porte ouverte
    { x: 855, y: 250, size: 'large', type: 'hidden_door_fire' }
  ],

  doors: [
    { x: 200, y: 300, isDangerous: false },
    { x: 500, y: 150, isDangerous: true }
  ],

  obstacles: [
    // grand mur du haut
    { x: 0, y: 0, width: 1366, height: 255, type: 'manor_wall' },

    // portes bloquantes
    { x: 95, y: 0, width: 112, height: 141, type: 'door_block' },
    { x: 447, y: 0, width: 112, height: 141, type: 'door_block' },
    { x: 801, y: 0, width: 112, height: 141, type: 'door_block' },
    { x: 1152, y: 0, width: 112, height: 141, type: 'door_block' },

    // coffres à gauche
    { x: 0, y: 265, width: 61, height: 60, type: 'chest_block' },
    { x: 278, y: 265, width: 62, height: 58, type: 'chest_block' },
    { x: 343, y: 265, width: 64, height: 58, type: 'chest_block' },

    // caisses à droite
    { x: 1003, y: 245, width: 79, height: 82, type: 'crate_stack_block' },
    { x: 975, y: 258, width: 63, height: 61, type: 'crate_stack_block' },

    // bassin : le joueur ne marche pas dedans
    { x: 85, y: 523, width: 252, height: 151, type: 'fountain_block' },

    // zones noires du bas
    { x: 0, y: 710, width: 428, height: 58, type: 'bottom_void_left' },
    { x: 835, y: 710, width: 531, height: 58, type: 'bottom_void_right' }
  ],

  decorations: [
    { x: 151, y: 262, key: 'door_marker_1' },
    { x: 503, y: 262, key: 'door_marker_2' },
    { x: 857, y: 262, key: 'door_marker_3' },
    { x: 1208, y: 262, key: 'door_marker_4' },

    { x: 180, y: 600, key: 'water_basin_marker' }
  ],

  interactives: [
    // recharge à gauche du bassin
    {
      x: 36,
      y: 555,
      width: 24,
      height: 95,
      type: 'water_refill',
      key: 'basin_left',
      prompt: ''
    },

    // recharge à droite du bassin
    {
      x: 307,
      y: 555,
      width: 24,
      height: 95,
      type: 'water_refill',
      key: 'basin_right',
      prompt: ''
    },

    // recharge au-dessus du bassin
    {
      x: 92,
      y: 500,
      width: 175,
      height: 24,
      type: 'water_refill',
      key: 'basin_top',
      prompt: ''
    },

    // en dessous du bassin
    {
      x: 95,
      y: 675,
      width: 170,
      height: 28,
      type: 'water_refill',
      key: 'basin_bottom',
      prompt: ''
    }
  ]
};