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
export function assignInitialLeans(svg, statesDataMap, leanSeatTarget = 100) {
  // Clear existing lean classes and default to neutral
  Object.keys(statesDataMap).forEach(id => {
    const region = svg.querySelector(`#${id}`);
    if (region) {
      region.classList.remove('lean-p1', 'lean-p2');
      region.classList.add('lean-none');
    }
  });

  // Get and shuffle state IDs
  const stateIds = Object.keys(statesDataMap);
  shuffle(stateIds);

  let p1Seats = 0;
  let p2Seats = 0;
  const assigned = {};

  // Alternate picks: even index → P1, odd → P2
  for (let i = 0; i < stateIds.length; i++) {
    const id = stateIds[i];
    const seats = Number(statesDataMap[id].LokSabhaSeats);

    if (i % 2 === 0 && p1Seats < leanSeatTarget) {
      assigned[id] = 1;
      p1Seats += seats;
    } else if (i % 2 !== 0 && p2Seats < leanSeatTarget) {
      assigned[id] = 2;
      p2Seats += seats;
    }

    // Stop once both have crossed the target
    if (p1Seats >= leanSeatTarget && p2Seats >= leanSeatTarget) break;
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

  // Display summary of assigned states & seats
  const p1Count = Object.values(assigned).filter(v => v === 1).length;
  const p2Count = Object.values(assigned).filter(v => v === 2).length;
  let summaryEl = document.getElementById('lean-summary');
  if (!summaryEl) {
    summaryEl = document.createElement('div');
    summaryEl.id = 'lean-summary';
    svg.parentNode.insertBefore(summaryEl, svg.nextSibling);
  }
  summaryEl.textContent =
    `Player 1: ${p1Count} states, ${p1Seats} seats | Player 2: ${p2Count} states, ${p2Seats} seats`;
  return assigned;
}
