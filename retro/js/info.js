/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */
import {config} from './config.js';

const version = document.querySelector('.version');
const user = document.querySelector('.title-usr');

let info;

// INITIALIZE --------------------------------------------------------------------------
async function initialize_computer() {
  generateGauges(1);
  generateGauges(2);
  generateGauges(3);

  const responseInfo = await fetch('/stargate/get/system_info');
  if (!responseInfo.ok) {
    handleOffline();
    return;
  }
  info = await responseInfo.json();
  console.log(info);

  applyInfo();
}
initialize_computer();

function applyInfo() {
  updateText(version, info.software_version);
  updateText(user, `USR ${config.USER}`);
}

function updateText(elem, text) {
  if (elem.textContent !== text) {
    elem.textContent = text ?? '';
  }
}

function generateGauges(index) {
  const flux1 = document.querySelector(`.flux-${index}`);
  const gauge = generateGauge();
  const needle = generateNeedle();
  flux1.innerHTML =
    index + gauge + needle + '<div class="dir"><span>-</span><span>+</span></div>';
}

function generateGauge() {
  return `
  <svg viewBox="0 0 200 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!--Gauge arc-->
      <path d="M10,100 A90,90 0 0,1 190,100" stroke="cyan" stroke-width="2" fill="none"/>
      
      <!--Bottom line-->
      <line x1="10" y1="100" x2="190" y2="100" stroke="cyan" stroke-width="2"/>
      
      <!--Small downward semicircle at bottom center-->
      <path d="M89,100 A5,4 0 0,0 108,100" stroke="cyan" stroke-width="2" fill="cyan"/>
      
      <!--Tick marks around the edge of the arc-->
      <g stroke="cyan" stroke-width="2">
        <!--21 ticks from -90° to +90° (inclusive)-->
        <!--Outer radius: 90, Inner radius: 85-->
        <!--Center: (100, 100)-->
        ${getPoints()}
      </g>
  </svg>
  `;
}

function generateNeedle() {
  // TODO: Adjust needle so I can use css: rotate to angle it correctly.
  return `<svg viewBox="0 0 200 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <path d="
      M100,100
      L97,95
      Q100,0 103,95
      Z
    " fill="lime" stroke="none" stroke-width="0.5" />
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
getPoints();
