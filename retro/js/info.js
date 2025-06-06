/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */
import {config} from './config.js';

const version = document.querySelector('.version');
const user = document.querySelector('.title-usr');
const waveform = document.querySelector('.waveform-svg');
const bars = document.querySelectorAll('.bar-fill');
let waveformSvg;

let needles = [];

let info;
let symbols = [];

const intervals = {
  status: null,
  flux: null,
  output: null,
  waveform: null,
};

let fetchingStatus = false;
let activeStatus = false;

// INITIALIZE --------------------------------------------------------------------------
async function initialize_computer() {
  generateGauges(1);
  generateGauges(2);
  generateGauges(3);

  waveform.innerHTML = generateSinWaveSVG();
  waveformSvg = waveform.querySelector('svg');

  const responseSymbols = await fetch('/stargate/get/symbols_all');
  if (!responseSymbols.ok) {
    handleOffline();
    return;
  }
  symbols = await responseSymbols.json();

  const responseInfo = await fetch('/stargate/get/system_info');
  if (!responseInfo.ok) {
    handleOffline();
    return;
  }
  info = await responseInfo.json();
  console.log(info);

  applyInfo();

  updateStatusFrequency(
    'waveform',
    updateWaveform,
    config.INFO_WAVEFORM_UPDATES[0],
  );
  updateStatusFrequency(
    'output',
    updateOutputBar,
    config.INFO_OUTPUT_UPDATES[0],
  );
  updateStatusFrequency('flux', updateNeedles, config.INFO_FLUX_UPDATES[0]);
  updateStatusFrequency('status', watch_status, 5);
}
initialize_computer();

function updateStatusFrequency(interval, func, s) {
  clearInterval(intervals[interval]);
  intervals[interval] = setInterval(func, s * 1000);
  func();
}

// STATUS UPDATES --------------------------------------------------------------------------
async function watch_status() {
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
    const gateStatus = await responseStatus.json();

    const initialState = activeStatus;
    if (
      gateStatus.address_buffer_outgoing.length > 0 ||
      gateStatus.address_buffer_incoming.length > 0 ||
      gateStatus.locked_chevrons_outgoing > 0 ||
      gateStatus.locked_chevrons_incoming > 0 ||
      gateStatus.wormhole_active
    ) {
      activeStatus = true;
    } else {
      activeStatus = false;
    }

    if (initialState !== activeStatus) {
      if (!activeStatus) {
        updateStatusFrequency(
          'waveform',
          updateWaveform,
          config.INFO_WAVEFORM_UPDATES[0],
        );
        updateStatusFrequency(
          'output',
          updateOutputBar,
          config.INFO_OUTPUT_UPDATES[0],
        );
        updateStatusFrequency(
          'flux',
          updateNeedles,
          config.INFO_FLUX_UPDATES[0],
        );
        updateStatusFrequency('status', watch_status, 5);
      } else {
        updateStatusFrequency(
          'waveform',
          updateWaveform,
          config.INFO_WAVEFORM_UPDATES[1],
        );
        updateStatusFrequency(
          'output',
          updateOutputBar,
          config.INFO_OUTPUT_UPDATES[1],
        );
        updateStatusFrequency(
          'flux',
          updateNeedles,
          config.INFO_FLUX_UPDATES[1],
        );
        updateStatusFrequency('status', watch_status, 0.5);
      }
    }
  } catch (err) {
    console.error(err);
    handleOffline();
  }
  fetchingStatus = false;
}

function applyInfo() {
  updateText(version, info.software_version);
  updateText(user, `USR ${config.USER}`);

  const tableData = document.querySelectorAll('.data table td');
  tableData.forEach(td => {
    const id = td.getAttribute('id');
    if (id) {
      switch (id) {
        case 'subspace_public_key':
          updateText(td, info[id] ? info[id] : 'n/a');
          if (!info[id]) {
            td.parentElement.classList.add('error');
          } else {
            td.parentElement.classList.remove('error');
          }
          break;
        case 'subspace_available':
        case 'internet_available':
          updateText(td, info[id] ? 'Connected' : 'Offline');
          if (!info[id]) {
            td.parentElement.classList.add('error');
          } else {
            td.parentElement.classList.remove('error');
          }
          break;
        case 'stats_established_standard_count':
        case 'stats_established_fan_count':
        case 'stats_inbound_count':
          updateText(
            td,
            `${info[id]} (${info[id.replace('_count', '_mins')].toFixed(
              2,
            )} Minutes)`,
          );
          break;
        case 'local_stargate_address_string':
          td.innerHTML = '';
          info.local_stargate_address?.forEach(g => {
            const symbol = symbols.find(x => x['index'] === g);
            const glyph = document.createElement('img');
            glyph.src = '..' + symbol['imageSrc'];
            td.append(glyph);
          });
          td.innerHTML += '<br>' + info[id];
          break;
        case 'software_update_status':
          if (info[id] !== 'up-to-date') {
            td.parentElement.classList.add('error');
          } else {
            td.parentElement.classList.remove('error');
          }
          updateText(td, info[id]);
          break;
        default:
          updateText(td, info[id]);
      }
    }
  });
}

