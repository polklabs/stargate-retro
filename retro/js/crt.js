/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */

import {config, isConfigAny} from './config.js';

const body = document.body;
const border = document.querySelector('.border');

function toggleFlicker() {
  const shouldFlicker = Math.random() > 0.7; // 30% chance to flicker
  if (shouldFlicker) {
    body.classList.add('flicker');
    setTimeout(() => {
      body.classList.remove('flicker');
      toggleFlicker();
    }, 1000); // flicker for 200ms
  } else {
    setTimeout(toggleFlicker, 300); // check every 300ms
  }
}

// Run it every random interval
if (config.CRT_SCREEN_FLICKER && !isConfigAny('POTATO_MODE', 'true', true)) {
  setTimeout(toggleFlicker, 300);
}

if (config.CRT_SCAN_LINE && !isConfigAny('POTATO_MODE', 'true', true)) {
  const distortion = document.createElement('div');
  distortion.classList.add('crt-distortion');
  distortion.classList.add('scanline-animation');
  border ? border.appendChild(distortion) : body.appendChild(distortion);

  let $rand = 0;
  distortion.addEventListener('animationend', function () {
    this.classList.remove('scanline-animation');
    $rand = Math.floor(Math.random() * 6) + 4;
    this.style.animationDuration = $rand + 's';
    void this.offsetWidth; // hack to reflow css animation
    this.classList.add('scanline-animation');
  });
}

if (config.CRT_PIXEL && !isConfigAny('POTATO_MODE', 'true', true)) {
  body.classList.add('crt');
}
