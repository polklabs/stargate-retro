/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */

import {getConfig} from './config.js';

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

const bootSequence = [
  '...',
  '...',
  'Base Subsystem reinitializing...',
  `Checking RAM... 25000 OK`,
  `Checking Resources... 0x${genRanHex(8)} OK`,
  `Reallocating user blocks... 0x${genRanHex(8)} OK`,
  `Booting system resources... 0x${genRanHex(8)} OK`,
  `Checking security... 0x${genRanHex(8)} OK`,
  'All systems OK. Initializing with default settings.',
  'System online... please wait.',
  '                             ',
  '                             ',
  '                             ',
];

let text = '';
let arrIndex = 0;
let colIndex = 0;

let characterTime = 0.1;

let bootDiv;

function initializeBoot() {
  const bootLength = getConfig('STARTUP_LENGTH') ?? 0;
  const alreadyRanBoot = sessionStorage.getItem('boot');
  if (bootLength > 0 && !alreadyRanBoot) {
    sessionStorage.setItem('boot', true);
    startup(bootLength);
  }
  document.body.classList.remove('startup-pending');
}

function startup(bootLength) {
  bootDiv = document.createElement('div');
  bootDiv.classList.add('startup-wrapper');

  const border = document.querySelector('.border');
  border.append(bootDiv);

  const totalCharacters = bootSequence.reduce((prev,curr) => prev + curr.length, 0);
  characterTime = (bootLength)/totalCharacters;

  animateStartup();
}

function animateStartup() {

  if (colIndex >= bootSequence[arrIndex].length) {
    arrIndex += 1;
    colIndex = 0;
    text += '<br>';
  }

  if (colIndex === 0) {
    text += '> ';
  }

  text += bootSequence[arrIndex]?.[colIndex];
  colIndex += 1;

  bootDiv.innerHTML = text;

  if (
    arrIndex < bootSequence.length-1 ||
    (arrIndex === bootSequence.length-1 &&
      colIndex < bootSequence[arrIndex].length)
  ) {
    setTimeout(() => {
      animateStartup();      
    }, characterTime * 1000);
  } else {
    bootDiv.remove();
  }
}

initializeBoot();
