// game_timer.js - Handles timer, phase, and game over logic
import { logAction, saveLogToFile, logGameStart } from './logger.js';
import { addPhasePurseBonus } from './purse.js';

let totalPhases = 2;
window.currentPhase = 1;
let duration = 27;
let timeLeft = duration;
window.duration = duration;
window.timeLeft = timeLeft;
const circle = document.getElementById('timer-progress');
const phaseText = document.getElementById('timer-phase');
const radius = 80;
const circumference = 2 * Math.PI * radius;

export function updateTimer() {
  const offset = circumference * (1 - timeLeft / duration);
  circle.style.strokeDashoffset = circumference - offset;
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
    window.currentPhase++;
    timeLeft = duration;
    logAction(`=============PHASE ${window.currentPhase} START============`, window.currentPhase);
    addPhasePurseBonus(window.currentPhase);
    updateTimer();
    phaseText.classList.remove('phase-animate');
    void phaseText.offsetWidth;
    phaseText.classList.add('phase-animate');
  } else {
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
export function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimer();
    } else {
      nextPhase();
    }
  }, 1000);
}
