// main.js - Handles start screen, timer, and game over logic

import './map.js';
import { logAction, saveLogToFile, logGameStart } from './logger.js';
import { addPhasePurseBonus } from './purse.js';
import { updateTimer, showGameOverScreen, nextPhase, startTimer } from './game_timer.js';
import { toggleSound, toggleMusic, showHelp } from './menu.js';
// Attach menu bar event listeners after DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const musicBtn = document.getElementById('music-toggle-btn');
  const helpBtn = document.getElementById('help-btn');
  if (soundBtn) soundBtn.onclick = toggleSound;
  if (musicBtn) musicBtn.onclick = toggleMusic;
  if (helpBtn) helpBtn.onclick = showHelp;
});

// --- Start Screen and Background Music Logic ---

window.bgMusic = undefined;
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-game-btn');
document.body.style.overflow = 'hidden';
function startGame() {
  startScreen.style.display = 'none';
  document.body.style.overflow = '';
  if (!window.bgMusic) {
    window.bgMusic = new Audio('static/sounds/background_music.mp3');
    window.bgMusic.loop = true;
    window.bgMusic.volume = 0.5;
  }
  window.bgMusic.play();
  startTimer();
}
startBtn.addEventListener('click', startGame);




const gameoverScreen = document.getElementById('gameover-screen');
const downloadLogBtn = document.getElementById('download-log-btn');
const quitBtn = document.getElementById('quit-btn');
if (downloadLogBtn) {
  downloadLogBtn.addEventListener('click', () => {
    saveLogToFile();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });
}
if (quitBtn) {
  quitBtn.addEventListener('click', () => {
    window.location.reload();
  });
}


window.addEventListener('DOMContentLoaded', () => {
  logGameStart();
});


window.addEventListener('beforeunload', (e) => {
  const phaseText = document.getElementById('timer-phase');
  if (phaseText && !phaseText.textContent.includes('Game Over')) {
    const confirmationMessage = 'The game is still running. Are you sure you want to leave? Your log will be saved.';
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  }
});

window.addEventListener('unload', () => {
  const phaseText = document.getElementById('timer-phase');
  if (phaseText && !phaseText.textContent.includes('Game Over')) {
    saveLogToFile();
  }
});
