// Play/Pause logic


let gamePaused = false;
let soundOn = true;
let musicOn = true;

function updatePauseIcon() {
  const icon = document.getElementById('pause-play-icon');
  if (icon) {
    icon.className = gamePaused ? 'fas fa-play' : 'fas fa-pause';
  }
}

function updatePauseOverlay() {
  const overlay = document.getElementById('pause-overlay');
  if (overlay) {
    overlay.classList.toggle('hidden', !gamePaused);
    overlay.style.pointerEvents = gamePaused ? 'auto' : '';
  }
  document.body.style.pointerEvents = gamePaused ? 'none' : '';
}

function updateSoundIcon() {
  const icon = document.getElementById('sound-toggle-icon');
  if (icon) {
    icon.className = soundOn ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  }
}

function updateMusicIcon() {
  const icon = document.getElementById('music-toggle-icon');
  if (icon) {
    icon.className = musicOn ? 'fas fa-music' : 'fas fa-music-slash';
  }
}

function updateHelpModal(show) {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = show ? 'flex' : 'none';
  }
}

function setPauseState(paused) {
  gamePaused = paused;
  updatePauseIcon();
  updatePauseOverlay();
  if (typeof window.setGamePaused === 'function') {
    window.setGamePaused(gamePaused);
  }
  if (typeof window.setAIPaused === 'function') {
    window.setAIPaused(gamePaused);
  }
}

export function togglePausePlay() {
  setPauseState(!gamePaused);
}


// Resume button handler
window.addEventListener('DOMContentLoaded', () => {
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.onclick = () => setPauseState(false);
  }
  updatePauseIcon();
  updatePauseOverlay();
  updateSoundIcon();
  updateMusicIcon();
});



export function toggleSound() {
  soundOn = !soundOn;
  window.soundEnabled = soundOn;
  updateSoundIcon();
}


export function toggleMusic() {
  musicOn = !musicOn;
  updateMusicIcon();
  if (window.bgMusic) {
    if (musicOn) {
      window.bgMusic.play();
    } else {
      window.bgMusic.pause();
    }
  }
}


export function showHelp() {
  updateHelpModal(true);
}

export function hideHelp() {
  updateHelpModal(false);
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
