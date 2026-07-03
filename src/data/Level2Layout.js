export const level2Layout = {
  playerSpawn: { x: 70, y: 360 },

  // =====================================================
  // 1. Feux visibles dès le début du niveau
  // =====================================================
  // Ces feux font partie de la pièce principale.
  // Ils sont visibles, touchables et comptent immédiatement
  // dans la condition de victoire.
  fires: [
    { x: 360, y: 430, size: 'small', type: 'normal' },
    { x: 735, y: 560, size: 'small', type: 'normal' },
    { x: 960, y: 455, size: 'large', type: 'normal' },
    { x: 1185, y: 585, size: 'large', type: 'normal' },
  ],

  // =====================================================
  // 2. Feu caché derrière une porte
  // =====================================================
  // Ce feu n’est pas créé comme feu actif au début.
  // Il devient visible et vulnérable uniquement après :
  // inspection de la bonne porte + arrosage de cette porte.
  hiddenFires: [
    {
      id: 'hidden-fire-door-3',
      doorId: 'door-3',
      x: 855,
      y: 250,
      size: 'large',
      type: 'normal',
    },
  ],

  // =====================================================
  // 3. Portes inspectables
  // =====================================================
  // Convention :
  // x/y correspondent au point visuel de la porte dans la scène.
  // Une seule porte possède hasHiddenFire: true.
  doors: [
    {
      id: 'door-1',
      x: 151,
      y: 262,
      width: 80,
      height: 120,
      hasHiddenFire: false,
      hiddenFireId: null,
      label: 'Porte rouge 1',
    },
    {
      id: 'door-2',
      x: 503,
      y: 262,
      width: 80,
      height: 120,
      hasHiddenFire: false,
      hiddenFireId: null,
      label: 'Porte rouge 2',
    },
    {
      id: 'door-3',
      x: 857,
      y: 262,
      width: 80,
      height: 120,
      hasHiddenFire: true,
      hiddenFireId: 'hidden-fire-door-3',
      label: 'Porte rouge 3',
    },
    {
      id: 'door-4',
      x: 1208,
      y: 262,
      width: 80,
      height: 120,
      hasHiddenFire: false,
      hiddenFireId: null,
      label: 'Porte rouge 4',
    },
  ],

  // =====================================================
  // 4. Obstacles / collisions
  // =====================================================
  obstacles: [
    // grand mur du haut
    { x: 0, y: 0, width: 1376, height: 255, type: 'manor_wall' },

    // portes bloquantes / zone haute
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
    { x: 835, y: 710, width: 541, height: 58, type: 'bottom_void_right' },
  ],

  // =====================================================
  // 5. Décorations de repérage
  // =====================================================
  decorations: [
    { x: 151, y: 262, key: 'door_marker_1' },
    { x: 503, y: 262, key: 'door_marker_2' },
    { x: 857, y: 262, key: 'door_marker_3' },
    { x: 1208, y: 262, key: 'door_marker_4' },

    { x: 180, y: 600, key: 'water_basin_marker' },
  ],

  // =====================================================
  // 6. Interactifs de recharge en eau
  // =====================================================
  interactives: [
    {
      x: 36,
      y: 555,
      width: 24,
      height: 95,
      type: 'water_refill',
      key: 'basin_left',
      prompt: '',
    },
    {
      x: 307,
      y: 555,
      width: 24,
      height: 95,
      type: 'water_refill',
      key: 'basin_right',
      prompt: '',
    },
    {
      x: 92,
      y: 500,
      width: 175,
      height: 24,
      type: 'water_refill',
      key: 'basin_top',
      prompt: '',
    },
    {
      x: 95,
      y: 675,
      width: 170,
      height: 28,
      type: 'water_refill',
      key: 'basin_bottom',
      prompt: '',
    },
  ],
};