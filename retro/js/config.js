/* USER CUSTOMIZATIONS */
const config = {
  // Does your computer have less processing power than a microwave?
  POTATO_MODE: false,

  FILL_SCREEN: false,

  // Spinning is so much cooler than not spinning
  RING_ANIMATION: true,

  AUTHORIZATION_CODE_RANDOMIZE: true,
  AUTHORIZATION_CODE: '77892757892387',

  USER: 'SGT. W HARRIMAN',

  // Used when gate is offline initially
  DEFAULT_GATE_NAME: 'Stargate',
  CHEVRON_9_DIALING: false,
  CHEVRON_9_DIALING_AUTO_SWITCH: true,

  TEXT_OFFLINE: 'OFFLINE',
  TEXT_IDLE: 'IDLE',
  TEXT_DIALING: 'DIALING',
  TEXT_INCOMING: 'INCOMING',
  TEXT_ENGAGED: 'ENGAGED',
  TEXT_RECOGNIZED: 'RECOGNIZED',
  TEXT_ANALYZING: 'ANALYZING',

  GDO_AUTO: true,
  GDO_DELAY: 5, // Seconds
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

  INFO_FLUX: [-40, 40],
  INFO_FLUX_ACTIVE: [-90, 90],
  INFO_FLUX_UPDATES: [1.5, 0.9],
  INFO_OUTPUT: [10, 30],
  INFO_OUTPUT_ACTIVE: [25, 100],
  INFO_OUTPUT_UPDATES: [1.8, 0.7],
  INFO_WAVEFORM: [0.3, 0.6],
  INFO_WAVEFORM_ACTIVE: [0.7, 1],
  INFO_WAVEFORM_UPDATES: [20, 2.5],

  CRT_SCREEN_FLICKER: false,
  CRT_SCAN_LINE: true,
  CRT_PIXEL: true,
};

/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */

function getConfig(id) {
  const local = localStorage.getItem(id);
  if (local !== null) {
    return local;
  } else {
    return config[id];
  }
}

function setConfig(id, value) {
  localStorage.setItem(id, value);
}

function clearConfig(id) {
  localStorage.removeItem(id);
}

function isConfigAny(id, ...options) {
  const conf = getConfig(id);
  return options.some(o => conf === o);
}

export {config, getConfig, setConfig, clearConfig, isConfigAny};
