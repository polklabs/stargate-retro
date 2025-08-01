/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */

import {config, isConfigAny} from './config.js';
import {gdo, activateGDO, resetGDO} from './gdo.js';
import {activateTimer, removeTimer} from './timer.js';
import {loadSymbols} from './helpers.js';

const appendTarget = document.querySelector('.dial-append');
const timer = document.querySelector('.timer');
const gateName = document.querySelector('.gate-name');
const destination = document.querySelector('.destination');
const destinationGlyphs = document.querySelector('.destination-glyphs');
const ring1 = document.querySelector('.ring-1 circle');
const ring3 = document.querySelector('.ring-3');
const infoText = document.querySelector('.info-box');
const border = document.querySelector('.border');
const keyboard = document.querySelector('.keyboard');
const systemEl = document.querySelector('.system');
const authCode = document.querySelector('.auth-code');

let statusInterval;

const STATE_ACTIVE = 'active';
const STATE_IDLE = 'idle';
const STATE_DIAL_OUT = 'dialing_out';
const STATE_DIAL_IN = 'dialing_in';

let speedDialAddress = [];

let encoding = false;
let state = STATE_IDLE;

let gateStatus = {};
let firstStatus = true;
let fetchingStatus = false;

let buffer = [];
let bufferIndex = 0;

// For animating glyph ring
let lastRingPos = -1;
let gateMoving = false;
let lastGateRotation = 0;

let lockedGlyphs = {};
let locked_chevrons = 0;

let symbols = [];

let timerInterval;

const use9ChevronPage = isConfigAny(
  'CHEVRON_9_DIALING_AUTO_SWITCH',
  'true',
  true,
);

// INITIALIZE --------------------------------------------------------------------------
async function initialize_computer() {
  initialize_text();
  initialize_events();

  symbols = await loadSymbols();

  buildKeyboard();
  updateStatusFrequency(5000);
  speedDialStart();
}
initialize_computer();

function initialize_events() {
  timer.onclick = () => activateTimer(gateStatus.wormhole_time_till_close);
}

function updateStatusFrequency(ms) {
  clearInterval(statusInterval);
  statusInterval = setInterval(watch_dialing_status, ms);
  watch_dialing_status();
}

// KEYBOARD DIALING ----------------------------------------------------------------------
document.body.onkeydown = function (e) {
  const charCode = typeof e.which == 'number' ? e.which : e.keyCode;
  if (charCode > 0) {
    const code = String.fromCharCode(charCode);
    const symbol = symbols.find(x => x.keyboard_mapping === code);
    if (symbol) {
      dhd_press(`${symbol.index}`);
    } else if (code === ' ' || code === '\r') {
      dhd_press('0');
    }
  }
};

