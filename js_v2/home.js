const glyph = document.querySelector('.glyph');
const appendTarget = document.querySelector('.dial-append');
const timer = document.querySelector('.timer');
const gateName = document.querySelector('.gate-name');
const destination = document.querySelector('.destination');
const ring1 = document.querySelector('.ring-1 circle');
const infoText = document.querySelector('.info-box');
const border = document.querySelector('.border');
const keyboard = document.querySelector('.keyboard');

let address = [];

let gateStatus = {};

let buffer = [];
let bufferIndex = 0;
let dialing = false;

let bufferGlyphs = {};

let locked_chevrons_outgoing = 0;

let symbols = [];
async function initialize_computer() {
  const responseSymbols = await fetch('/stargate/get/symbols_all');
  symbols = await responseSymbols.json();
  buildKeyboard();
  setTimeout(watch_dialing_status, 500);

  // Check for speed dial
  const parts = window.location.search.substring(1).split('&');
  const query = {};
  parts.forEach(part => {
    const temp = part.split('=');
    query[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
  });

  if (query.address) {
    address = [...query.address.split(',').map(Number), 1, 0];
    await clear_buffer();
    speedDial();
  }
}
initialize_computer();

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

async function speedDial() {
  if (address.length > 0) {
    const a = address.splice(0, 1);
    dhd_press(`${a}`);
    setTimeout(speedDial, 1000);
  }
}

async function watch_dialing_status(singleCall = false) {
  try {
    const responseStatus = await fetch('/stargate/get/dialing_status');
    gateStatus = await responseStatus.json();

    let bufferChange =
      gateStatus.address_buffer_outgoing.length - buffer.length;
  if (bufferChange > 0) {
      buffer = gateStatus.address_buffer_outgoing;
      disableBufferKeys();
    if (!dialing) {
      dial();
    }
  } else if (bufferChange < 0) {
    resetGate();
      dialing = false;
    buffer = [];
    bufferIndex = 0;
      bufferGlyphs = {};
    locked_chevrons_outgoing = 0;
  }

    while (locked_chevrons_outgoing < gateStatus.locked_chevrons_outgoing) {
    lock(locked_chevrons_outgoing);
    locked_chevrons_outgoing += 1;
      if (!dialing) {
        dial();
      }
  }
  if (locked_chevrons_outgoing > buffer.length) {
    resetGate();
  }

    updateState();
    updateTimer(gateStatus.wormhole_time_till_close);

    updateText(gateName, gateStatus.gate_name);
    updateText(destination, gateStatus.connected_planet);
  } catch (err) {
    console.error(err);
  }

  if (!singleCall) {
  if (buffer.length > 0) {
    setTimeout(watch_dialing_status, 500);
  } else {
    setTimeout(watch_dialing_status, 5000);
    }
  }
}

async function dhd_press(symbol, key) {
  if (buffer.find(x => `${x}` === symbol)) {
    return;
  }

  key?.classList.add('disabled');
  await fetch('/stargate/do/dhd_press', {
    method: 'POST',
    body: JSON.stringify({symbol}),
    mode: 'no-cors',
  });
  setTimeout(() => watch_dialing_status(true), 100);
}

async function clear_buffer() {
  await fetch('/stargate/do/clear_outgoing_buffer', {
    method: 'POST',
    mode: 'no-cors',
  });
  setTimeout(() => watch_dialing_status(true), 100);
}

function dial() {
  if (buffer.length === 0) {
    dialing = false;
    bufferIndex = 0;
    return;
  }

  if (bufferIndex >= locked_chevrons_outgoing) {
    if (buffer.length > bufferIndex) {
      displayGlyph(bufferIndex);
    }
    dialing = false;
    return;
  }

  dialing = true;

  if (bufferIndex < 7) {
    const [newGlyph, newGlyph2] = displayGlyph(bufferIndex);
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

function displayGlyph(index) {
  if (bufferGlyphs[index] !== undefined) {
    return bufferGlyphs[index];
  }
  const glyphIndex = buffer[index];
  const symbol = symbols.find(x => x['index'] === glyphIndex);

    const newGlyph = glyph.cloneNode(true);
    newGlyph.classList.remove('hidden');
    newGlyph.src = '';
    newGlyph.src = symbol['imageSrc'].substr(1);

  newGlyph.classList.add(`g${index + 1}`);
    const newGlyph2 = newGlyph.cloneNode(true);
    newGlyph2.classList.add('blur');
    appendTarget.append(newGlyph2);
    appendTarget.append(newGlyph);

  bufferGlyphs[index] = [newGlyph, newGlyph2];
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

  const glyphs = document.querySelectorAll('.glyph.locked');
  glyphs.forEach(g => g.remove());

  const chevronLinks = document.querySelectorAll('.chevron-link.locked');
  chevronLinks.forEach(cl => cl.remove());

  const chevronBoxes = document.querySelectorAll('.chevron-box.locked');
  chevronBoxes.forEach(cb => cb.remove());

  const keys = document.querySelectorAll('.keyboard img');
  keys.forEach(k => k.classList.remove('disabled'));
}

function disableBufferKeys() {
  buffer.forEach(k => disableKey(k));
}
function disableKey(glyphIndex) {
  const key = document.querySelector(`.keyboard .symbol-${glyphIndex}`);
  key.classList.add('disabled');
}

function updateState() {
  if (gateStatus.wormhole_active) {
    setTimeout(() => {
      updateText(infoText, 'ENGAGED');
      border.classList.add('active');

      if (gateStatus.black_hole_connected) {
        ring1.setAttribute('fill', 'url(#radialGradientDanger)');
      } else {
        ring1.setAttribute('fill', 'url(#radialGradient)');
      }
    }, 500);
  } else if (buffer.length > 0) {
    updateText(infoText, 'DIALING');
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
      img.src = symbol.imageSrc.substr(1);
      img.onclick = () => dhd_press(`${symbol.index}`, img);
      img.classList.add(`symbol-${symbol.index}`);
    keyboard.appendChild(img);
  }
  });
  const img = document.createElement('img');
  img.src = `gate/dhd.svg`;
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
