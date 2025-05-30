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