// SPEED DIALING --------------------------------------------------------------------------
async function speedDialStart() {
  const parts = window.location.search.substring(1).split('&');
  const query = {};
  parts.forEach(part => {
    const temp = part.split('=');
    query[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
  });

  if (query.address) {
    speedDialAddress = [...query.address.split('-').map(Number), 1, 0];
    window.history.pushState({}, document.title, window.location.pathname);
    await clear_buffer();
    speedDial();
  }
}

async function speedDial() {
  if (speedDialAddress.length > 0) {
    const a = speedDialAddress.splice(0, 1);
    dhd_press(`${a}`);
    setTimeout(speedDial, 1500);
  }
}

// STATUS UPDATES --------------------------------------------------------------------------
async function watch_dialing_status() {
  if (fetchingStatus) {
    // Skip update until previous request finishes.
    return;
  }

  try {
    fetchingStatus = true;
    const responseStatus = await fetch('/stargate/get/dialing_status');
    if (!responseStatus.ok) {
      handleOffline();
      fetchingStatus = false;
      return;
    }
    gateStatus = await responseStatus.json();

    const initialState = state;
    updateText(gateName, gateStatus.gate_name);

    let [new_locked_chevrons, hardBreak] = handleActiveGate();

    if (!hardBreak) {
      new_locked_chevrons = handleDialingOut(new_locked_chevrons);
      new_locked_chevrons = handleDialingIn(new_locked_chevrons);

      while (locked_chevrons < new_locked_chevrons) {
        lock(locked_chevrons);
        locked_chevrons += 1;
        if (!encoding) {
          dial();
        }
      }

      if (!encoding) {
        firstStatus = false;
      }

      trySpinning();
    }

    updateState();
    updateTimer(gateStatus.wormhole_time_till_close);
    updateText(destination, gateStatus.connected_planet);

    if (initialState !== state) {
      if (state === STATE_IDLE) {
        updateStatusFrequency(5000);
      } else {
        updateStatusFrequency(500);
      }
    }
  } catch (err) {
    console.error(err);
    handleOffline();
  }
  fetchingStatus = false;
}

function handleActiveGate(new_locked_chevrons = 0) {
  if (
    state === STATE_ACTIVE &&
    !gateStatus.wormhole_active &&
    gateStatus.address_buffer_incoming.length === 0 &&
    gateStatus.address_buffer_outgoing.length === 0
  ) {
    resetGate();
    updateStatusFrequency(5000);
    return [0, true];
  } else if (state !== STATE_ACTIVE && gateStatus.wormhole_active) {
    // Active Incoming
    if (gateStatus.address_buffer_incoming.length > 0) {
      buffer = gateStatus.address_buffer_incoming;
      new_locked_chevrons = gateStatus.locked_chevrons_incoming;
      if (state === STATE_DIAL_OUT) {
        resetGate();
      }

      if (config.GDO_AUTO) {
        setTimeout(
          () =>
            activateGDO(
              gateStatus.connected_planet,
              gateStatus.black_hole_connected,
            ),
          config.GDO_DELAY * 1000,
        );
      }
    }
    // Active Outgoing
    if (gateStatus.address_buffer_outgoing.length > 0) {
      buffer = gateStatus.address_buffer_outgoing;
      new_locked_chevrons = gateStatus.locked_chevrons_outgoing;
      const toRemove = document.querySelectorAll('.destination-glyphs div');
      toRemove.forEach(g => g.remove());
      if (state === STATE_DIAL_IN) {
        resetGate();
      }
    }

    state = STATE_ACTIVE;
    dial();
  }
  return [new_locked_chevrons, false];
}

function handleDialingOut(new_locked_chevrons) {
  if (
    state === STATE_DIAL_OUT &&
    gateStatus.address_buffer_outgoing.length === 0
  ) {
    resetGate();
  } else if (
    state !== STATE_DIAL_OUT &&
    state !== STATE_ACTIVE &&
    gateStatus.address_buffer_outgoing.length > 0
  ) {
    resetGate();
    resetGDO();
    state = STATE_DIAL_OUT;
  }

  if (
    use9ChevronPage &&
    gateStatus.address_buffer_outgoing.length > 7 &&
    window.location.pathname.endsWith('/retro/dial.html')
  ) {
    window.location.href = '/retro/dial9.html';
  }

  // Dialing Out
  if (state === STATE_DIAL_OUT) {
    let bufferChange =
      gateStatus.address_buffer_outgoing.length - buffer.length;
    buffer = gateStatus.address_buffer_outgoing;
    if (bufferChange > 0) {
      updateDestination(bufferChange);
      setKeysDisabled(buffer);
      if (!encoding) {
        dial();
      }
    }
    new_locked_chevrons = gateStatus.locked_chevrons_outgoing;
  }
  return new_locked_chevrons;
}

function handleDialingIn(new_locked_chevrons) {
  if (
    state === STATE_DIAL_IN &&
    gateStatus.address_buffer_incoming.length === 0
  ) {
    resetGate();
  } else if (
    state !== STATE_DIAL_IN &&
    state !== STATE_ACTIVE &&
    gateStatus.address_buffer_incoming.length > 0
  ) {
    resetGate();
    resetGDO();
    state = STATE_DIAL_IN;
  }

  if (state === STATE_DIAL_IN) {
    let bufferChange =
      gateStatus.address_buffer_incoming.length - buffer.length;
    buffer = gateStatus.address_buffer_incoming;
    if (bufferChange > 0) {
      if (!encoding) {
        dial();
      }
    }
    new_locked_chevrons = gateStatus.locked_chevrons_incoming;
  }

  return new_locked_chevrons;
}

// That's a neat trick
function trySpinning() {
  if (!config.RING_ANIMATION) {
    return;
  }

  if (lastRingPos === -1) {
    lastRingPos = gateStatus.ring_position;
  } else if (lastRingPos !== gateStatus.ring_position) {
    lastRingPos = gateStatus.ring_position;
    ring3.classList.add('rotating');
    ring3.classList.remove('slow-rotate');
    gateMoving = true;
  } else if (gateMoving) {
    gateMoving = false;
    stopSpinning(ring3);
  }
}

function stopSpinning(el) {
  // Step 1: Capture current computed transform (rotation)
  const computedStyle = window.getComputedStyle(el);
  const matrix = new DOMMatrixReadOnly(computedStyle.transform);

  // Calculate current rotation angle in degrees
  let angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  angle = angle % 360;

  // Step 2: Remove animation
  el.classList.remove('rotating');

  // Step 3: Apply current rotation as a static transform
  el.style.transform = `rotate(${angle}deg)`;

  // Force reflow to flush style changes
  void el.offsetWidth;

  // Step 4: Add transition and apply a final slow rotation
  el.classList.add('slow-rotate');

  // Rotate 10° more over 1s (simulate deceleration)
  el.style.transform = `rotate(${angle + 10}deg)`;

  // Optional cleanup after transition
  el.addEventListener(
    'transitionend',
    () => {
      el.classList.remove('slow-rotate');
      lastGateRotation = (angle + 10 + lastGateRotation) % 360;
      el.style.rotate = `${lastGateRotation}deg`;
      el.style.transform = '';
    },
    {once: true},
  );
}

async function dhd_press(symbol, key) {
  if (state === STATE_DIAL_OUT && buffer.find(x => `${x}` === symbol)) {
    return;
  }

  key?.classList.add('disabled');
  await fetch('/stargate/do/dhd_press', {
    method: 'POST',
    body: JSON.stringify({symbol}),
    mode: 'no-cors',
  });
  setTimeout(() => watch_dialing_status(), 300);
}

async function clear_buffer() {
  await fetch('/stargate/do/clear_outgoing_buffer', {
    method: 'POST',
    mode: 'no-cors',
  });
  setTimeout(() => watch_dialing_status(), 300);
}

function dial() {
  if (buffer.length === 0) {
    encoding = false;
    bufferIndex = 0;
    firstStatus = false;
    return;
  }

  if (bufferIndex >= locked_chevrons) {
    if (
      buffer.length > bufferIndex &&
      gateStatus.address_buffer_incoming.length <= 0
    ) {
      displayGlyph();
    }
    encoding = false;
    return;
  }

  encoding = true;

  if (bufferIndex < 9 && gateStatus.address_buffer_incoming.length <= 0) {
    const [newGlyph, newGlyph2] = displayGlyph();
    if (firstStatus) {
      newGlyph.classList.add('locked');
      newGlyph2.classList.add('locked');
    } else {
      setTimeout(() => newGlyph.classList.add('locked'), 1);
      setTimeout(() => newGlyph2.classList.add('locked'), 50);
    }
  }
  bufferIndex += 1;

  if (gateStatus.wormhole_active || firstStatus) {
    // Allow quick locking for active wormholes or partially dialed gates on page load
    setTimeout(dial, 300);
  } else {
    // Add some delay between chevrons so previous animations can finish
    setTimeout(dial, 1300);
  }
}

function displayGlyph() {
  if (lockedGlyphs[bufferIndex] !== undefined) {
    return lockedGlyphs[bufferIndex];
  }
  const glyphIndex = buffer[bufferIndex];
  const symbol = symbols.find(x => x['index'] === glyphIndex);

  const newGlyph = document.createElement('div');
  newGlyph.classList.add('glyph');
  newGlyph.classList.add(`g${bufferIndex + 1}`);
  newGlyph.innerHTML = symbol.imageData;

  const newGlyph2 = newGlyph.cloneNode(true);
  if (!isConfigAny('POTATO_MODE', 'true', true)) {
    newGlyph2.classList.add('blur');
  }
  appendTarget.append(newGlyph2);
  appendTarget.append(newGlyph);

  lockedGlyphs[bufferIndex] = [newGlyph, newGlyph2];
  return [newGlyph, newGlyph2];
}

function lock(i) {
  // Only allow locking 7 chevrons
  if (i >= 9) {
    return;
  }

  startDrawingPath(i + 1);

  const chevrons = document.querySelectorAll(
    `.chevron-${i + 1},.chevron-state-${i + 1}`,
  );
  chevrons.forEach(c => c.classList.add('locked'));

  const b = document.querySelector(`.b${i + 1}`);
  if (b) {
    const newB = b.cloneNode(true);
    newB.classList.add(`clip-${i < 3 ? '2' : '1'}`);
    appendTarget.append(newB);
    if (gateStatus.address_buffer_incoming.length > 0) {
      newB.classList.add('incoming');
    }
    setTimeout(() => newB.classList.add('locked'), 10);
  }
}

// Clear all animations and get gate back into initial state
function resetGate() {
  const chevrons = document.querySelectorAll(
    '.gate.chevron.locked,.chevron-states tr.locked',
  );
  chevrons.forEach(c => c.classList.remove('locked'));

  const toRemove = document.querySelectorAll(
    '.dial-append > *,.destination-glyphs div',
  );
  toRemove.forEach(g => g.remove());

  const keys = document.querySelectorAll('.keyboard div');
  keys.forEach(k => k.classList.remove('disabled'));

  removeTimer();

  state = STATE_IDLE;
  encoding = false;
  buffer = [];
  bufferIndex = 0;
  lockedGlyphs = {};
  locked_chevrons = 0;
}

function updateState() {
  if (state === STATE_ACTIVE) {
    updateText(infoText, config.TEXT_ENGAGED);
    border.classList.add('active');
    border.classList.remove('idle');

    if (gateStatus.black_hole_connected) {
      ring1.setAttribute('fill', 'url(#radialGradientDanger)');
    } else {
      ring1.setAttribute('fill', 'url(#radialGradient)');
    }
  } else if (state === STATE_DIAL_OUT) {
    updateText(infoText, config.TEXT_DIALING);
    border.classList.remove('active');
    border.classList.remove('idle');
  } else if (state === STATE_DIAL_IN) {
    updateText(infoText, config.TEXT_INCOMING);
    border.classList.remove('active');
    border.classList.remove('idle');
  } else {
    updateText(infoText, config.TEXT_IDLE);
    border.classList.remove('active');
    border.classList.add('idle');
  }

  if (gdo.state === 'recognized' || gdo.state === 'complete') {
    updateText(infoText, config.TEXT_RECOGNIZED);
  } else if (gdo.state === 'analyzing') {
    updateText(infoText, config.TEXT_ANALYZING);
  }
}

function updateDestination(lastXGlyphs) {
  const toAdd = buffer.slice(buffer.length - lastXGlyphs);
  toAdd.forEach(g => {
    const symbol = symbols.find(x => x['index'] === g);
    const glyph = document.createElement('div');
    glyph.innerHTML = symbol.imageData;
    destinationGlyphs.append(glyph);
  });
}

function updateTimer(secondsLeft) {
  if (gateStatus.black_hole_connected) {
    secondsLeft =
      38 * 60 -
      (gateStatus.wormhole_max_time - gateStatus.wormhole_time_till_close);
  }

  if (secondsLeft <= 0) {
    clearInterval(timerInterval);
    timerInterval = undefined;
    updateTimerText(0, 0);
  } else if (timerInterval === undefined) {
    const msLeft = secondsLeft * 1000;
    const start = Date.now();

    timerInterval = setInterval(() => {
      const delta = Date.now() - start; // milliseconds elapsed since start
      let timeLeft = msLeft - delta;

      if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(timerInterval);
        timerInterval = undefined;
        updateTimerText(0, 0);
      } else {
        const mins = Math.max(0, Math.floor(timeLeft / 60000));
        const secs = Math.max(0, Math.floor(timeLeft / 1000) % 60);
        updateTimerText(mins, secs);
      }
    }, 333); // update about 3x a second
  }
}

