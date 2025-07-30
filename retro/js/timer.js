/* EDIT CUSTOMIZATIONS IN config.js */
/* DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING!!!! */

const border = document.querySelector('.border');

let msLeft = 0;
let start = Date.now();

let timerInterval;
let timerBox;
let timerMinutes;
let timerSeconds;
let timerMilliseconds;

function activateTimer(timeRemainingSeconds) {
  msLeft = timeRemainingSeconds * 1000;
  start = Date.now();

  timerBox = document.createElement('div');

  timerBox.classList.add('timer-wrapper');
  timerBox.innerHTML = `
    <div class="timer-box">
      <div class="timer-top">
        <span>Remaining:</span>
        <span>MAXIMUM WORMHOLE DURATION</span>
      </div>

      <div class="timer-upper">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div class="time">
        <div class="timer-left">
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
        </div>
        <div class="timer-center">
        </div>
        <div class="timer-right">
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
          -<br>
        </div>
      </div>

      <div class="timer-bottom">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  `;

  timerMinutes = document.createElement('div');
  timerSeconds = document.createElement('div');
  timerMilliseconds = document.createElement('div');

  const center = timerBox.querySelector('.timer-center');
  center.append(timerMinutes);
  center.append(timerSeconds);
  center.append(timerMilliseconds);

  timerBox.addEventListener('click', removeTimer);
  border.appendChild(timerBox);

  setInterval(updateTimer, 69);
}

function updateTimer() {
  const delta = Date.now() - start; // milliseconds elapsed since start
  let timeLeft = msLeft - delta;

  if (timeLeft <= 0) {
    timeLeft = 0;
    clearInterval(timerInterval);
    timerInterval = undefined;
    updateTimerText(0, 0, 0);
  } else {
    const mins = Math.max(0, Math.floor(timeLeft / 60000));
    const secs = Math.max(0, Math.floor(timeLeft / 1000) % 60);
    const ms = Math.min(Math.max(0, Math.floor(timeLeft / 10) % 100), 99);
    updateTimerText(mins, secs, ms);
  }
}

function updateTimerText(minutes, seconds, milliseconds) {
  updateText(timerMinutes, `${minutes.toString().padStart(2, '0')}`);
  updateText(timerSeconds, `${seconds.toString().padStart(2, '0')}`);
  updateText(timerMilliseconds, `${milliseconds.toString().padStart(2, '0')}`);
}

function removeTimer() {
  clearInterval(timerInterval);
  timerInterval = undefined;
  timerBox?.remove();
}

function updateText(elem, text) {
  if (elem.textContent !== text) {
    elem.textContent = text ?? '';
  }
}

export {removeTimer, activateTimer};
