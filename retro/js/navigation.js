/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function openDropdown(elementId) {
  document.getElementById(elementId).classList.toggle('show');
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('.dropbtn')) {
    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

async function restart() {
  const response = confirm('Are you sure you want to restart the Gate software?');
  if (response) {
    await fetch('/stargate/do/restart', {
      method: 'POST',
      mode: 'no-cors',
    });
  }
}

async function reboot() {
  const response = confirm('Are you sure you want to restart the Raspberry Pi?');
  if (response) {
    await fetch('/stargate/do/reboot', {
      method: 'POST',
      mode: 'no-cors',
    });
  }
}

async function shutdown() {
  const response = confirm('Are you sure you want to shutdown the Raspberry Pi?');
  if (response) {
    await fetch('/stargate/do/shutdown', {
      method: 'POST',
      mode: 'no-cors',
    });
  }
}