function updateTimerText(minutes, seconds) {
  updateText(timer, `${minutes}:${seconds.toString().padStart(2, '0')}`);
}

function initialize_text() {
  updateText(gateName, config.DEFAULT_GATE_NAME);
  updateText(systemEl.children.item(0), 'USER: ' + config.USER);

  const codeLength = Math.max(config.AUTHORIZATION_CODE.length, 15);
  for (let i = 0; i < codeLength; i++) {
    if (i !== 6) {
      let code = config.AUTHORIZATION_CODE[i];

      if (config.AUTHORIZATION_CODE_RANDOMIZE) {
        code = Math.floor(Math.random() * 10);
      }

      updateText(authCode.children.item(i), code);
    }
  }
}

function handleOffline() {
  updateText(infoText, config.TEXT_OFFLINE);
}

function buildKeyboard() {
  symbols.forEach(symbol => {
    if (symbol.keyboard_mapping) {
      const keyWrapper = document.createElement('div');
      keyWrapper.classList.add(`symbol-${symbol.index}`);
      keyWrapper.innerHTML = symbol.imageData;
      keyWrapper.onclick = () => dhd_press(`${symbol.index}`, keyWrapper);
      keyboard.appendChild(keyWrapper);
    }
  });
}

// Locking pre-dialed keys from the keyboard
function setKeysDisabled(keys, disabled = true) {
  keys.forEach(k => setKeyDisabled(k, disabled));
}
function setKeyDisabled(glyphIndex, disabled) {
  const key = document.querySelector(`.keyboard .symbol-${glyphIndex}`);
  if (key) {
    if (disabled) {
      key.classList.add('disabled');
    } else {
      key.classList.remove('disabled');
    }
  }
}

// Animate the power line from the chevron to the glyph box
const pathTime = 800; // ms
function startDrawingPath(index) {
  const svgBase = document.querySelector(`.cl${index}`);
  if (svgBase) {
    const svg = svgBase.cloneNode(true);
    const path = svg.querySelector('path');
    const pathLength = path.getTotalLength();

    svg.classList.add('locked');
    path.style.stroke = 'var(--color-danger)';
    path.style.strokeWidth = '6';
    appendTarget.append(svg);

    const start = performance.now();
    let length = 0;
    function animate(now) {
      const time = now - start;
      length = Math.floor((time / pathTime) * pathLength);
      path.style.strokeDasharray = [length, pathLength].join(' ');

      if (length < pathLength) {
        requestAnimationFrame(animate);
      }
    }
    animate(start);
  } else {
    // No chevron link path, probably 8th/9th chevron
  }
}

function updateText(elem, text) {
  if (elem.textContent !== text) {
    elem.textContent = text ?? '';
  }
}
