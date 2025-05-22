/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */
import {config} from './config.js';

const symbolWrapper = document.querySelector('.symbol-wrapper');
const authCode = document.querySelector('.auth-code');
const username = document.querySelector('.username');

let symbols = [];

const selectedSymbols = {};

// INITIALIZE --------------------------------------------------------------------------
async function initialize_computer() {
  initialize_text();

  const responseSymbols = await fetch('/stargate/get/symbols_all');
  if (!responseSymbols.ok) {
    handleOffline();
    return;
  }
  symbols = await responseSymbols.json();

  // applyInfo();
  generateSymbols();
}
initialize_computer();

function initialize_text() {
  updateText(username, config.USER);

  const codeLength = Math.max(config.AUTHORIZATION_CODE.length, 15);
  for (let i = 0; i < codeLength; i++) {
    if (i !== 6) {
      let code = config.AUTHORIZATION_CODE[i];

      if (config.AUTHORIZATION_CODE_RANDOMIZE) {
        code = Math.floor(Math.random() * 10);
      }

      updateText(authCode.children.item(i), code);
    }
  }
}

function generateSymbols() {
  symbols.forEach(symbol => {
    const el = document.createElement('div');
    el.classList.add('symbol-box');
    el.classList.add(`symbol-${symbol.index}`);
    const img = document.createElement('img');
    img.classList.add('symbol');
    img.src = '..' + symbol.imageSrc;

    const name = document.createElement('span');
    name.classList.add('symbol-name');
    updateText(name, symbol.name);

    const key = document.createElement('span');
    key.classList.add('symbol-name');
    updateText(
      key,
      symbol.keyboard_mapping !== false ? symbol.keyboard_mapping : '_',
    );

    const index = document.createElement('span');
    index.classList.add('symbol-index');
    index.classList.add('symbol-name');
    updateText(index, symbol.index);

    el.appendChild(index);
    el.appendChild(img);
    el.appendChild(name);
    el.appendChild(key);

    el.addEventListener('click', () => toggleSymbol(el));
    symbolWrapper.appendChild(el);
  });
}

function toggleSymbol(symbol) {
  if (symbol.classList.contains('selected')) {
    symbol.classList.remove('selected');
  } else {
    symbol.classList.add('selected');
  }
}

function updateText(elem, text) {
  if (elem.textContent !== text) {
    elem.textContent = text ?? '';
  }
}
