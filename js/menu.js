// Play/Pause logic

let gamePaused = false;
export function togglePausePlay() {
  gamePaused = !gamePaused;
  setPauseState(gamePaused);
}

function setPauseState(paused) {
  gamePaused = paused;
  const icon = document.getElementById('pause-play-icon');
  if (icon) {
    icon.className = gamePaused ? 'fas fa-play' : 'fas fa-pause';
  }
  if (typeof window.setGamePaused === 'function') {
    window.setGamePaused(gamePaused);
  }
  if (typeof window.setAIPaused === 'function') {
    window.setAIPaused(gamePaused);
  }
  // Show/hide overlay
  const overlay = document.getElementById('pause-overlay');
  if (overlay) {
    overlay.classList.toggle('hidden', !gamePaused);
  }
  // Disable pointer events for everything except overlay when paused
  if (gamePaused) {
    document.body.style.pointerEvents = 'none';
    if (overlay) overlay.style.pointerEvents = 'auto';
  } else {
    document.body.style.pointerEvents = '';
  }
}

// Resume button handler
window.addEventListener('DOMContentLoaded', () => {
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.onclick = () => setPauseState(false);
  }
});

// menu.js - Handles top-right menu bar logic for sound/music/help

let soundOn = true;
let musicOn = true;

export function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('sound-toggle-icon').className = soundOn ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  window.soundEnabled = soundOn;
}

export function toggleMusic() {
  musicOn = !musicOn;
  document.getElementById('music-toggle-icon').className = musicOn ? 'fas fa-music' : 'fas fa-music-slash';
  if (window.bgMusic) {
    if (musicOn) {
      window.bgMusic.play();
    } else {
      window.bgMusic.pause();
    }
  }
}

export function showHelp() {
  document.getElementById('help-modal').style.display = 'flex';
}

export function hideHelp() {
  document.getElementById('help-modal').style.display = 'none';
}

// Allow closing help modal by clicking outside or pressing Escape
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideHelp();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideHelp();
    });
  }
});

// Expose soundOn for other modules
window.isSoundOn = () => soundOn;

// Expose pause state for other modules
window.isGamePaused = () => gamePaused;
