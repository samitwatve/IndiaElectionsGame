// Log a phase summary with funds, popularity, and campaign promise progress
export function logPhaseSummary(phase) {
  const logBox = document.getElementById('player1-log');
  if (!logBox) return;
  let summary = `--- PHASE ${phase} SUMMARY ---\n`;

  // Funds
  // Always use the global purse getter functions for accurate values
  const p1Funds = (typeof window.getPlayer1Purse === 'function') ? window.getPlayer1Purse() : 0;
  const p2Funds = (typeof window.getPlayer2Purse === 'function') ? window.getPlayer2Purse() : 0;
  // Use tracked spending for accuracy
  const p1Spent = window.p1SpentThisPhase || 0;
  const p2Spent = window.p2SpentThisPhase || 0;
  summary += `Player 1: Funds Spent: ₹${p1Spent}M | Funds Remaining: ₹${p1Funds}M\n`;
  summary += `Player 2: Funds Spent: ₹${p2Spent}M | Funds Remaining: ₹${p2Funds}M\n`;

  // Projected Seats
  if (window.statesDataMap && window.popularityScores) {
    let p1Seats = 0, p2Seats = 0, othersSeats = 0, totalSeats = 0;
    Object.entries(window.statesDataMap).forEach(([id, data]) => {
      const seats = Number(data.LokSabhaSeats);
      totalSeats += seats;
      const pop = window.popularityScores[id];
      if (!pop) return;
      p1Seats += seats * (pop.p1 / 100);
      p2Seats += seats * (pop.p2 / 100);
      othersSeats += seats * (pop.others / 100);
    });
    p1Seats = Math.round(p1Seats);
    p2Seats = Math.round(p2Seats);
    othersSeats = Math.round(othersSeats);
    summary += `\nProjected Seats: Player 1: ${p1Seats} | Player 2: ${p2Seats} | Others: ${othersSeats}\n`;
  }

  // Popularity by state
  summary += `\nPopularity by State (P1 | P2 | Others):\n`;
  if (window.statesDataMap && window.popularityScores) {
    Object.entries(window.statesDataMap).forEach(([id, state]) => {
      const pop = window.popularityScores[id];
      // Prefer 'State' property, fallback to 'StateName', fallback to code
      const displayName = state.State || state.StateName || id;
      if (pop) {
        summary += `${displayName}: ${pop.p1}% | ${pop.p2}% | ${pop.others}%\n`;
      }
    });
  }

  // Campaign promises progress
  summary += `\nCampaign Promises Progress (max 10):\n`;
  // Player 1 (from DOM bars or JS object)
  summary += `Player 1:\n`;
  if (window.getP1PromiseProgress) {
    const p1Progress = window.getP1PromiseProgress();
    Object.entries(p1Progress).forEach(([name, count]) => {
      summary += `  ${name}: ${count}/10\n`;
    });
  } else {
    summary += '  (progress not available)\n';
  }
  // Player 2 (from JS object)
  summary += `Player 2:\n`;
  if (window.getP2PromiseProgress) {
    const p2Progress = window.getP2PromiseProgress();
    Object.entries(p2Progress).forEach(([name, count]) => {
      summary += `  ${name}: ${count}/10\n`;
    });
  } else {
    summary += '  (progress not available)\n';
  }

  logAction(summary);
}
// Save log to file (Node.js only, for Electron or dev use)
export function saveLogToFile() {
  const logBox = document.getElementById('player1-log');
  if (!logBox) return;
  const logText = logBox.value;
  // Try Node.js/Electron first
  try {
    // eslint-disable-next-line no-undef
    const { saveLogToFile } = require('./logger_node_helper.js');
    saveLogToFile(logText, GAME_ID);
    alert('Game log saved to logs folder.');
    return;
  } catch (e) {
    // Not running in Node.js context, fallback to browser download
  }
  // Browser: trigger download
  try {
    const blob = new Blob([logText], { type: 'text/plain' });
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const filename = `${typeof GAME_ID !== 'undefined' ? GAME_ID : 'game'}_${dd}${mm}${yy}_log.txt`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    alert('Game log downloaded.');
  } catch (err) {
    alert('Could not save or download the log.');
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
  // Replace <Player1> with playerID if present
  let playerID = (typeof window !== 'undefined' && window.playerID) ? window.playerID : 'Player1';
  let msg = text.replace(/<Player1>/g, `<${playerID}>`);
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
  logBox.value += (timestamp ? timestamp : '') + msg + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}

// Initialize log with GAME START and Game ID
export function logGameStart() {
  const logBox = document.getElementById('player1-log');
  if (!logBox) return;
  let playerID = (typeof window !== 'undefined' && window.playerID) ? window.playerID : 'Player1';
  logBox.value =
    '===GAME START===\n' +
    'Game ID: ' + GAME_ID + '\n' +
    'Player: ' + playerID + ' (BJP)\n' +
    '===PHASE 1 START===\n';
  logBox.scrollTop = logBox.scrollHeight;
}
