/* USER CUSTOMIZATIONS */
const config = {
  // Spinning is so much cooler than not spinning
  RING_ANIMATION: true,

  AUTHORIZATION_CODE_RANDOMIZE: true,
  AUTHORIZATION_CODE: '77892757892387',

  USER: 'SGT. W HARRIMAN',

  // Used when gate is offline initially
  DEFAULT_GATE_NAME: 'Stargate',

  TEXT_OFFLINE: 'OFFLINE',
  TEXT_IDLE: 'IDLE',
  TEXT_DIALING: 'DIALING',
  TEXT_INCOMING: 'INCOMING',
  TEXT_ENGAGED: 'ENGAGED',
  TEXT_RECOGNIZED: 'RECOGNIZED',
  TEXT_ANALYZING: 'ANALYZING',

  GDO_AUTO: true,
  GDO_DELAY: 3, // Seconds
  GDO_SIGNALS: [
    "TOK'RA",
    'SG-1',
    'Tollana',
    "Bra'tac",
    'Jacob Carter',
    'Thor',
    "Teal'c",
    'Dr. Elizabeth Weir',
    'SG-{1,25}',
  ],

  CRT_SCREEN_FLICKER: false,
};

export {config};
