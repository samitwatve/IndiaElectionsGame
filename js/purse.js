// --- CATEGORY DOMINANCE BONUS LOGIC ---
// Helper: Get all unique categories from statesDataMap
function getAllCategories() {
    if (!window.statesDataMap) return [];
    const sample = Object.values(window.statesDataMap)[0];
    return Object.keys(sample).filter(k => typeof sample[k] === 'boolean');
}

// Helper: For a given category, get all SvgIds in that category
function getSvgIdsForCategory(category) {
    if (!window.statesDataMap) return [];
    return Object.values(window.statesDataMap)
        .filter(d => d[category] === true)
        .map(d => d.SvgId);
}

// Helper: For a given category, get total seats in that category
function getTotalSeatsForCategory(category) {
    if (!window.statesDataMap) return 0;
    return Object.values(window.statesDataMap)
        .filter(d => d[category] === true)
        .reduce((sum, d) => sum + Number(d.LokSabhaSeats), 0);
}

// Helper: Check if a player leads in all states in a category
function playerLeadsInCategory(player, category) {
    if (!window.statesDataMap || !window.popularityScores) return false;
    const svgIds = getSvgIdsForCategory(category);
    if (svgIds.length === 0) return false;
    return svgIds.every(id => {
        const pop = window.popularityScores[id];
        if (!pop) return false;
        if (player === 1) return pop.p1 > pop.p2 && pop.p1 > pop.others;
        if (player === 2) return pop.p2 > pop.p1 && pop.p2 > pop.others;
        return false;
    });
}

// Award category bonuses at the start of a phase
function awardCategoryBonuses(player, phase) {
    const categories = getAllCategories();
    categories.forEach(category => {
        if (playerLeadsInCategory(player, category)) {
            const totalSeats = getTotalSeatsForCategory(category);
            if (totalSeats > 0) {
                const bonus = Math.round(totalSeats / 2);
                if (player === 1) {
                    player1Purse += bonus;
                    updatePlayer1PurseDisplay();
                    showPlayer1PurseAddition(bonus);
                    logAction(`<Player1> received CATEGORY BONUS ₹ +${bonus}M for leading all in ${category} (${totalSeats} seats)`, phase);
                } else if (player === 2) {
                    player2Purse += bonus;
                    logAction(`<Player2> received CATEGORY BONUS ₹ +${bonus}M for leading all in ${category} (${totalSeats} seats)`, phase);
                }
            }
        }
    });
}
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
    // Category bonuses for Player 2
    awardCategoryBonuses(2, phase);
    // Optionally, update a Player 2 purse display here
}
// Add 100M to Player 1's purse at the end of each phase
import { logAction } from './logger.js';
export function addPhasePurseBonus(phase) {
    player1Purse += 250;
    updatePlayer1PurseDisplay();
    showPlayer1PurseAddition(250);
    logAction(`<Player1> received ₹ +250M`, phase);
    // Category bonuses for Player 1
    awardCategoryBonuses(1, phase);
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
