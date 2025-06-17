import {config} from './config.js';

const gdo = {
  state: 'idle',
};

const border = document.querySelector('.border');

let gdoBox;
let canceled = false;

function activateGDO(planet= '', blackHole=false) {
  canceled = false;
  gdoBox = document.createElement('div');

  const waveform = generateWaveformSVG();
  const name = generateName();
  const code = generateDecryptedCode(name);

  gdoBox.classList.add('gdo-wrapper');
  gdoBox.innerHTML = `
    <div class="gdo-signal">
      <div class="gdo-top">
        <span>ENCODING:</span><span class="color-glyph">HEXADECIMAL</span>
        <span class="spacer"></span>
        <span class="color-danger">FREQ: 8 MHz</span>
      </div>

      <div class="signal-top">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div class="signal">
        <div class="signal-left">
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
        </div>
        <div class="signal-center ${blackHole ? 'black-hole' : ''}">
          ${waveform}${waveform}
          <div class="wave-edge"></div>
        </div>
        <div class="signal-right">
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
        </div>
      </div>

      <div class="signal-bottom">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div class="gdo-bottom">
        <span class="color-danger">MIME:</span><span class="color-glyph">UUENCODE</span>
        <span class="spacer"></span>
        <span class="color-danger">KEY:</span><span class="color-glyph">2048 BIT</span>
      </div>
    </div>

    <div class="signal-info">
      <div>SIGNAL DECRYPTED CODE ${code}</div>
      <div>RECOGNIZED: ${name}</div>
      <div>${planet}</div>
    </div>
  `;

  gdoBox.addEventListener('click', resetGDO);
  border.appendChild(gdoBox);

  gdo.state = 'analyzing';
  setTimeout(gdoRecognized, blackHole ? 12000 : 3000);
  setTimeout(gdoComplete, blackHole ? 24000 : 6000);
}

function generateWaveformSVG({
  width = 1575,
  height = 200,
  segments = 300,
} = {}) {
  const midY = height / 2;
  const segmentWidth = width / segments;

  let path = `M 0 ${midY}`;
  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth;

    let amplitude = Math.random() * height * 0.5;
    if (i < segments * 0.12) {
      amplitude = Math.random() * height * 0.1;
    } else if (Math.random() < 0.069) {
      amplitude = Math.random() * height * 0.4 + height * 0.6;
    }

    const y = midY + ((Math.random() > 0.5 ? 1 : -1) * amplitude) / 2;
    path += ` L ${x} ${y}`;
  }
  return `
<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <path d="${path}" stroke="url(#waveGradient)" stroke-width="2" fill="none"/>
</svg>
  `;
}

function generateName() {
  const regex = /{([0-9]+),([0-9]+)}/;
  const index = Math.floor(Math.random() * config.GDO_SIGNALS.length);
  let signal = config.GDO_SIGNALS[index];

  let m;
  if ((m = regex.exec(signal)) !== null) {
    const start = +m[1];
    const end = +m[2];
    const num = Math.floor(Math.random() * (end - start)) + start;
    signal = signal.replace(regex, num);
  }

  return signal;
}

function hash(str) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function generateDecryptedCode(name) {
  const code = Math.abs(hash(name)).toString();

  const regex = /([0-9]{0,6})([0-9]{0,3})[0-9]*/;
  const subst = `$1-$2`;

  return code.replace(regex, subst);
}

function gdoRecognized() {
  if (canceled) {
    return;
  }
  border.classList.add('gdo-valid');
  gdo.state = 'recognized';
}

function gdoComplete() {
  if (canceled) {
    return;
  }
  const info = document.querySelector('.signal-info');
  info.classList.add('gdo-valid');
  gdo.state = 'complete';
}

function resetGDO() {
  canceled = true;
  gdo.state = 'idle';
  gdoBox?.remove();
  border.classList.remove('gdo-valid');
}

export {gdo, resetGDO, activateGDO};