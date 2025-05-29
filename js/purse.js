// Purse logic for Player 1
let player1Purse = 10000;

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

// Ensure purse is displayed after DOM is ready
document.addEventListener('DOMContentLoaded', updatePlayer1PurseDisplay);
