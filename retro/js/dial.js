const glyph = document.querySelector('.glyph');
const appendTarget = document.querySelector('.dial-append');
const timer = document.querySelector('.timer');
const gateName = document.querySelector('.gate-name');
const destination = document.querySelector('.destination');
const ring1 = document.querySelector('.ring-1 circle');
const ring3 = document.querySelector('.ring-3');
const infoText = document.querySelector('.info-box');
const border = document.querySelector('.border');
const keyboard = document.querySelector('.keyboard');

let statusInterval;

const STATE_ACTIVE = 'active';
const STATE_IDLE = 'idle';
const STATE_DIAL_OUT = 'dialing_out';
const STATE_DIAL_IN = 'dialing_in';

let speedDialAddress = [];

let encoding = false;
let state = STATE_IDLE;

let gateStatus = {};

let buffer = [];
let bufferIndex = 0;

// For animating glyph ring
let lastRingPos = -1;
let gateMoving = false;

let lockedGlyphs = {};
let locked_chevrons = 0;

let symbols = [];

// INITIALIZE --------------------------------------------------------------------------
async function initialize_computer() {
  const responseSymbols = await fetch('/stargate/get/symbols_all');
  symbols = await responseSymbols.json();
  buildKeyboard();
  updateStatusFrequency(5000);
  speedDialStart();
}
initialize_computer();

function updateStatusFrequency(ms) {
  clearInterval(statusInterval);
  statusInterval = setInterval(watch_dialing_status, ms);
  watch_dialing_status();
}

// KEYBOARD DIALING ----------------------------------------------------------------------
const charfield = document.body;
charfield.onkeydown = function (e) {
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
    speedDialAddress = [...query.address.split(',').map(Number), 1, 0];
    await clear_buffer();
    speedDial();
  }
}

async function speedDial() {
  if (speedDialAddress.length > 0) {
    const a = speedDialAddress.splice(0, 1);
    dhd_press(`${a}`);
    setTimeout(speedDial, 1000);
  }
}

// STATUS UPDATES --------------------------------------------------------------------------
async function watch_dialing_status() {
  try {
    const responseStatus = await fetch('/stargate/get/dialing_status');
    gateStatus = await responseStatus.json();

    let new_locked_chevrons = 0;
    const initialState = state;

    if (
      state === STATE_ACTIVE &&
      !gateStatus.wormhole_active &&
      gateStatus.address_buffer_incoming.length === 0 &&
      gateStatus.address_buffer_outgoing.length === 0
    ) {
      resetGate();
      updateStatusFrequency(5000);
      return;
    } else if (state !== STATE_ACTIVE && gateStatus.wormhole_active) {
      // Active Incoming
      if (gateStatus.address_buffer_incoming.length > 0) {
        buffer = gateStatus.address_buffer_incoming;
        new_locked_chevrons = gateStatus.locked_chevrons_incoming;
        if (state === STATE_DIAL_OUT) {
          resetGate();
        }
      }
      // Active Outgoing
      if (gateStatus.address_buffer_outgoing.length > 0) {
        buffer = gateStatus.address_buffer_outgoing;
        new_locked_chevrons = gateStatus.locked_chevrons_outgoing;
        if (state === STATE_DIAL_IN) {
          resetGate();
        }
      }

      state = STATE_ACTIVE;
      dial();
    }

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
      state = STATE_DIAL_OUT;
    }

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
      state = STATE_DIAL_IN;
    }

    // Dialing Out
    if (state === STATE_DIAL_OUT) {
      let bufferChange =
        gateStatus.address_buffer_outgoing.length - buffer.length;
      buffer = gateStatus.address_buffer_outgoing;
      if (bufferChange > 0) {
        disableBufferOutKeys();
        if (!encoding) {
          dial();
        }
      }
      new_locked_chevrons = gateStatus.locked_chevrons_outgoing;
    }

    // Dialing In
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

    while (locked_chevrons < new_locked_chevrons) {
      lock(locked_chevrons);
      locked_chevrons += 1;
      if (!encoding) {
        dial();
      }
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

    updateState();
    updateTimer(gateStatus.wormhole_time_till_close);

    updateText(gateName, gateStatus.gate_name);
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
  }
}

function stopSpinning(el) {
  // Step 1: Capture current computed transform (rotation)
  const computedStyle = window.getComputedStyle(el);
  const matrix = new DOMMatrixReadOnly(computedStyle.transform);

  // Calculate current rotation angle in degrees
  let angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
  if (angle < 0) angle += 360;

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
      el.style.rotate = `${(angle + 10) % 360}deg`;
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
    return;
  }

  if (bufferIndex >= locked_chevrons) {
    if (buffer.length > bufferIndex) {
      displayGlyph();
    }
    encoding = false;
    return;
  }

  encoding = true;

  if (bufferIndex < 7) {
    const [newGlyph, newGlyph2] = displayGlyph();
    newGlyph.classList.add('locked');
    newGlyph2.classList.add('locked');
  }
  bufferIndex += 1;

  if (gateStatus.wormhole_active) {
    setTimeout(dial, 300);
  } else {
    setTimeout(dial, 1300);
  }
}

