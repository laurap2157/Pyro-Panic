export const level1Layout = {
  playerSpawn: { x: 70, y: 360 },

  fires: [
    { x: 490, y: 345, size: 'small', type: 'normal' },
    { x: 900, y: 210, size: 'small', type: 'normal' },
    { x: 1045, y: 555, size: 'large', type: 'normal' },
    { x: 1300, y: 650, size: 'large', type: 'normal' }
  ],

  obstacles: [
    { x: 0, y: 0, width: 1366, height: 275, type: 'building_row' },

    { x: 90, y: 505, width: 380, height: 185, type: 'firetruck' },

    { x: 23, y: 157, width: 71, height: 67, type: 'decor_block' },
    { x: 893, y: 159, width: 88, height: 44, type: 'decor_block' },
    { x: 1008, y: 157, width: 86, height: 51, type: 'decor_block' },
    { x: 1297, y: 157, width: 47, height: 36, type: 'decor_block' },

    { x: 1290, y: 640, width: 76, height: 62, type: 'decor_block' }
  ],

  decorations: [
    { x: 130, y: 193, key: 'lamp_post' },
    { x: 251, y: 219, key: 'hydrant' },
    { x: 759, y: 193, key: 'lamp_post' },
    { x: 809, y: 219, key: 'hydrant' },
    { x: 1218, y: 193, key: 'lamp_post' },
    { x: 1169, y: 219, key: 'hydrant' },
    { x: 117, y: 625, key: 'lamp_post' },
    { x: 1290, y: 560, key: 'lamp_post' },

    { x: 490, y: 345, key: 'burn_mark_small' },
    { x: 1045, y: 555, key: 'burn_mark_large' }
  ],

  interactives: [
    {
      x: 430,
      y: 575,
      width: 35,
      height: 70,
      type: 'water_refill',
      key: 'firetruck',
      prompt: 'Recharger en eau'
    }
  ]
};