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

/**
 * Assign initial popularity for each state:
 * - About 100 seats favor P1 (P1: 35-60%, P2: 10-40%, Others: rest)
 * - About 100 seats favor P2 (P2: 35-60%, P1: 10-40%, Others: rest)
 * - Remaining states: P1 < 35%, P2 < 35%, Others is highest
 * Returns: { [stateId]: { p1: %, p2: %, others: % } }
 */
export function assignInitialLeans(svg, statesDataMap, leanSeatTarget = 100) {
  // Clear existing lean classes and default to neutral
  Object.keys(statesDataMap).forEach(id => {
    const region = svg.querySelector(`#${id}`);
    if (region) {
      region.classList.remove('lean-p1', 'lean-p2', 'lean-none');
      region.classList.add('lean-none');
    }
  });

  // Sort by seat count, shuffle for randomness
  const stateIds = Object.keys(statesDataMap)
    .sort((a, b) => Number(statesDataMap[a].LokSabhaSeats) - Number(statesDataMap[b].LokSabhaSeats));
  shuffle(stateIds);

  let p1Seats = 0, p2Seats = 0, idx = 0;
  const popularityScores = {};
  const assigned = {};

  // Assign states to P1 until ~leanSeatTarget seats
  while (p1Seats < leanSeatTarget && idx < stateIds.length) {
    const id = stateIds[idx];
    const seats = Number(statesDataMap[id].LokSabhaSeats);
    if (assigned[id]) { idx++; continue; }
    // P1: 35-60%, P2: 10-40%, Others: rest
    const p1 = Math.floor(35 + Math.random() * 26); // 35-60
    const p2 = Math.floor(10 + Math.random() * 31); // 10-40
    let others = 100 - p1 - p2;
    if (others < 0) { others = 0; }
    popularityScores[id] = { p1, p2, others };
    assigned[id] = 1;
    p1Seats += seats;
    idx++;
  }

  // Assign states to P2 until ~leanSeatTarget seats
  idx = 0;
  while (p2Seats < leanSeatTarget && idx < stateIds.length) {
    const id = stateIds[idx];
    if (assigned[id]) { idx++; continue; }
    const seats = Number(statesDataMap[id].LokSabhaSeats);
    // P2: 35-60%, P1: 10-40%, Others: rest
    const p2 = Math.floor(35 + Math.random() * 26); // 35-60
    const p1 = Math.floor(10 + Math.random() * 31); // 10-40
    let others = 100 - p1 - p2;
    if (others < 0) { others = 0; }
    popularityScores[id] = { p1, p2, others };
    assigned[id] = 2;
    p2Seats += seats;
    idx++;
  }

  // Remaining states: both P1 and P2 < 35%, Others is highest
  for (const id of stateIds) {
    if (assigned[id]) continue;
    const p1 = Math.floor(10 + Math.random() * 25); // 10-34
    const p2 = Math.floor(10 + Math.random() * 25); // 10-34
    let others = 100 - p1 - p2;
    if (others < 0) { others = 0; }
    popularityScores[id] = { p1, p2, others };
    assigned[id] = 0;
  }

  // Apply classes for visual feedback (optional)
  Object.keys(statesDataMap).forEach(id => {
    const region = svg.querySelector(`#${id}`);
    if (!region) return;
    region.classList.remove('lean-none', 'lean-p1', 'lean-p2');
    if (assigned[id] === 1) region.classList.add('lean-p1');
    else if (assigned[id] === 2) region.classList.add('lean-p2');
    else region.classList.add('lean-none');
  });

  return popularityScores;
}
