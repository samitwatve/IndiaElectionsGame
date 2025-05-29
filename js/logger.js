// logger.js - Handles action logging for Player 1 and Game ID

// Generate a random Game ID (simple version: 8-char alphanumeric)
function generateGameID() {
  return 'G' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Store the Game ID for this session
export const GAME_ID = generateGameID();

// Helper to append a line to the log
export function logAction(text) {
  const logBox = document.getElementById('player1-log');
  if (!logBox) return;
  logBox.value += text + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}

// Initialize log with GAME START and Game ID
export function logGameStart() {
  const logBox = document.getElementById('player1-log');
  if (!logBox) return;
  logBox.value =
    '=============GAME START============\n' +
    'Game ID: ' + GAME_ID + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}
