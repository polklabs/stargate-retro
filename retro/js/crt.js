/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */

import {config} from './config.js';

const elem = document.body;

function toggleFlicker() {
  const shouldFlicker = Math.random() > 0.7; // 30% chance to flicker
  if (shouldFlicker) {
    elem.classList.add('flicker');
    setTimeout(() => {
      elem.classList.remove('flicker');
      toggleFlicker();
    }, 1000); // flicker for 200ms
  } else {
    setTimeout(toggleFlicker, 300); // check every 300ms
  }
}

// Run it every random interval
if (config.CRT_SCREEN_FLICKER) {
  setTimeout(toggleFlicker, 300);
}

const distortion = document.querySelector('.crt-distortion');
let $rand = 0;
distortion.addEventListener('animationend', function () {
  this.classList.remove('scanline-animation');
  $rand = Math.floor(Math.random() * 6) + 4;
  this.style.animationDuration = $rand + 's';
  void this.offsetWidth; // hack to reflow css animation
  this.classList.add('scanline-animation');
});

let fill = localStorage.getItem('fillScreen') === 'true' || config.FILL_SCREEN;
const border = document.querySelector('.border');
function fillScreen() {
  if (fill) {
    const scaleHeight = (elem.offsetHeight * 0.94) / border.offsetHeight;
    const scaleWidth = (elem.offsetWidth * 0.97) / border.offsetWidth;

    const scale = +Math.min(scaleHeight, scaleWidth).toFixed(3);
    border.style.scale = Math.max(1, scale);
  } else {
    border.style.scale = 1;
  }
}

function toggleFillScreen() {
  const fillLocal = localStorage.getItem('fillScreen');
  if (fillLocal === 'true') {
    localStorage.removeItem('fillScreen');
    fill = false;
  } else {
    localStorage.setItem('fillScreen', 'true');
    fill = true;
  }
  fillScreen();
}

fillScreen();
window.addEventListener('resize', fillScreen, true);
window.toggleFillScreen = toggleFillScreen;

const fullscreenBtn = document.querySelector('.fullscreen');
if (config.FILL_SCREEN && fullscreenBtn) {
  fullscreenBtn.style.display = 'none';
}
