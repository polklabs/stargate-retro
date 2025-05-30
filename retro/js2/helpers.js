import { config } from './config.js';
export async function loadSymbols(includeDhd = true) {
    try {
        const responseSymbols = await fetch('/stargate/get/symbols_all');
        if (!responseSymbols.ok) {
            return [];
        }
        const symbols = await responseSymbols.json();
        symbols.forEach(symbol => (symbol.imageSrc = `..${symbol.imageSrc}`));
        if (includeDhd) {
            symbols.push({
                index: 0,
                imageSrc: 'images/dhd.svg',
                keyboard_mapping: '\r',
                name: 'DHD',
            });
        }
        else {
            // Skip
        }
        const fetchPromises = symbols.map(symbol => fetch(symbol.imageSrc).then(async (response) => {
            if (!response.ok) {
                //Skip
            }
            else {
                symbol.imageData = await response.text();
            }
        }));
        await Promise.all(fetchPromises);
        return symbols;
    }
    catch (error) {
        console.error('Error fetching SVGs: ', error);
        throw error;
    }
}
export function updateText(elem, text) {
    if (elem && elem.textContent !== text) {
        elem.textContent = `${text !== null && text !== void 0 ? text : ''}`;
    }
}
export function validElement(elem) {
    if (elem) {
        return elem;
    }
    else {
        throw new Error(`Element is null: ${elem}`);
    }
}
export function querySelector(selector, elem = document) {
    return validElement(elem.querySelector(selector));
}
export function getElementById(selector) {
    return validElement(document.getElementById(selector));
}
export function getConfig(id) {
    const local = localStorage.getItem(id);
    if (local !== null) {
        return local;
    }
    else {
        return config[id];
    }
}
export function setConfig(id, value) {
    localStorage.setItem(id, value);
}
export function clearConfig(id) {
    localStorage.removeItem(id);
}
export function isConfigAny(id, ...options) {
    const conf = getConfig(id);
    return options.some((o) => conf === o);
}
