// Example: player1Purse should be provided from the game context
import { logAction } from './logger.js';
import { getPlayer2Purse, setPlayer2Purse } from './purse.js';
// AI spend on state: updates popularity and purse for Player 2
function spendOnStateAI(state, cost) {
    if (getPlayer2Purse() < cost) {
        // Optionally play error sound or show feedback
        return;
    }
    setPlayer2Purse(getPlayer2Purse() - cost);
    // Update popularity scores for Player 2
    const id = state.SvgId || state.id;
    let popObj = window.popularityScores[id];
    if (!popObj) return;
    // Increase P2 popularity by 5%, max 100
    let increase = 5;
    let newP2 = Math.min(100, popObj.p2 + increase);
    let delta = newP2 - popObj.p2;
    if (delta <= 0) return; // Already at max
    // Decrease P1 and Others proportionally
    let totalOther = popObj.p1 + popObj.others;
    let newP1 = popObj.p1;
    let newOthers = popObj.others;
    if (totalOther > 0) {
        newP1 = Math.max(0, popObj.p1 - Math.round(delta * (popObj.p1 / totalOther)));
        newOthers = Math.max(0, 100 - newP2 - newP1);
    } else {
        newP1 = 0;
        newOthers = 100 - newP2;
    }
    window.popularityScores[id] = { p1: newP1, p2: newP2, others: newOthers };
    // Refresh all state colors based on current popularity
    if (typeof window.refreshAllStateColors === 'function') {
        window.refreshAllStateColors();
    }
}

// AI spend on campaign promise: updates AI purse and (optionally) promise progress
function spendOnPromiseAI(promise, cost) {
    if (getPlayer2Purse() < cost) {
        // Optionally play error sound or show feedback
        return;
    }
    setPlayer2Purse(getPlayer2Purse() - cost);
    // Optionally update a progress bar or state for the promise
    // For now, just log the action. You can expand this to update UI/progress as needed.
    // Example: window.player2PromiseProgress[promise.name] = ...
}


function startAITakingAction({
    player1Purse,
    startingFunds = player1Purse * 1.5,
    actionFrequency = 2, // seconds
    states = [],
    campaignPromises = [],
    spendOnState = spendOnStateAI,
    spendOnPromise = spendOnPromiseAI
}) {
    // Set the global purse for Player 2 at the start
    if (typeof window.setPlayer2Purse === 'function') {
      window.setPlayer2Purse(startingFunds);
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function takeAction() {
        // Randomly decide to pick a state or a campaign promise
        const actionType = Math.random() < 0.5 ? 'state' : 'promise';

        if (actionType === 'state' && states.length > 0) {
            const state = getRandomItem(states);
            // Cost is number of Lok Sabha seats if available, else fallback
            const cost = state.LokSabhaSeats ? Number(state.LokSabhaSeats) : (state.cost || 10);
            if (getPlayer2Purse() >= cost) {
                spendOnState(state, cost);
                logAction(`<Player2> spent ₹ ${cost}M on state: ${state.State}`);
                // Track funds spent for Player 2
                if (typeof window !== 'undefined') {
                  window.p2SpentThisPhase = (window.p2SpentThisPhase || 0) + cost;
                }
            }
        } else if (actionType === 'promise' && campaignPromises.length > 0) {
            const promise = getRandomItem(campaignPromises);
            const cost = promise.cost || 10; // Example cost
            if (getPlayer2Purse() >= cost) {
                spendOnPromise(promise, cost);
                logAction(`<Player2> spent ₹ ${cost}M on promise: ${promise.name}`);
                // Track funds spent and promise progress for Player 2
                if (typeof window !== 'undefined') {
                  window.p2SpentThisPhase = (window.p2SpentThisPhase || 0) + cost;
                  if (!window.p2PromiseProgress) window.p2PromiseProgress = {};
                  window.p2PromiseProgress[promise.name] = (window.p2PromiseProgress[promise.name] || 0) + 1;
                  if (window.p2PromiseProgress[promise.name] > 10) window.p2PromiseProgress[promise.name] = 10;
                }
            }
        }
    }

    // Start the interval
    const intervalId = setInterval(() => {
        if (getPlayer2Purse() <= 0) {
            clearInterval(intervalId);
            logAction("<Player2> is out of funds.");
            return;
        }
        takeAction();
    }, actionFrequency * 1000);

    // Return a way to stop the AI
    return () => clearInterval(intervalId);
}

export { startAITakingAction };