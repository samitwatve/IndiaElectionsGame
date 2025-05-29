// Save log to file (Node.js only, for Electron or dev use)
export function saveLogToFile() {
  const logBox = document.getElementById('player1-log');
  if (!logBox) return;
  const logText = logBox.value;
  // Use Node.js require if available (for Electron or dev server)
  try {
    // eslint-disable-next-line no-undef
    const { saveLogToFile } = require('./logger_node_helper.js');
    saveLogToFile(logText, GAME_ID);
    // Optionally, show a message to the user
    alert('Game log saved to logs folder.');
  } catch (e) {
    // Not running in Node.js context
    alert('Log saving is only supported in Node.js/Electron environment.');
  }
}
// logger.js - Handles action logging for Player 1 and Game ID

// Generate a random Game ID (simple version: 8-char alphanumeric)
function generateGameID() {
  return 'G' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Store the Game ID for this session
export const GAME_ID = generateGameID();

// Helper to append a line to the log, with in-game timestamp
export function logAction(text) {
  const logBox = document.getElementById('player1-log');
  if (!logBox) return;
  // Get in-game time from window.timeLeft and window.duration
  let timestamp = '';
  if (typeof window !== 'undefined' && typeof window.timeLeft === 'number' && typeof window.duration === 'number') {
    // Calculate seconds since phase start
    let secondsElapsed = window.duration - window.timeLeft;
    let totalSeconds = (window.currentPhase - 1) * window.duration + secondsElapsed;
    let min = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    let sec = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    timestamp = `[${min}:${sec}] `;
  }
  logBox.value += (timestamp ? timestamp : '') + text + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}

// Initialize log with GAME START and Game ID
export function logGameStart() {
  const logBox = document.getElementById('player1-log');
  if (!logBox) return;
  logBox.value =
    '===GAME START===\n' +
    'Game ID: ' + GAME_ID + '\n' +
    '===PHASE 1 START===\n';
  logBox.scrollTop = logBox.scrollHeight;
}
