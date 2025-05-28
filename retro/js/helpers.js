async function loadSymbols(includeDhd = true) {
  try {
    const responseSymbols = await fetch('/stargate/get/symbols_all');
    if (!responseSymbols.ok) {
      handleOffline();
      return;
    }
    const symbols = await responseSymbols.json();

    symbols.forEach(symbol => (symbol.imageSrc = `..${symbol.imageSrc}`));

    if (includeDhd) {
      symbols.push({
        index: 0,
        imageSrc: 'images/dhd.svg',
        keyboard_mapping: '\r',
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

export {loadSymbols};
