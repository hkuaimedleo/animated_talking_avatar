export const ROBOT_THEMES = {
  default: {
    faceColor: '#2a2a2a',
    eyeColor: '#00ff00',
    mouthColor: '#ff6600',
    screenGlow: '#0066ff',
    size: 300,
    eyeSize: 40,
    mouthWidth: 100,
    mouthHeight: 20,
    name: 'Default Robot'
  },
  friendly: {
    faceColor: '#3a3a4a',
    eyeColor: '#00ffff',
    mouthColor: '#ffff00',
    screenGlow: '#00ffff',
    size: 300,
    eyeSize: 45,
    mouthWidth: 110,
    mouthHeight: 25,
    name: 'Friendly Robot'
  },
  serious: {
    faceColor: '#1a1a1a',
    eyeColor: '#ff0000',
    mouthColor: '#ff0000',
    screenGlow: '#ff0000',
    size: 300,
    eyeSize: 35,
    mouthWidth: 80,
    mouthHeight: 15,
    name: 'Serious Robot'
  },
  retro: {
    faceColor: '#4a4a2a',
    eyeColor: '#ffff00',
    mouthColor: '#ff6600',
    screenGlow: '#ffff00',
    size: 300,
    eyeSize: 50,
    mouthWidth: 120,
    mouthHeight: 30,
    name: 'Retro Robot'
  }
};

export const ROBOT_ANIMATIONS = {
  idle: {
    eyeBlinkRate: 3000,
    mouthIdleMovement: true,
    antennaGlow: true
  },
  talking: {
    eyeExcited: true,
    mouthActiveMovement: true,
    screenFlicker: true
  },
  listening: {
    eyesFocused: true,
    mouthClosed: true,
    antennaActive: true
  }
};
