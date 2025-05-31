// game_timer.js - Handles timer, phase, and game over logic
import { logAction, saveLogToFile, logGameStart } from './logger.js';
import { addPhasePurseBonus, addPhasePurseBonusAI } from './purse.js';

let totalPhases = 8;
window.currentPhase = 1;

let duration = 27;
let timeLeft = duration;
window.duration = duration;
window.timeLeft = timeLeft;
const circle = document.getElementById('timer-progress');
const phaseText = document.getElementById('timer-phase');
const radius = 48; // Match SVG r=48
const circumference = 2 * Math.PI * radius; // ≈ 302

export function updateTimer() {
  // Progress: 0 (full) to circumference (empty)
  const progress = timeLeft / duration;
  circle.style.strokeDashoffset = circumference * (1 - progress);
  phaseText.textContent = `Phase ${window.currentPhase} / ${totalPhases}`;
  window.timeLeft = timeLeft;
  window.duration = duration;
}

export function showGameOverScreen(winner) {
  document.querySelector('.game-container').style.display = 'none';
  document.querySelector('.timer-container').style.display = 'none';
  const gameoverScreen = document.getElementById('gameover-screen');
  const banner = document.getElementById('gameover-banner');
  if (winner === 1 || winner === 2) {
    banner.textContent = `Player ${winner} Wins!`;
  } else {
    banner.textContent = 'Hung Parliament! Try again next time!';
  }
  gameoverScreen.style.display = 'flex';
}

export function nextPhase() {
  if (window.currentPhase < totalPhases) {
    // Log summary BEFORE bonuses and phase increment
    if (typeof window.logPhaseSummary === 'function') {
      window.logPhaseSummary(window.currentPhase);
    }
    // Next phase
    window.currentPhase++;
    timeLeft = duration;
    logAction(`=============PHASE ${window.currentPhase} START============`, window.currentPhase);
    addPhasePurseBonus(window.currentPhase);
    addPhasePurseBonusAI(window.currentPhase);
    // Now record the new phase's starting purse and reset counters
    if (typeof window.getPlayer1Purse === 'function') window.p1PhaseStartPurse = window.getPlayer1Purse();
    if (typeof window.getPlayer2Purse === 'function') window.p2PhaseStartPurse = window.getPlayer2Purse();
    window.p1SpentThisPhase = 0;
    window.p2SpentThisPhase = 0;
    updateTimer();
    phaseText.classList.remove('phase-animate');
    void phaseText.offsetWidth;
    phaseText.classList.add('phase-animate');
  } else {
    // End of last phase: log summary before game over
    if (typeof window.logPhaseSummary === 'function') {
      window.logPhaseSummary(window.currentPhase);
    }
    phaseText.textContent = "Game Over";
    clearInterval(timerInterval);
    circle.style.stroke = '#aaa';
    if (window.bgMusic && !window.bgMusic.paused) {
      window.bgMusic.pause();
      window.bgMusic.currentTime = 0;
    }
    let winner = null;
    let p1 = 0, p2 = 0;
    const seatsText = document.getElementById('seats-text');
    if (seatsText) {
      const match = seatsText.textContent.match(/P1: (\d+) \| P2: (\d+)/);
      if (match) {
        p1 = parseInt(match[1], 10);
        p2 = parseInt(match[2], 10);
      }
    }
    if (p1 > 272 && p1 > p2) {
      winner = 1;
    } else if (p2 > 272 && p2 > p1) {
      winner = 2;
    }
    showGameOverScreen(winner);
    const audio = new Audio('static/sounds/victory.mp3');
    audio.volume = 0.7;
    audio.play();
  }
}

circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;
updateTimer();


let timerInterval = null;
let paused = false;

export function setGamePaused(pause) {
  paused = pause;
}

export function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (paused) return;
    if (timeLeft > 0) {
      timeLeft--;
      updateTimer();
    } else {
      nextPhase();
    }
  }, 1000);
}

// Expose pause setter for menu.js
window.setGamePaused = setGamePaused;
