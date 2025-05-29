// Purse logic for Player 1
let player1Purse = 100;

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
    setTimeout(() => {
        if (deduction && deduction.parentNode) deduction.parentNode.removeChild(deduction);
    }, 1000);
}

// Ensure purse is displayed after DOM is ready
document.addEventListener('DOMContentLoaded', updatePlayer1PurseDisplay);
