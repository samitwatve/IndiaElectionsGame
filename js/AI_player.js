// AI_player.js
// Function to simulate an AI player taking actions at a set frequency

/**
 * Starts the AI action loop.
 * @param {number} startingFunds - The initial funds for the AI player.
 * @param {number} actionFrequency - How often the AI should act (in seconds).
 */
function startAITakingAction(startingFunds, actionFrequency) {
    let funds = startingFunds;
    console.log(`AI starting with funds: ₹${funds}M`);
    const interval = setInterval(() => {
        // Example action: spend a random amount between 1 and 10
        const spend = Math.floor(Math.random() * 10) + 1;
        if (funds >= spend) {
            funds -= spend;
            console.log(`AI spent ₹${spend}M. Funds left: ₹${funds}M`);
        } else {
            console.log(`AI does not have enough funds to spend ₹${spend}M. Funds left: ₹${funds}M`);
            clearInterval(interval);
            console.log('AI has stopped taking actions.');
        }
    }, actionFrequency * 1000);
    return interval; // Return interval in case you want to stop it externally
}

// Example usage (uncomment to test):
// startAITakingAction(100, 2); // AI starts with 100 funds, acts every 2 seconds
