// game_logic.js

// Shuffle an array in place using Fisher–Yates algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Assign an initial "lean" to each state, balancing seat counts
export function assignInitialLeans(svg, statesDataMap, totalLeanSeats = 200) {
  let p1Seats = 0, p2Seats = 0;
  const stateIds = Object.keys(statesDataMap);

  // Sort by seat count descending, then shuffle within same seat count for randomness
  stateIds.sort((a, b) => Number(statesDataMap[b].LokSabhaSeats) - Number(statesDataMap[a].LokSabhaSeats));
  // Group by seat count
  let grouped = {};
  stateIds.forEach(id => {
    const seats = Number(statesDataMap[id].LokSabhaSeats);
    if (!grouped[seats]) grouped[seats] = [];
    grouped[seats].push(id);
  });
  // Shuffle within each group
  let shuffledStateIds = [];
  Object.keys(grouped).sort((a,b) => b-a).forEach(seatCount => {
    shuffle(grouped[seatCount]);
    shuffledStateIds.push(...grouped[seatCount]);
  });

  // Assign leans until each player has ~half of totalLeanSeats
  const targetSeats = Math.floor(totalLeanSeats / 2);
  const assigned = {};

  for (const id of shuffledStateIds) {
    const seats = Number(statesDataMap[id].LokSabhaSeats);
    if (p1Seats < targetSeats && p2Seats < targetSeats) {
      // Assign to player with fewer seats so far
      const player = p1Seats <= p2Seats ? 1 : 2;
      if (player === 1) p1Seats += seats;
      else p2Seats += seats;
      assigned[id] = player;
    } else if (p1Seats < targetSeats) {
      p1Seats += seats;
      assigned[id] = 1;
    } else if (p2Seats < targetSeats) {
      p2Seats += seats;
      assigned[id] = 2;
    } else {
      assigned[id] = 0; // No lean
    }
  }

  // Apply leans to SVG
  for (const id of shuffledStateIds) {
    const region = svg.querySelector(`#${id}`);
    if (region) {
      region.classList.remove('lean-p1', 'lean-p2', 'lean-none');
      if (assigned[id] === 1) region.classList.add('lean-p1');
      else if (assigned[id] === 2) region.classList.add('lean-p2');
      else region.classList.add('lean-none');
    }
  }

  // Optionally, return the assignment for debugging
  return assigned;
}
