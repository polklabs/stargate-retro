const version = document.querySelector('.version');

let info;

// INITIALIZE --------------------------------------------------------------------------
async function initialize_computer() {
  const responseInfo = await fetch('/stargate/get/system_info');
  if (!responseInfo.ok) {
    handleOffline();
    return;
  }
  info = await responseInfo.json();
  console.log(info);

  applyInfo();
}
initialize_computer();

function applyInfo() {
  updateText(version, info.software_version);
}

function updateText(elem, text) {
  if (elem.textContent !== text) {
    elem.textContent = text ?? '';
  }
}
