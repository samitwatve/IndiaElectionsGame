/**
 * Initialize popularity scores for player 1 for each state.
 * Some states get a score between 50-70, others between 30-50.
 * @param {Object} statesDataMap - Map of state IDs to data
 * @param {number} highCount - Number of states to get high popularity (default: half)
 * @returns {Object} statePopularity - Mapping of state ID to popularity score (0-100)
 */
export function initializePopularityScores(statesDataMap, highCount) {
  const stateIds = Object.keys(statesDataMap);
  const totalStates = stateIds.length;
  if (!highCount) highCount = Math.floor(totalStates / 2);
  // Shuffle state IDs for random assignment
  const shuffled = [...stateIds];
  shuffle(shuffled);
  const statePopularity = {};
  // Assign high popularity (50-70) to first highCount states
  for (let i = 0; i < highCount; i++) {
    const id = shuffled[i];
    statePopularity[id] = Math.floor(50 + Math.random() * 21); // 50-70
  }
  // Assign low popularity (30-50) to the rest
  for (let i = highCount; i < totalStates; i++) {
    const id = shuffled[i];
    statePopularity[id] = Math.floor(30 + Math.random() * 21); // 30-50
  }
  return statePopularity;
}
// game_logic.js

// Shuffle an array in place using Fisher–Yates algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Assign an initial "lean" to each state by alternating picks:
 * - Assign one random state to P1, then one to P2, repeating until both exceed target seats.
 * - All other states remain neutral.
 * @param {SVGElement} svg - SVG map container
 * @param {Object} statesDataMap - Map of state IDs to data (including LokSabhaSeats)
 * @param {number} leanSeatTarget - Seat threshold per player (default 100)
 * @returns {Object} assigned - Mapping of state ID to 1 (P1), 2 (P2), or 0 (neutral)
 */
export function assignInitialLeans(svg, statesDataMap, leanSeatTarget = 50) {
  console.log('leanSeatTarget seen by function →', leanSeatTarget);
  // Clear existing lean classes and default to neutral
  Object.keys(statesDataMap).forEach(id => {
    const region = svg.querySelector(`#${id}`);
    if (region) {
      region.classList.remove('lean-p1', 'lean-p2');
      region.classList.add('lean-none');
    }
  });

  // Get state IDs, sort by ascending seat count, then shuffle for randomness among equals
  const stateIds = Object.keys(statesDataMap)
    .sort((a, b) => Number(statesDataMap[a].LokSabhaSeats) - Number(statesDataMap[b].LokSabhaSeats));
  shuffle(stateIds);

  let p1Seats = 0, p2Seats = 0, idx = 0;
  const popularityScores = {};
  const assigned = {};

  // Assign one state at a time to the player with fewer seats, stop as soon as either reaches the target
  while (p1Seats < leanSeatTarget && p2Seats < leanSeatTarget && idx < stateIds.length) {
    const id = stateIds[idx];
    const seats = Number(statesDataMap[id].LokSabhaSeats);
    if (p1Seats <= p2Seats) {
      if (p1Seats + seats > leanSeatTarget && idx < stateIds.length - 1) {
        idx++;
        continue;
      }
      assigned[id] = 1;
      p1Seats += seats;
      popularityScores[id] = Math.floor(50 + Math.random() * 21); // 50-70
    } else {
      if (p2Seats + seats > leanSeatTarget && idx < stateIds.length - 1) {
        idx++;
        continue;
      }
      assigned[id] = 2;
      p2Seats += seats;
      popularityScores[id] = Math.floor(30 + Math.random() * 21); // 30-50
    }
    idx++;
  }

  // For remaining states (not assigned to either), set neutral popularity (exactly 50)
  for (const id of stateIds) {
    if (!(id in popularityScores)) {
      popularityScores[id] = 50;
    }
  }

  // Apply classes based on assignment (optional, can be updated to reflect popularity visually)
  Object.keys(statesDataMap).forEach(id => {
    const region = svg.querySelector(`#${id}`);
    if (!region) return;
    region.classList.remove('lean-none');
    if (assigned[id] === 1) region.classList.add('lean-p1');
    else if (assigned[id] === 2) region.classList.add('lean-p2');
    else region.classList.add('lean-none');
  });

  return popularityScores;
}
