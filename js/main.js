// Expose phase summary logger to window for use in game_timer
import { logPhaseSummary } from './logger.js';
window.logPhaseSummary = logPhaseSummary;

// Helper: Track funds spent per phase for both players
window.p1SpentThisPhase = 0;
window.p2SpentThisPhase = 0;
// Track starting purse for each phase
import { getPlayer1Purse, getPlayer2Purse, updateCategoryButtonBorders } from './purse.js';
// Expose purse getters to global window for logger
window.getPlayer1Purse = getPlayer1Purse;
window.getPlayer2Purse = getPlayer2Purse;
// Set phase start purse to actual purse after DOM is ready
window.p1PhaseStartPurse = 250;
window.p2PhaseStartPurse = 375;
window.addEventListener('DOMContentLoaded', () => {
  if (typeof getPlayer1Purse === 'function') window.p1PhaseStartPurse = getPlayer1Purse();
  if (typeof getPlayer2Purse === 'function') window.p2PhaseStartPurse = getPlayer2Purse();
  // Update category button borders on load
  if (typeof updateCategoryButtonBorders === 'function') updateCategoryButtonBorders();
});

// Helper: Track campaign promise progress for both players
window.p1PromiseProgress = {};
window.p2PromiseProgress = {};
window.getP1PromiseProgress = () => window.p1PromiseProgress;
window.getP2PromiseProgress = () => window.p2PromiseProgress;
// main.js - Handles start screen, timer, and game over logic

import './map.js';
import { startAITakingAction } from './AI_player.js';
import { policyTree } from './tech-tree.js';
import { logAction, saveLogToFile, logGameStart } from './logger.js';
import { addPhasePurseBonus } from './purse.js';
import { updateTimer, showGameOverScreen, nextPhase, startTimer } from './game_timer.js';
import { toggleSound, toggleMusic, showHelp, togglePausePlay } from './menu.js';
// Attach menu bar event listeners after DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const musicBtn = document.getElementById('music-toggle-btn');
  const helpBtn = document.getElementById('help-btn');
  const pausePlayBtn = document.getElementById('pause-play-btn');
  if (soundBtn) soundBtn.onclick = toggleSound;
  if (musicBtn) musicBtn.onclick = toggleMusic;
  if (helpBtn) helpBtn.onclick = showHelp;
  if (pausePlayBtn) pausePlayBtn.onclick = togglePausePlay;
});

// --- Start Screen and Background Music Logic ---

window.bgMusic = undefined;

const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-game-btn');
const playerIdInput = document.getElementById('player-id-input');
document.body.style.overflow = 'hidden';


// Store player ID globally
window.playerID = 'Player1';

// Update Player 1 label in sidebar when playerID changes
function updatePlayer1Label() {
  const label = document.querySelector('.player1-panel h2');
  if (label) {
    label.innerHTML = `${window.playerID} (<span class="bjp-orange">BJP</span>)`;
  }
}
window.updatePlayer1Label = updatePlayer1Label;

function startGame() {
  // Get player ID from input, fallback to 'Player1' if empty
  let pid = playerIdInput && playerIdInput.value.trim();
  if (!pid) pid = 'Player1';
  if (pid.length > 12) pid = pid.slice(0, 12);
  window.playerID = pid;
  updatePlayer1Label();

  startScreen.style.display = 'none';
  document.body.style.overflow = '';
  if (!window.bgMusic) {
    window.bgMusic = new Audio('static/sounds/background_music.mp3');
    window.bgMusic.loop = true;
    window.bgMusic.volume = 0.5;
  }
  window.bgMusic.play();
  startTimer();

  // Wait for map and states data to be loaded
  const tryStartAI = () => {
    if (window.statesDataMap && window.popularityScores) {
      // Flatten policyTree into an array of campaign promise objects
      const campaignPromises = Object.entries(policyTree).flatMap(([category, promises]) =>
        promises.map(name => ({ name, category, cost: 10 }))
      );
      // Start AI actions
      // Store AI stop function globally so we can pause/resume
      window._aiStopFn = startAITakingAction({
        player1Purse: 250, // or use getPlayer1Purse() if available
        states: Object.values(window.statesDataMap),
        campaignPromises
      });
      window._aiPaused = false;
    } else {
      setTimeout(tryStartAI, 200); // Retry until data is ready
    }
  };
  tryStartAI();
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
  updatePlayer1Label();
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
