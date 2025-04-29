let glyphNum = 1;
const glyph = document.querySelector('.glyph');
const appendTarget = document.querySelector('.dial-append');

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
  setTimeout(watch_dialing_status, 500);
}
initialize_computer();

async function watch_dialing_status() {
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

  updateState(status['wormhole_active']);

  if (buffer.length > 0) {
    setTimeout(watch_dialing_status, 500);
  } else {
    setTimeout(watch_dialing_status, 5000);
  }
}

async function dhd_press(symbol) {
  if (buffer.find(x => `${x}` === symbol)) {
    return;
  }

  key.classList.add('disabled');
  await fetch('http://192.168.1.95:8080/do/dhd_press', {
    method: 'POST',
    body: JSON.stringify({symbol}),
    mode: 'no-cors',
  });
  watch_dialing_status();
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

  setTimeout(dial, 1500);
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

function updateState(engaged) {
  const infoText = document.querySelector('.info-box');
  if (engaged) {
    setTimeout(() => {
      infoText.textContent = 'ENGAGED';
      document.querySelector('.border').classList.add('active');
    }, 500);
  } else if (buffer.length > 0) {
    infoText.textContent = 'DIALING';
    document.querySelector('.border').classList.remove('active');
  } else {
    infoText.textContent = '';
    document.querySelector('.border').classList.remove('active');
  }
}

function buildKeyboard() {
  const keyboard = document.querySelector('.keyboard');
  for (let i = 1; i < 40; i++) {
    const img = document.createElement('img');
    img.src = `chevrons/milkyway/${pad(i, 3)}.svg`;
    img.onclick = () => dhd_press(`${i}`, img);
    img.classList.add(`symbol-${i}`);
    keyboard.appendChild(img);
  }
}
buildKeyboard();

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
