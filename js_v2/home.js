const glyph = document.querySelector('.glyph');
const appendTarget = document.querySelector('.dial-append');
const timer = document.querySelector('.timer');
const gateName = document.querySelector('.gate-name');
const destination = document.querySelector('.destination');
const ring1 = document.querySelector('.ring-1 circle');
const infoText = document.querySelector('.info-box');
const border = document.querySelector('.border');
const keyboard = document.querySelector('.keyboard');

let buffer = [];
let bufferIndex = 0;
let dialing = false;

let locked_chevrons_outgoing = 0;

let symbols = [];
async function initialize_computer() {
  const responseSymbols = await fetch(
    'http://192.168.1.95:8080/get/symbols_all',
  );
  symbols = await responseSymbols.json();
  buildKeyboard();
  setTimeout(watch_dialing_status, 500);
}
initialize_computer();

let address = [27, 7, 15, 32, 12, 30, 1];
async function speedDial() {
  if (address.length > 0) {
    const a = address.splice(0, 1);
    dhd_press(`${a}`);
    setTimeout(speedDial, 500);
  } else {
    setTimeout(() => dhd_press('0'), 500);
  }
}

async function watch_dialing_status() {
  try {
  const responseStatus = await fetch(
    'http://192.168.1.95:8080/get/dialing_status',
  );
  const status = await responseStatus.json();

  let bufferChange = status['address_buffer_outgoing'].length - buffer.length;
  if (bufferChange > 0) {
    buffer = status['address_buffer_outgoing'];
    if (!dialing) {
      dial();
    }
  } else if (bufferChange < 0) {
    resetGate();
    buffer = [];
    bufferIndex = 0;
    locked_chevrons_outgoing = 0;
  }

  while (locked_chevrons_outgoing < status['locked_chevrons_outgoing']) {
    lock(locked_chevrons_outgoing);
    locked_chevrons_outgoing += 1;
  }
  if (locked_chevrons_outgoing > buffer.length) {
    resetGate();
  }

    updateState(status['wormhole_active'], status['black_hole_connected']);
    updateTimer(status['wormhole_time_till_close']);

    updateText(gateName, status['gate_name']);
    updateText(destination, status['connected_planet']);
  } catch (err) {
    console.error(err);
  }

  if (buffer.length > 0) {
    setTimeout(watch_dialing_status, 500);
  } else {
    setTimeout(watch_dialing_status, 5000);
  }
}

async function dhd_press(symbol, key) {
  if (buffer.find(x => `${x}` === symbol)) {
    return;
  }

  key?.classList.add('disabled');
  await fetch('http://192.168.1.95:8080/do/dhd_press', {
    method: 'POST',
    body: JSON.stringify({symbol}),
    mode: 'no-cors',
  });
  setTimeout(watch_dialing_status, 100);
}

function dial() {
  if (buffer.length === 0) {
    dialing = false;
    bufferIndex = 0;
    return;
  }

  if (bufferIndex >= buffer.length) {
    dialing = false;
    return;
  }

  dialing = true;
  const g = buffer[bufferIndex];
  bufferIndex += 1;

  if (bufferIndex <= 7) {
    const symbol = symbols.find(x => x['index'] === g);

    const newGlyph = glyph.cloneNode(true);
    newGlyph.classList.remove('hidden');
    newGlyph.src = '';
    newGlyph.src = symbol['imageSrc'].substr(1);

    newGlyph.classList.add(`g${bufferIndex}`);
    const newGlyph2 = newGlyph.cloneNode(true);
    newGlyph2.classList.add('blur');
    appendTarget.append(newGlyph2);
    appendTarget.append(newGlyph);

    setTimeout(() => {
      newGlyph.classList.add('locked');
    }, 500);
    setTimeout(() => {
      newGlyph2.classList.add('locked');
    }, 550);

    const key = document.querySelector(`.keyboard .symbol-${g}`);
    key.classList.add('disabled');
  }

  setTimeout(dial, 1300);
}

function lock(i) {
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

function updateState(engaged, blackHole) {
  if (engaged) {
    setTimeout(() => {
      updateText(infoText, 'ENGAGED');
      border.classList.add('active');

      if (blackHole) {
        ring1.setAttribute('fill', 'url(#radialGradientDanger)');
      } else {
        ring1.setAttribute('fill', 'url(#radialGradient)');
      }
    }, 500);
  } else if (buffer.length === 1 || locked_chevrons_outgoing > 0) {
    updateText(infoText, 'DIALING');
    border.classList.remove('active');
  } else {
    updateText(infoText, '');
    border.classList.remove('active');
  }
}

function updateTimer(secondsLeft) {
  const mins = Math.max(0, Math.floor(secondsLeft / 60));
  const secs = Math.max(0, secondsLeft % 60);
  timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function buildKeyboard() {
  for (let i = 1; i < 40; i++) {
    const img = document.createElement('img');
    img.src = `chevrons/milkyway/${pad(i, 3)}.svg`;
    img.onclick = () => dhd_press(`${i}`, img);
    img.classList.add(`symbol-${i}`);
    keyboard.appendChild(img);
  }
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
