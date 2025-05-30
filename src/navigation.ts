/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */

import {config} from './config.js';
import {clearConfig, getConfig, getElementById, isConfigAny, querySelector, setConfig} from './helpers.js';

declare global {
  interface Window {
    togglePotatoMode: any;
    restart: any;
    reboot: any;
    shutdown: any;
    openDropdown: any;
  }
}
window.togglePotatoMode = togglePotatoMode;
window.restart = restart;
window.reboot = reboot;
window.shutdown = shutdown;
window.openDropdown = openDropdown;

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function openDropdown(elementId: string) {
  getElementById(elementId).classList.toggle('show');
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event: MouseEvent) {
  if (!(event.target as HTMLElement).matches('.dropbtn')) {
    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (const openDropdown of dropdowns) {
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

async function restart() {
  const response = confirm(
    'Are you sure you want to restart the Gate software?',
  );
  if (response) {
    await fetch('/stargate/do/restart', {
      method: 'POST',
      mode: 'no-cors',
    });
  }
}

async function reboot() {
  const response = confirm(
    'Are you sure you want to restart the Raspberry Pi?',
  );
  if (response) {
    await fetch('/stargate/do/reboot', {
      method: 'POST',
      mode: 'no-cors',
    });
  }
}

async function shutdown() {
  const response = confirm(
    'Are you sure you want to shutdown the Raspberry Pi?',
  );
  if (response) {
    await fetch('/stargate/do/shutdown', {
      method: 'POST',
      mode: 'no-cors',
    });
  }
}

function isActive(href: string) {
  return (
    `href="${href}"` +
    (window.location.href.includes(href) ? 'class="active-link"' : '')
  );
}

function initializeNavBar() {
  const div = document.createElement('div');
  div.innerHTML = `
  <div class="navigation-menu-wrapper">
      <div class="navigation-menu">
        <a ${isActive('/retro/dial.html')}>Home</a>
        <a ${isActive('/retro/address_book.html')}>Address Book</a>
        <a ${isActive('/retro/symbol_overview.html')}>Symbols</a>
        <div class="dropdown">
          <a onclick="openDropdown('menu-dropdown')" class="dropbtn"> Admin </a>
          <div id="menu-dropdown" class="dropdown-content">
            <a ${isActive('/debug.htm')}>Testing / Debug</a>
            <a ${isActive('/config.htm')}>Configuration</a>
            <a ${isActive('/retro/info.html')}>System</a>
            <a onclick="restart()">Restart Software</a>
            <a onclick="reboot()">Reboot Raspberry Pi</a>
            <a onclick="shutdown()">Shutdown Raspberry Pi</a>
          </div>
        </div>
        <a href="/help.htm">Help</a>
        <a class="a-potato" onclick="togglePotatoMode()">
          Potato Mode
        </a>
        <a class="a-fullscreen" onclick="toggleFillScreen()"><span
          class="material-symbols-outlined fullscreen">
          fullscreen
          </span>
        </a>
      </div>
    </div>
  `;
  const innerDiv = querySelector('div', div);
  const body = querySelector('body');
  body.insertBefore(innerDiv, body.childNodes[0]);
}
initializeNavBar();

// FULL SCREEN HACK
const elem = document.body;
let fill = isConfigAny('FILL_SCREEN', 'true', true);
const border = querySelector('.border');
function fillScreen() {
  if (fill) {
    const scaleHeight = (elem.offsetHeight * 0.94) / border.offsetHeight;
    const scaleWidth = (elem.offsetWidth * 0.97) / border.offsetWidth;

    const scale = +Math.min(scaleHeight, scaleWidth).toFixed(3);
    border.style.scale = `${Math.max(1, scale)}`;
  } else {
    border.style.scale = '1';
  }
}

function toggleFillScreen() {
  const fillLocal = getConfig('FILL_SCREEN');
  if (fillLocal === 'true') {
    clearConfig('FILL_SCREEN');
    fill = false;
  } else {
    setConfig('FILL_SCREEN', 'true');
    fill = true;
  }
  fillScreen();
}

fillScreen();
window.addEventListener('resize', fillScreen, true);
(window as any).toggleFillScreen = toggleFillScreen;

const fullscreenBtn = querySelector('.a-fullscreen');
if (config.FILL_SCREEN && fullscreenBtn) {
  fullscreenBtn.style.display = 'none';
}

// Potato Mode
function togglePotatoMode() {
  const potatoLocal = getConfig('POTATO_MODE');
  if (potatoLocal === 'true') {
    clearConfig('POTATO_MODE');
  } else {
    setConfig('POTATO_MODE', 'true');
  }
  location.reload();
}

const potatoBtn = querySelector('.a-potato');
if (potatoBtn) {
  if (config.POTATO_MODE) {
    potatoBtn.style.display = 'none';
  } else if (isConfigAny('POTATO_MODE', 'true', true)) {
    potatoBtn.textContent = 'Fancy Mode';
  }
}
