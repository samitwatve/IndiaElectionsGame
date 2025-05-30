// Purse logic for Player 2 (AI)
let player2Purse = 375; // 1.5x starting value

export function getPlayer2Purse() {
    return player2Purse;
}

export function setPlayer2Purse(val) {
    player2Purse = val;
}

export function addPhasePurseBonusAI(phase) {
    player2Purse += 375; // or whatever the per-phase bonus is
    logAction(`<Player2> received ₹ +375M`, phase);
    // Optionally, update a Player 2 purse display here
}
// Add 100M to Player 1's purse at the end of each phase
import { logAction } from './logger.js';
export function addPhasePurseBonus(phase) {
    player1Purse += 250;
    updatePlayer1PurseDisplay();
    showPlayer1PurseAddition(250);
    logAction(`<Player1> received ₹ +250M`, phase);
}
// Show green animation for cash added to purse
export function showPlayer1PurseAddition(amount) {
    const player1PurseDiv = document.getElementById('player1-purse');
    if (!player1PurseDiv) return;
    let addition = document.createElement('span');
    addition.className = 'purse-addition';
    addition.textContent = `+${amount}M`;
    player1PurseDiv.appendChild(addition);
    // Play cash added sound
    playSound('cash_added.mp3');
    setTimeout(() => {
        if (addition && addition.parentNode) addition.parentNode.removeChild(addition);
    }, 1000);
}
// Purse logic for Player 1
let player1Purse = 250;

export function getPlayer1Purse() {
    return player1Purse;
}

export function setPlayer1Purse(val) {
    player1Purse = val;
}

export function updatePlayer1PurseDisplay() {
    const player1PurseDiv = document.getElementById('player1-purse');
    if (player1PurseDiv) player1PurseDiv.textContent = `Purse: ₹${player1Purse}M`;
}

export function shakePlayer1Purse() {
    const player1PurseDiv = document.getElementById('player1-purse');
    if (player1PurseDiv) {
        player1PurseDiv.classList.add('shake');
        setTimeout(() => player1PurseDiv.classList.remove('shake'), 400);
    }
}

export function showPlayer1PurseDeduction(amount) {
    const player1PurseDiv = document.getElementById('player1-purse');
    if (!player1PurseDiv) return;
    let deduction = document.createElement('span');
    deduction.className = 'purse-deduction';
    deduction.textContent = `-${amount}M`;
    player1PurseDiv.appendChild(deduction);
    // Play money spent sound
    playSound('money_spent.mp3');
    setTimeout(() => {
        if (deduction && deduction.parentNode) deduction.parentNode.removeChild(deduction);
    }, 1000);
}
// Preload and play sounds instantly
const soundFiles = ['cash_added.mp3', 'money_spent.mp3', 'error.mp3'];
const soundCache = {};
for (const file of soundFiles) {
    const audio = new Audio(`static/sounds/${file}`);
    audio.volume = 0.7;
    soundCache[file] = audio;
}

export function playSound(filename) {
    // Check global sound toggle
    if (typeof window !== 'undefined' && typeof window.isSoundOn === 'function' && !window.isSoundOn()) {
        return; // Sound is OFF
    }
    const cached = soundCache[filename];
    if (cached) {
        // Clone the audio node to allow overlapping sounds
        const clone = cached.cloneNode();
        clone.volume = cached.volume;
        clone.play();
    } else {
        // fallback if not preloaded
        const audio = new Audio(`static/sounds/${filename}`);
        audio.volume = 0.7;
        audio.play();
    }
}

// Ensure purse is displayed after DOM is ready
document.addEventListener('DOMContentLoaded', updatePlayer1PurseDisplay);