function updateText(elem, text) {
  if (elem.textContent !== text) {
    elem.textContent = text ?? '';
  }
}

function updateOutputBar() {
  bars.forEach(element => {
    if (activeStatus) {
      element.style.height = `${getRandomInt(config.INFO_OUTPUT_ACTIVE)}%`;
    } else {
      element.style.height = `${getRandomInt(config.INFO_OUTPUT)}%`;
    }
  });
}

function updateNeedles() {
  needles.forEach(element => {
    if (activeStatus) {
      element.style.transform = `rotate(${getRandomInt(
        config.INFO_FLUX_ACTIVE,
      )}deg)`;
    } else {
      element.style.transform = `rotate(${getRandomInt(config.INFO_FLUX)}deg)`;
    }
  });
}

function updateWaveform() {
  if (activeStatus) {
    waveformSvg.style.transform = `scaleY(${getRandomInt(config.INFO_WAVEFORM_ACTIVE)})`;
  } else {
    waveformSvg.style.transform = `scaleY(${getRandomInt(config.INFO_WAVEFORM)})`;
  }
}

function generateSinWaveSVG({
  viewBoxWidth = 800,
  viewBoxHeight = 200,
  frequency = 2, // Number of full sine waves across the width
  amplitude = 80, // Peak height from center line
  strokeColor = 'var(--color-good)',
  strokeWidth = 3,
} = {}) {
  const midY = viewBoxHeight / 2;
  const step = 1; // Smaller steps = smoother curve
  let path = `M 0 ${midY}`;

  for (let x = 0; x <= viewBoxWidth; x += step) {
    const radians = (x / viewBoxWidth) * frequency * 2 * Math.PI;
    const y = midY - Math.sin(radians) * amplitude;
    path += ` L ${x} ${y}`;
  }

  return `
    <svg viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="${path}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" />
    </svg>
  `;
}

function generateGauges(index) {
  const flux1 = document.querySelector(`.flux-${index}`);
  const gauge = generateGauge();
  const needle = generateNeedle();
  flux1.innerHTML =
    index +
    gauge +
    needle +
    '<div class="dir"><span>-</span><span>+</span></div>';
  const needleSvg = flux1.querySelectorAll('svg')[1];
  needleSvg.style.transform = 'rotate(-90deg)';
  needles.push(needleSvg);
}

function generateGauge() {
  return `
  <svg viewBox="0 0 200 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!--Gauge arc-->
      <path d="M10,100 A90,90 0 0,1 190,100" stroke="var(--color)" stroke-width="2" fill="none"/>
      
      <!--Bottom line-->
      <line x1="10" y1="100" x2="190" y2="100" stroke="var(--color)" stroke-width="2"/>
      
      <!--Small downward semicircle at bottom center-->
      <path d="M89,100 A5,4 0 0,0 108,100" stroke="var(--color)" stroke-width="2" fill="var(--color)"/>
      
      <!--Tick marks around the edge of the arc-->
      <g stroke="var(--color)" stroke-width="2">
        <!--21 ticks from -90° to +90° (inclusive)-->
        <!--Outer radius: 90, Inner radius: 85-->
        <!--Center: (100, 100)-->
        ${getPoints()}
      </g>
  </svg>
  `;
}

function generateNeedle() {
  return `<svg viewBox="0 0 200 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <path d="
      M100,100
      L97,95
      Q100,0 103,95
      Z
    " fill="var(--color-good)" stroke="none" stroke-width="0.5" />
    </svg>
  `;
}

function pointTowardsCenter(x, y, cx = 100, cy = 100, length = 10) {
  const dx = cx - x;
  const dy = cy - y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Normalize and scale
  const nx = x + (dx / dist) * length;
  const ny = y + (dy / dist) * length;

  return {x: nx, y: ny};
}

function getPoints(ticks = 21) {
  const theta = -1 * (Math.PI / ticks);
  let points = [];
  for (let i = 0; i < 21; i++) {
    const x = 90 * Math.cos(i * theta) + 100;
    const y = 90 * Math.sin(i * theta) + 100;
    const point = pointTowardsCenter(x, y);
    points.push(
      `<line x1="${x.toFixed(4)}" y1="${y.toFixed(4)}" x2="${point.x.toFixed(
        4,
      )}" y2="${point.y.toFixed(4)}" />`,
    );
  }

  return points.join('\n');
}

function getRandomInt(minMax) {
  const [min, max] = minMax;
  return Math.random() * (max - min) + min;
}
