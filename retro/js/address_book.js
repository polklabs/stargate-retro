const scrollingDiv = document.getElementById('scrollingDiv');
const tableRowTemplate = document.getElementById('tableRow');
const tableBody = document.getElementById('tableBody');

function updateIp(ip) {
  const parts = ip.split('.').map(Number);

  return parts.join('·');
}

function hash(str) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const randomText = ['E<br>M', 'P<br>Q', 'G<br>X', 'T<br>V', 'I<br>X'];

async function fetchData() {
  try {
    const response = await fetch('/stargate/get/address_book?type=all');
    const data = await response.json();

    const responseSymbols = await fetch('/stargate/get/symbols_all');
    const symbols = await responseSymbols.json();

    Object.values(data['address_book']).forEach(address => {
      const aTag = document.createElement('a');
      aTag.setAttribute('href', `dial.html?address=${address.gate_address}`);

      const newRow = tableRowTemplate.cloneNode(true);
      aTag.appendChild(newRow);
      newRow.removeAttribute('id');
      newRow.classList.remove('hidden');

      let keyboardAddress = '';
      let hasUnknownGlyph = false;

      address['gate_address'].forEach((glyph, i) => {
        const symbol = symbols.find(x => x['index'] === glyph);

        if (!symbol || symbol['keyboard_mapping'] === false) {
          keyboardAddress += '?';
          hasUnknownGlyph = true;
        } else {
          keyboardAddress += symbol['keyboard_mapping'];
        }

        if (i < 7) {
          newRow.querySelector(`.glyph-name-${i + 1}`).textContent =
            symbol?.['name'] ?? 'Unknown';

          const imgElement = newRow.querySelector(`.glyph-${i + 1}`);
          imgElement.src = ''; // Empty it temporarily
          imgElement.src = '..' + symbol?.['imageSrc']; // Set it again to force a reload
        }
      });

      const randomNumber = Math.floor(Math.random() * 5);
      newRow.querySelector('.small-box').innerHTML = randomText[randomNumber];

      newRow.querySelector(
        `.info-name`,
      ).textContent = `${address['name']} # ${keyboardAddress}8`;

      if (
        address['is_black_hole'] ||
        hasUnknownGlyph ||
        address['gate_address'].length > 6
      ) {
        newRow.classList.add('danger');
      }

      if (address['type'] === 'fan') {
        newRow.classList.add('fan');
        newRow
          .querySelector('.info-type')
          .querySelectorAll('span')[1].textContent = 'Fan';
      } else {
        newRow
          .querySelector('.info-type')
          .querySelectorAll('span')[1].textContent = 'Standard';
      }

      if (address['is_gate_online'] === '0') {
        newRow.classList.add('offline');
        newRow
          .querySelector('.status')
          .querySelectorAll('span')[1].textContent = 'Offline';
      } else {
        newRow
          .querySelector('.status')
          .querySelectorAll('span')[1].textContent = 'Online';
      }

      if (address['ip_address']) {
        newRow
          .querySelector('.info-coord')
          .querySelectorAll('span')[1].textContent = updateIp(
          address['ip_address'],
        );
      } else {
        newRow
          .querySelector('.info-coord')
          .querySelectorAll('span')[0].textContent = '';
        newRow
          .querySelector('.info-coord')
          .querySelectorAll('span')[1].textContent = '';
      }

      newRow
        .querySelector('.info-const')
        .querySelectorAll('span')[1].textContent = hash(
        JSON.stringify(address),
      );

      const randomInfo = Math.floor(Math.random() * 7);
      newRow.querySelector('.info-a').innerHTML = document.getElementById(
        `info-${randomInfo}`,
      ).innerHTML;

      tableBody.appendChild(aTag);
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchData();
