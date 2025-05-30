import {config} from './config.js';
import {Symbol} from './models/symbol.model.js';

export async function loadSymbols(includeDhd = true): Promise<Symbol[]> {
  try {
    const responseSymbols = await fetch('/stargate/get/symbols_all');
    if (!responseSymbols.ok) {
      return [];
    }
    const symbols: Symbol[] = await responseSymbols.json();

    symbols.forEach(symbol => (symbol.imageSrc = `..${symbol.imageSrc}`));

    if (includeDhd) {
      symbols.push({
        index: 0,
        imageSrc: 'images/dhd.svg',
        keyboard_mapping: '\r',
        name: 'DHD',
      });
    } else {
      // Skip
    }

    const fetchPromises = symbols.map(symbol =>
      fetch(symbol.imageSrc).then(async response => {
        if (!response.ok) {
          //Skip
        } else {
          symbol.imageData = await response.text();
        }
      }),
    );

    await Promise.all(fetchPromises);

    return symbols;
  } catch (error) {
    console.error('Error fetching SVGs: ', error);
    throw error;
  }
}

export function updateText(elem: Element | null, text: string | number) {
  if (elem && elem.textContent !== text) {
    elem.textContent = `${text ?? ''}`;
  }
}

export function validElement(elem: HTMLElement | null): HTMLElement {
  if (elem) {
    return elem;
  } else {
    throw new Error(`Element is null: ${elem}`);
  }
}

export function querySelector(
  selector: string,
  elem: Element | Document = document,
): HTMLElement {
  return validElement(elem.querySelector(selector));
}

export function getElementById(selector: string): Element {
  return validElement(document.getElementById(selector));
}

export function getConfig(id: keyof typeof config) {
  const local = localStorage.getItem(id);
  if (local !== null) {
    return local;
  } else {
    return config[id];
  }
}

export function setConfig(id: keyof typeof config, value: any) {
  localStorage.setItem(id, value);
}

export function clearConfig(id: keyof typeof config) {
  localStorage.removeItem(id);
}

export function isConfigAny(id: keyof typeof config, ...options: any) {
  const conf = getConfig(id);
  return options.some((o: any) => conf === o);
}
