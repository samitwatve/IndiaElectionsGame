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
  const assigned = {};

  // Assign one state at a time to the player with fewer seats, stop as soon as either reaches the target
  // let assignmentLog = ['*** assignInitialLeans v2.1 ***'];
  while (p1Seats < leanSeatTarget && p2Seats < leanSeatTarget && idx < stateIds.length) {
    const id = stateIds[idx];
    const seats = Number(statesDataMap[id].LokSabhaSeats);
    const stateName = statesDataMap[id].State || id;
    if (p1Seats <= p2Seats) {
      // Skip this state if it would push P1 beyond target and smaller states remain
      if (p1Seats + seats > leanSeatTarget && idx < stateIds.length - 1) {
        idx++;
        continue;
      }
      assigned[id] = 1;
      p1Seats += seats;
      // assignmentLog.push(`P1: ${stateName} assigned, total = ${p1Seats}`);
    } else {
      if (p2Seats + seats > leanSeatTarget && idx < stateIds.length - 1) {
        idx++;
        continue;
      }
      assigned[id] = 2;
      p2Seats += seats;
      // assignmentLog.push(`P2: ${stateName} assigned, total = ${p2Seats}`);
    }
    idx++;
  }

  // Apply classes based on assignment
  Object.keys(statesDataMap).forEach(id => {
    const region = svg.querySelector(`#${id}`);
    if (!region) return;
    region.classList.remove('lean-none');

    if (assigned[id] === 1) region.classList.add('lean-p1');
    else if (assigned[id] === 2) region.classList.add('lean-p2');
    else region.classList.add('lean-none');
  });

  // Removed assignment log and summary display
  return assigned;
}