function displayGlyph() {
  if (lockedGlyphs[bufferIndex] !== undefined) {
    return lockedGlyphs[bufferIndex];
  }
  const glyphIndex = buffer[bufferIndex];
  const symbol = symbols.find(x => x['index'] === glyphIndex);

  const newGlyph = glyph.cloneNode(true);
  newGlyph.classList.remove('hidden');
  newGlyph.src = '';
  newGlyph.src = '..' + symbol['imageSrc'];

  newGlyph.classList.add(`g${bufferIndex + 1}`);
  const newGlyph2 = newGlyph.cloneNode(true);
  newGlyph2.classList.add('blur');
  appendTarget.append(newGlyph2);
  appendTarget.append(newGlyph);

  lockedGlyphs[bufferIndex] = [newGlyph, newGlyph2];
  return [newGlyph, newGlyph2];
}

function lock(i) {
  // Only allow locking 7 chevrons
  if (i >= 7) {
    return;
  }

  startDrawingPath(i + 1);

  const chev = document.querySelector(`.chevron-${i + 1}`);
  chev.classList.add('locked');

  const b = document.querySelector(`.b${i + 1}`);
  const newB = b.cloneNode(true);
  newB.classList.add(`clip-${i < 3 ? '2' : '1'}`);
  appendTarget.append(newB);
  setTimeout(() => newB.classList.add('locked'), 10);
}

function resetGate() {
  const chevrons = document.querySelectorAll('.gate.chevron.locked');
  chevrons.forEach(c => c.classList.remove('locked'));

  const toRemove = document.querySelectorAll('.dial-append > *');
  toRemove.forEach(g => g.remove());

  const keys = document.querySelectorAll('.keyboard img');
  keys.forEach(k => k.classList.remove('disabled'));

  state = STATE_IDLE;
  encoding = false;
  buffer = [];
  bufferIndex = 0;
  lockedGlyphs = {};
  locked_chevrons = 0;
}

function disableBufferOutKeys() {
  buffer.forEach(k => disableKey(k));
}
function disableKey(glyphIndex) {
  const key = document.querySelector(`.keyboard .symbol-${glyphIndex}`);
  key.classList.add('disabled');
}

function updateState() {
  if (state === STATE_ACTIVE) {
    setTimeout(() => {
      updateText(infoText, 'ENGAGED');
      border.classList.add('active');

      if (gateStatus.black_hole_connected) {
        ring1.setAttribute('fill', 'url(#radialGradientDanger)');
      } else {
        ring1.setAttribute('fill', 'url(#radialGradient)');
      }
    }, 500);
  } else if (state === STATE_DIAL_OUT) {
    updateText(infoText, 'DIALING');
    border.classList.remove('active');
  } else if (state === STATE_DIAL_IN) {
    updateText(infoText, 'INCOMING');
    border.classList.remove('active');
  } else {
    updateText(infoText, 'IDLE');
    border.classList.remove('active');
  }
}

function updateTimer(secondsLeft) {
  if (gateStatus.black_hole_connected) {
    secondsLeft =
      38 * 60 -
      (gateStatus.wormhole_max_time - gateStatus.wormhole_time_till_close);
  }

  const mins = Math.max(0, Math.floor(secondsLeft / 60));
  const secs = Math.max(0, secondsLeft % 60);
  updateText(timer, `${mins}:${secs.toString().padStart(2, '0')}`);
}

function buildKeyboard() {
  symbols.forEach(symbol => {
    if (symbol.keyboard_mapping) {
      const img = document.createElement('img');
      img.src = '..' + symbol.imageSrc;
      img.onclick = () => dhd_press(`${symbol.index}`, img);
      img.classList.add(`symbol-${symbol.index}`);
      keyboard.appendChild(img);
    }
  });
  const img = document.createElement('img');
  img.src = `images/dhd.svg`;
  img.onclick = () => dhd_press(`0`, img);
  img.classList.add(`symbol-0`);
  keyboard.appendChild(img);
}

const distancePerPoint = 0.75;
function startDrawingPath(index) {
  const svgBase = document.querySelector(`.cl${index}`);
  const svg = svgBase.cloneNode(true);
  const path = svg.querySelector('path');
  const pathLength = path.getTotalLength();

  svg.classList.add('locked');
  path.style.stroke = 'var(--color-danger)';
  path.style.strokeWidth = '6';
  appendTarget.append(svg);

  let length = 0;
  function animate() {
    length += Math.floor((distancePerPoint / 100) * pathLength);
    path.style.strokeDasharray = [length, pathLength].join(' ');

    if (length < pathLength) {
      requestAnimationFrame(animate);
    }
  }
  animate();
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function updateText(elem, text) {
  if (elem.textContent !== text) {
    elem.textContent = text;
  }
}
