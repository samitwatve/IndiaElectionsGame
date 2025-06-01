// Expose a global function for AI to trigger a ripple on a state
window.showAIRippleOnState = function(stateId) {
    let svg = document.querySelector('.india-svg-map');
    if (!svg) {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) svg = mapContainer.querySelector('svg');
    }
    if (svg) {
        const region = svg.querySelector(`#${stateId}`);
        if (region) showRippleOnState(region, '#43a047'); // bright green
    }
};
// --- Ripple/Splash Effect Helper ---
// color: string (CSS color), e.g. '#ff9800' for P1, '#4caf50' for P2
// region: SVGElement (the state path or shape)
export function showRippleOnState(region, color = '#ff9800') {
    if (!region || !region.ownerSVGElement) return;
    const svg = region.ownerSVGElement;
    // Get region's bounding box center
    const bbox = region.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    // Create ripple circle
    const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ripple.setAttribute('cx', cx);
    ripple.setAttribute('cy', cy);
    ripple.setAttribute('r', 1);
    ripple.setAttribute('fill', color);
    ripple.setAttribute('fill-opacity', '0.85'); // More visible
    ripple.setAttribute('stroke', '#fff');
    ripple.setAttribute('stroke-width', '2');
    ripple.setAttribute('pointer-events', 'none');
    ripple.style.transition = 'r 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.8s';
    svg.appendChild(ripple);
    // Animate
    setTimeout(() => {
        ripple.setAttribute('r', Math.max(bbox.width, bbox.height) * 0.85);
        ripple.style.opacity = '0';
    }, 10);
    // Remove after animation
    setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 900);
}
// Helper: refresh all state colors based on current popularity
function refreshAllStateColors() {
    Object.entries(window.popularityScores).forEach(([id, popObj]) => {
        const region = svg.querySelector(`#${id}`);
        if (region) {
            region.classList.remove('lean-p1', 'lean-p2', 'lean-none');
            region.style.fill = popularityToColor(popObj);
        }
    });
    // Also update projected seats circle
    updateProjectedSeatsCircle();
}
// --- Projected Seats Circle Logic ---
function updateProjectedSeatsCircle() {
    // Get popularityScores and statesDataMap
    const popularityScores = window.popularityScores;
    const statesDataMap = window.statesDataMap;
    if (!popularityScores || !statesDataMap) return;

    let p1Seats = 0, p2Seats = 0, othersSeats = 0, totalSeats = 0;
    Object.entries(statesDataMap).forEach(([id, data]) => {
        const seats = Number(data.LokSabhaSeats);
        totalSeats += seats;
        const pop = popularityScores[id];
        if (!pop) return;
        // Proportional allocation
        p1Seats += seats * (pop.p1 / 100);
        p2Seats += seats * (pop.p2 / 100);
        othersSeats += seats * (pop.others / 100);
    });
    // Round to nearest integer for display
    p1Seats = Math.round(p1Seats);
    p2Seats = Math.round(p2Seats);
    othersSeats = Math.round(othersSeats);

    // Update text
    const seatsText = document.getElementById('seats-text');
    if (seatsText) {
        seatsText.textContent = `P1: ${p1Seats} | P2: ${p2Seats} | Others: ${othersSeats}`;
    }

    // Update arcs
    const radius = 48; // Match SVG r=48
    const circumference = 2 * Math.PI * radius; // ≈ 302
    // Proportions
    const p1Prop = p1Seats / totalSeats;
    const p2Prop = p2Seats / totalSeats;
    const othersProp = othersSeats / totalSeats;

    // Each arc is a segment of the circle, drawn in order: P1, P2, Others
    // All arcs start at the top (12 o'clock, -90deg)
    // We'll use stroke-dasharray and stroke-dashoffset to achieve this
    const p1Arc = circumference * p1Prop;
    const p2Arc = circumference * p2Prop;
    const othersArc = circumference * othersProp;

    // Set dasharray and dashoffset for each
    const p1Circle = document.getElementById('seats-p1');
    const p2Circle = document.getElementById('seats-p2');
    const othersCircle = document.getElementById('seats-others');

    if (p1Circle) {
        p1Circle.style.strokeDasharray = `${p1Arc} ${circumference - p1Arc}`;
        p1Circle.style.strokeDashoffset = '0';
        p1Circle.style.display = p1Arc > 0 ? '' : 'none';
    }
    if (p2Circle) {
        p2Circle.style.strokeDasharray = `${p2Arc} ${circumference - p2Arc}`;
        p2Circle.style.strokeDashoffset = `${-p1Arc}`;
        p2Circle.style.display = p2Arc > 0 ? '' : 'none';
    }
    if (othersCircle) {
        othersCircle.style.strokeDasharray = `${othersArc} ${circumference - othersArc}`;
        othersCircle.style.strokeDashoffset = `${-(p1Arc + p2Arc)}`;
        othersCircle.style.display = othersArc > 0 ? '' : 'none';
    }
}
// Utility: interpolate between two hex colors
function interpolateColor(color1, color2, factor) {
    // color1, color2: hex strings like '#43a047', '#ff9800'
    // factor: 0.0 (color1) to 1.0 (color2)
    const c1 = color1.match(/\w\w/g).map(x => parseInt(x, 16));
    const c2 = color2.match(/\w\w/g).map(x => parseInt(x, 16));
    const result = c1.map((v, i) => Math.round(v + (c2[i] - v) * factor));
    return `#${result.map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// Map popularity (0=green, 100=orange) to color
// Map popularity object to color: orange for P1, green for P2, gray for Others
function popularityToColor(popObj) {
    const green = '#43a047';
    const orange = '#ff9800';
    const neutral = '#bdbdbd'; // gray
    if (!popObj || typeof popObj !== 'object') return '#' + neutral;
    const { p1 = 0, p2 = 0, others = 0 } = popObj;
    if (p1 >= p2 && p1 >= others) {
        // P1 most popular: if >60%, pure orange, else blend
        if (p1 >= 60) {
            return orange;
        } else {
            return interpolateColor(neutral, orange, p1 / 100);
        }
    } else if (p2 >= p1 && p2 >= others) {
        // P2 most popular: if >60%, pure green, else blend
        if (p2 >= 60) {
            return green;
        } else {
            return interpolateColor(neutral, green, p2 / 100);
        }
    } else {
        // Others most popular: neutral gray, intensity by others
        return interpolateColor('#ffffff', neutral, Math.min(1, others / 100));
    }
}

import { getPlayer1Purse, updatePlayer1PurseDisplay, setPlayer1Purse, shakePlayer1Purse, showPlayer1PurseDeduction, updateCategoryButtonBorders } from './purse.js';
import { logAction } from './logger.js';
import { smallUTsHitboxes } from './small_uts_hitboxes.js';
// On app start, load the SVG map into the map container and resize it appropriately
document.addEventListener('DOMContentLoaded', function () {
    // Recalculate projected seats every 5 seconds
    setInterval(updateProjectedSeatsCircle, 5000);

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Track whose turn, counts, and lists of states captured
    let currentPlayer = 1;
    const capturedCounts = { 1: 0, 2: 0 };
    const capturedList = { 1: [], 2: [] };
    const currentTurnDisplay = document.getElementById('current-turn');

    // --- CATEGORY BUTTONS LOGIC ---
    const categoryButtonsContainer = document.getElementById('category-buttons-container');
    let lastCategory = null;
    if (categoryButtonsContainer) {
        categoryButtonsContainer.addEventListener('click', function (e) {
            if (e.target.classList.contains('category-btn')) {
                const isActive = e.target.classList.contains('active');
                // Remove active from all category-btns (including those in all rows)
                const allBtns = categoryButtonsContainer.querySelectorAll('.category-btn');
                allBtns.forEach(btn => btn.classList.remove('active'));
                const svg = mapContainer.querySelector('svg');
                if (svg) svg.querySelectorAll('.region-highlighted').forEach(el => el.classList.remove('region-highlighted'));
                if (!isActive) {
                    // Only activate if it was not already active
                    e.target.classList.add('active');
                    const category = e.target.getAttribute('data-category');
                    lastCategory = category;
                    highlightCategoryStates(category);
                } else {
                    // If deactivating, clear lastCategory
                    lastCategory = null;
                }
            }
        });
    }

    // Helper to highlight all states for a category
    function highlightCategoryStates(category) {
        // Remove previous highlights and UT button borders
        const svg = mapContainer.querySelector('svg');
        if (!svg || !window.statesDataMap) return;
        svg.querySelectorAll('.region-highlighted').forEach(el => el.classList.remove('region-highlighted'));
        // Remove black border from all UT buttons
        if (window.utButtonMap) {
            Object.values(window.utButtonMap).forEach(btn => {
                if (btn) {
                    btn.setAttribute('stroke', 'none');
                    btn.setAttribute('stroke-width', '0');
                }
            });
        }
        // Find all SvgIds where category is TRUE or true
        const matchingIds = Object.values(window.statesDataMap)
            .filter(d => (d[category] === true) || (d[category] === 'TRUE'))
            .map(d => d.SvgId);
        // Highlight all matching regions and UT buttons
        matchingIds.forEach(id => {
            const els = svg.querySelectorAll(`[id="${id}"]`);
            els.forEach(el => el.classList.add('region-highlighted'));
            // Also highlight UT button if present
            if (window.utButtonMap) {
                // utButtonMap keys may be arrays (for merged buttons)
                Object.entries(window.utButtonMap).forEach(([key, btn]) => {
                    // key can be a string or array (for merged buttons)
                    if (Array.isArray(key)) {
                        if (key.includes(id) && btn) {
                            btn.setAttribute('stroke', 'black');
                            btn.setAttribute('stroke-width', '4');
                        }
                    } else {
                        if (key === id && btn) {
                            btn.setAttribute('stroke', 'black');
                            btn.setAttribute('stroke-width', '4');
                        }
                    }
                });
            }
        });
    }

    // Add a region name display at the bottom if not present
    let regionNameDisplay = document.getElementById('region-name-display');
    if (!regionNameDisplay) {
        regionNameDisplay = document.createElement('div');
        regionNameDisplay.id = 'region-name-display';
        regionNameDisplay.style.width = '100%';
        regionNameDisplay.style.textAlign = 'center';
        regionNameDisplay.style.padding = '8px 0 0 0';
        regionNameDisplay.style.fontWeight = 'bold';
        regionNameDisplay.style.minHeight = '24px';
        if (mapContainer && mapContainer.parentElement) {
            mapContainer.parentElement.appendChild(regionNameDisplay);
        } else {
            document.body.appendChild(regionNameDisplay);
        }
    }

    // First, load the states data
    fetch(`static/states_data.json?t=${Date.now()}`, { cache: 'no-store' })
        .then(response => response.json())
        .then(statesData => {
            // Normalize TRUE/FALSE flags to booleans for all keys
            statesData.forEach(item => {
                Object.entries(item).forEach(([k, v]) => {
                    if (v === 'TRUE') item[k] = true;
                    if (v === 'FALSE') item[k] = false;
                });
            });
            // Build a map from SvgId to data
            window.statesDataMap = {};
            statesData.forEach(item => {
                window.statesDataMap[item.SvgId] = item;
            });
            // Now load the SVG (bust cache)
            return fetch(`static/INDIA_V2.svg?t=${Date.now()}`, { cache: 'no-store' });
        })
        .then(response => response.text())
        .then(svgText => {
            mapContainer.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.innerHTML = svgText;
            const svg = wrapper.querySelector('svg');
            if (svg) {
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                svg.style.display = 'block';
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.classList.add('india-svg-map');
                mapContainer.appendChild(svg);

                // --- Inject fake hitboxes for small UTs ---
                smallUTsHitboxes.forEach(hitbox => {
                // Draw a single group rectangle and label once, before the first button
                if (hitbox.id === 'hitbox-chandigarh') {
                  const groupBoxX = -100;
                  const groupBoxY = 700;
                  const groupBoxWidth = 180;
                  const groupBoxHeight = 300;
                  let groupRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                  groupRect.setAttribute('x', groupBoxX);
                  groupRect.setAttribute('y', groupBoxY);
                  groupRect.setAttribute('width', groupBoxWidth);
                  groupRect.setAttribute('height', groupBoxHeight);
                  groupRect.setAttribute('rx', 16);
                  groupRect.setAttribute('fill', 'none');
                  groupRect.setAttribute('stroke', 'red');
                  groupRect.setAttribute('stroke-width', '3');
                  groupRect.setAttribute('pointer-events', 'none');
                  svg.appendChild(groupRect);
                  // Add group label text inside the rectangle at the top
                  let groupLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                  groupLabel.setAttribute('x', groupBoxX + groupBoxWidth / 2);
                  groupLabel.setAttribute('y', groupBoxY + 28);
                  groupLabel.setAttribute('text-anchor', 'middle');
                  groupLabel.setAttribute('font-size', '20');
                  groupLabel.setAttribute('font-family', 'sans-serif');
                  groupLabel.setAttribute('fill', 'black');
                  groupLabel.setAttribute('font-weight', 'bold');
                  groupLabel.setAttribute('pointer-events', 'none');
                  groupLabel.textContent = 'Small UTs';
                  svg.appendChild(groupLabel);
                }
                  if (svg.getElementById(hitbox.id)) return; // Avoid duplicates
                  let el = document.createElementNS('http://www.w3.org/2000/svg', hitbox.type);
                  el.setAttribute('id', hitbox.id);
                  if (hitbox.type === 'rect') {
                    el.setAttribute('x', hitbox.cx - hitbox.width / 2);
                    el.setAttribute('y', hitbox.cy - hitbox.height / 2);
                    el.setAttribute('width', hitbox.width);
                    el.setAttribute('height', hitbox.height);
                    if (hitbox.rx !== undefined) el.setAttribute('rx', hitbox.rx);
                  } else if (hitbox.type === 'ellipse') {
                    el.setAttribute('cx', hitbox.cx);
                    el.setAttribute('cy', hitbox.cy);
                    el.setAttribute('rx', hitbox.rx);
                    el.setAttribute('ry', hitbox.ry);
                  }
                  // Initially set to neutral, will update after popularityScores are ready
                  el.setAttribute('fill', '#bdbdbd');
                  el.setAttribute('style', hitbox.style);
                  el.setAttribute('stroke', 'none');
                  el.setAttribute('pointer-events', 'all');
                  el.classList.add('ut-hitbox');
                  // Make the button act like clicking the real UT region
                  // Mouseover/hover for info display
                  el.addEventListener('mouseenter', function(e) {
                    // Support merged buttons (targetId as array)
                    const ids = Array.isArray(hitbox.targetId) ? hitbox.targetId : [hitbox.targetId];
                    let infoArr = [];
                    ids.forEach(regionId => {
                      const region = svg.getElementById(regionId);
                      let data = window.statesDataMap[regionId];
                      let popObj = window.popularityScores ? window.popularityScores[regionId] : undefined;
                      if (data) {
                          let popText = 'N/A';
                          if (popObj && typeof popObj === 'object') {
                              popText = `P1: ${popObj.p1}% | P2: ${popObj.p2}% | Others: ${popObj.others}%`;
                          }
                          infoArr.push(`State: ${data.State} | Lok Sabha Seats: ${data.LokSabhaSeats} | Popularity: ${popText}`);
                      } else if (region) {
                          infoArr.push(region.getAttribute('name') || region.id);
                      }
                    });
                    if (regionNameDisplay) regionNameDisplay.textContent = infoArr.join(' || ');
                  });
                  el.addEventListener('mouseleave', function(e) {
                    if (regionNameDisplay) regionNameDisplay.textContent = '';
                  });
                  el.addEventListener('click', function(e) {
                    // Support merged buttons (targetId as array)
                    const ids = Array.isArray(hitbox.targetId) ? hitbox.targetId : [hitbox.targetId];
                    // Only proceed if all regions are valid and player can afford all
                    let totalSeats = 0;
                    for (const regionId of ids) {
                      if (!window.popularityScores || !window.popularityScores[regionId]) return;
                      totalSeats += +window.statesDataMap[regionId].LokSabhaSeats;
                    }
                    if (getPlayer1Purse() < totalSeats) {
                      shakePlayer1Purse();
                      if (typeof playSound === 'function') {
                        playSound('error.mp3');
                      } else {
                        const audio = new Audio('static/sounds/error.mp3');
                        audio.volume = 0.7;
                        audio.play();
                      }
                      return;
                    }
                    // Apply campaign logic to all regions
                    ids.forEach(regionId => {
                      let popObj = window.popularityScores[regionId];
                      let seats = +window.statesDataMap[regionId].LokSabhaSeats;
                      showRippleOnState(svg.getElementById(regionId), '#ff9800');
                      setPlayer1Purse(getPlayer1Purse() - seats);
                      updatePlayer1PurseDisplay();
                      showPlayer1PurseDeduction(seats);
                      const stateName = window.statesDataMap[regionId]?.State || regionId;
                      logAction(`<Player1> spent ₹ ${seats}M on a ${stateName} campaign`);
                      if (typeof window !== 'undefined') {
                        window.p1SpentThisPhase = (window.p1SpentThisPhase || 0) + seats;
                      }
                      let increase = 5;
                      let newP1 = Math.min(100, popObj.p1 + increase);
                      let delta = newP1 - popObj.p1;
                      if (delta <= 0) return;
                      let totalOther = popObj.p2 + popObj.others;
                      let newP2 = popObj.p2;
                      let newOthers = popObj.others;
                      if (totalOther > 0) {
                          newP2 = Math.max(0, popObj.p2 - Math.round(delta * (popObj.p2 / totalOther)));
                          newOthers = Math.max(0, 100 - newP1 - newP2);
                      } else {
                          newP2 = 0;
                          newOthers = 100 - newP1;
                      }
                      window.popularityScores[regionId] = { p1: newP1, p2: newP2, others: newOthers };
                    });
                    refreshAllStateColors();
                    if (typeof updateCategoryButtonBorders === 'function') updateCategoryButtonBorders();
                    // Show info for all regions
                    if (regionNameDisplay) {
                      let infoArr = [];
                      ids.forEach(regionId => {
                        let data = window.statesDataMap[regionId];
                        let popObj = window.popularityScores[regionId];
                        let popText = 'N/A';
                        if (popObj && typeof popObj === 'object') {
                            popText = `P1: ${popObj.p1}% | P2: ${popObj.p2}% | Others: ${popObj.others}%`;
                        }
                        infoArr.push(`State: ${data.State} | Lok Sabha Seats: ${data.LokSabhaSeats} | Popularity: ${popText}`);
                      });
                      regionNameDisplay.textContent = infoArr.join(' || ');
                    }
                  });
                  svg.appendChild(el);
                  // Add label for fake UT box if present (append after rect so label is on top)
                  if (hitbox.label) {
                    let label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', hitbox.cx);
                    label.setAttribute('y', hitbox.cy + 7); // centered in the button
                    label.setAttribute('text-anchor', 'middle');
                    label.setAttribute('font-size', '15');
                    label.setAttribute('font-family', 'sans-serif');
                    label.setAttribute('fill', 'black');
                    label.setAttribute('font-weight', 'bold');
                    label.setAttribute('pointer-events', 'none');
                    label.textContent = hitbox.label;
                    svg.appendChild(label);
                  }
                  // Store reference for later color updates
                  if (!window.utButtonMap) window.utButtonMap = {};
                  if (Array.isArray(hitbox.targetId)) {
                    hitbox.targetId.forEach(id => {
                      window.utButtonMap[id] = el;
                    });
                  } else {
                    window.utButtonMap[hitbox.targetId] = el;
                  }
                });

                // --- INITIAL LEAN ASSIGNMENT AND EVENT BINDINGS ---
                import(`./game_logic.js?t=${Date.now()}`).then(mod => {
                  // Get popularity scores for player 1
                  window.popularityScores = mod.assignInitialLeans(svg, window.statesDataMap, 100); // 100 seats each

                  // Helper: refresh all state colors based on current popularity
                  function refreshAllStateColors() {
                      Object.entries(window.popularityScores).forEach(([id, popObj]) => {
                          const region = svg.querySelector(`#${id}`);
                          if (region) {
                              region.classList.remove('lean-p1', 'lean-p2', 'lean-none');
                              region.style.fill = popularityToColor(popObj);
                          }
                          // Also update UT button color if present
                          if (window.utButtonMap && window.utButtonMap[id]) {
                              window.utButtonMap[id].setAttribute('fill', popularityToColor(popObj));
                          }
                      });
                  }

                  // Initial color
                  refreshAllStateColors();
                  // Initial projected seats circle
                  updateProjectedSeatsCircle();
                  // Get popularity scores for player 1
                  window.popularityScores = mod.assignInitialLeans(svg, window.statesDataMap, 100); // 100 seats each
                  // Color each region by popularity
                  Object.entries(window.popularityScores).forEach(([id, popObj]) => {
                    const region = svg.querySelector(`#${id}`);
                    if (region) {
                      region.style.fill = popularityToColor(popObj);
                    }
                  });

                  // Highlight logic
                  let lastHighlighted = null;
                  // Add hover and click events to all SVG elements with an id
                  // Only bind to actual state elements by checking against our data map
                  const regions = svg.querySelectorAll('[id]');
                  regions.forEach(region => {
                      if (!window.statesDataMap[region.id]) return;
                      // Hover: show state name, Lok Sabha seats, and all popularity scores
                      region.addEventListener('mouseenter', function (e) {
                          if (!window.statesDataMap) {
                              if (regionNameDisplay) regionNameDisplay.textContent = region.getAttribute('name') || region.id;
                              return;
                          }
                          let data = window.statesDataMap[region.id];
                          let popObj = window.popularityScores ? window.popularityScores[region.id] : undefined;
                          if (data) {
                              let popText = 'N/A';
                              if (popObj && typeof popObj === 'object') {
                                  popText = `P1: ${popObj.p1}% | P2: ${popObj.p2}% | Others: ${popObj.others}%`;
                              }
                              const info = [
                                  `State: ${data.State}`,
                                  `Lok Sabha Seats: ${data.LokSabhaSeats}`,
                                  `Popularity: ${popText}`
                              ].join(' | ');
                              if (regionNameDisplay) regionNameDisplay.textContent = info;
                          } else {
                              if (regionNameDisplay) regionNameDisplay.textContent = region.getAttribute('name') || region.id;
                          }
                      });
                      region.addEventListener('mouseleave', function (e) {
                          if (regionNameDisplay) regionNameDisplay.textContent = '';
                      });
                      // Click: popularity logic and highlight
                      region.addEventListener('click', function (e) {
                          // Only update if region is a state and popularityScores exists
                          if (!window.popularityScores || !window.popularityScores[region.id]) return;
                          let popObj = window.popularityScores[region.id];
                          // Purse logic: cost = number of seats
                          let seats = +window.statesDataMap[region.id].LokSabhaSeats;
                          if (getPlayer1Purse() < seats) {
                              shakePlayer1Purse();
                              // Play error sound if not enough cash
                              if (typeof playSound === 'function') {
                                  playSound('error.mp3');
                              } else {
                                  // fallback if playSound not in scope
                                  const audio = new Audio('static/sounds/error.mp3');
                                  audio.volume = 0.7;
                                  audio.play();
                              }
                              return;
                          }
                          // Show ripple for Player 1 (orange)
                          showRippleOnState(region, '#ff9800');
                          setPlayer1Purse(getPlayer1Purse() - seats);
                          updatePlayer1PurseDisplay();
                          showPlayer1PurseDeduction(seats);
                          // Log Player 1 spending on state campaign
                          const stateName = window.statesDataMap[region.id]?.State || region.id;
                          logAction(`<Player1> spent ₹ ${seats}M on a ${stateName} campaign`);
                          // Track funds spent for Player 1
                          if (typeof window !== 'undefined') {
                            window.p1SpentThisPhase = (window.p1SpentThisPhase || 0) + seats;
                          }
                          // Increase P1 popularity by 5%, max 100
                          let increase = 5;
                          let newP1 = Math.min(100, popObj.p1 + increase);
                          let delta = newP1 - popObj.p1;
                          if (delta <= 0) return; // Already at max
                          // Decrease P2 and Others proportionally
                          let totalOther = popObj.p2 + popObj.others;
                          let newP2 = popObj.p2;
                          let newOthers = popObj.others;
                          if (totalOther > 0) {
                              newP2 = Math.max(0, popObj.p2 - Math.round(delta * (popObj.p2 / totalOther)));
                              newOthers = Math.max(0, 100 - newP1 - newP2);
                          } else {
                              newP2 = 0;
                              newOthers = 100 - newP1;
                          }
                          // Update the popularity object
                          window.popularityScores[region.id] = { p1: newP1, p2: newP2, others: newOthers };
                          // Refresh all state colors based on current popularity
                          refreshAllStateColors();
                          // Update category button borders for bonus
                          if (typeof updateCategoryButtonBorders === 'function') updateCategoryButtonBorders();

                          // Always update hover label for this region (instant feedback)
                          if (regionNameDisplay) {
                              let data = window.statesDataMap[region.id];
                              let popObj = window.popularityScores[region.id];
                              let popText = 'N/A';
                              if (popObj && typeof popObj === 'object') {
                                  popText = `P1: ${popObj.p1}% | P2: ${popObj.p2}% | Others: ${popObj.others}%`;
                              }
                              const info = [
                                  `State: ${data.State}`,
                                  `Lok Sabha Seats: ${data.LokSabhaSeats}`,
                                  `Popularity: ${popText}`
                              ].join(' | ');
                              regionNameDisplay.textContent = info;
                          }

                          // If a category is active, ignore single highlight
                          if (categoryButtonsContainer && categoryButtonsContainer.querySelector('.active')) return;
                          if (lastHighlighted) {
                              lastHighlighted.classList.remove('region-highlighted');
                          }
                          region.classList.add('region-highlighted');
                          lastHighlighted = region;
                      });
                      // Optional: pointer cursor
                      region.style.cursor = 'pointer';
                  });
                }).catch(() => {});

                // Add hover and click events to Lakshadweep bounding box
                const lakshadweepBox = svg.querySelector('#bbox-lakshadweep');
                if (lakshadweepBox) {
                    // Hover: show info for Lakshadweep in the same format as other states
                    lakshadweepBox.addEventListener('mouseenter', function (e) {
                        if (!window.statesDataMap || !window.popularityScores) {
                            if (regionNameDisplay) regionNameDisplay.textContent = 'Lakshadweep';
                            return;
                        }
                        const data = window.statesDataMap['INLD'];
                        const popObj = window.popularityScores['INLD'];
                        let popText = 'N/A';
                        if (popObj && typeof popObj === 'object') {
                            popText = `P1: ${popObj.p1}% | P2: ${popObj.p2}% | Others: ${popObj.others}%`;
                        }
                        const info = [
                            `State: ${data.State}`,
                            `Lok Sabha Seats: ${data.LokSabhaSeats}`,
                            `Popularity: ${popText}`
                        ].join(' | ');
                        if (regionNameDisplay) regionNameDisplay.textContent = info;
                    });
                    lakshadweepBox.addEventListener('mouseleave', function (e) {
                        if (regionNameDisplay) regionNameDisplay.textContent = '';
                    });
                    // Click: same as other states
                    lakshadweepBox.addEventListener('click', function (e) {
                        // Only update if popularityScores exists for Lakshadweep
                        if (!window.popularityScores || !window.popularityScores['INLD']) return;
                        const popObj = window.popularityScores['INLD'];
                        // Purse logic: cost = number of seats
                        const seats = +window.statesDataMap['INLD'].LokSabhaSeats;
                        if (getPlayer1Purse() < seats) {
                            shakePlayer1Purse();
                            // Play error sound if not enough cash
                            if (typeof playSound === 'function') {
                                playSound('error.mp3');
                            } else {
                                const audio = new Audio('static/sounds/error.mp3');
                                audio.volume = 0.7;
                                audio.play();
                            }
                            return;
                        }
                        // Show ripple for Player 1 (orange)
                        showRippleOnState(lakshadweepBox, '#ff9800');
                        setPlayer1Purse(getPlayer1Purse() - seats);
                        updatePlayer1PurseDisplay();
                        showPlayer1PurseDeduction(seats);
                        // Log Player 1 spending on state campaign
                        const stateName = window.statesDataMap['INLD']?.State || 'Lakshadweep';
                        logAction(`<Player1> spent ₹ ${seats}M on a ${stateName} campaign`);
                        // Track funds spent for Player 1
                        if (typeof window !== 'undefined') {
                            window.p1SpentThisPhase = (window.p1SpentThisPhase || 0) + seats;
                        }
                        // Increase P1 popularity by 5%, max 100
                        let increase = 5;
                        let newP1 = Math.min(100, popObj.p1 + increase);
                        let delta = newP1 - popObj.p1;
                        if (delta <= 0) return; // Already at max
                        // Decrease P2 and Others proportionally
                        let totalOther = popObj.p2 + popObj.others;
                        let newP2 = popObj.p2;
                        let newOthers = popObj.others;
                        if (totalOther > 0) {
                            newP2 = Math.max(0, popObj.p2 - Math.round(delta * (popObj.p2 / totalOther)));
                            newOthers = Math.max(0, 100 - newP1 - newP2);
                        } else {
                            newP2 = 0;
                            newOthers = 100 - newP1;
                        }
                        // Update the popularity object
                        window.popularityScores['INLD'] = { p1: newP1, p2: newP2, others: newOthers };
                        // Refresh all state colors based on current popularity
                        refreshAllStateColors();
                        // Update category button borders for bonus
                        if (typeof updateCategoryButtonBorders === 'function') updateCategoryButtonBorders();
                        // Always update hover label for this region (instant feedback)
                        if (regionNameDisplay) {
                            const data = window.statesDataMap['INLD'];
                            const popObj = window.popularityScores['INLD'];
                            let popText = 'N/A';
                            if (popObj && typeof popObj === 'object') {
                                popText = `P1: ${popObj.p1}% | P2: ${popObj.p2}% | Others: ${popObj.others}%`;
                            }
                            const info = [
                                `State: ${data.State}`,
                                `Lok Sabha Seats: ${data.LokSabhaSeats}`,
                                `Popularity: ${popText}`
                            ].join(' | ');
                            regionNameDisplay.textContent = info;
                        }
                        // If a category is active, ignore single highlight
                        if (categoryButtonsContainer && categoryButtonsContainer.querySelector('.active')) return;
                        if (lastHighlighted) {
                            lastHighlighted.classList.remove('region-highlighted');
                        }
                        lakshadweepBox.classList.add('region-highlighted');
                        lastHighlighted = lakshadweepBox;
                    });
                    lakshadweepBox.style.cursor = 'pointer';
                }

                // Add hover/click to fake hitboxes for small UTs
                smallUTsHitboxes.forEach(hitbox => {
                  const el = svg.getElementById(hitbox.id);
                  const target = svg.getElementById(hitbox.targetId);
                  if (!el || !target) return;
                  // Hover: show info for the real region
                  el.addEventListener('mouseenter', function (e) {
                    if (!window.statesDataMap) {
                      if (regionNameDisplay) regionNameDisplay.textContent = target.getAttribute('name') || target.id;
                      return;
                    }
                    let data = window.statesDataMap[target.id];
                    let popObj = window.popularityScores ? window.popularityScores[target.id] : undefined;
                    if (data) {
                      let popText = 'N/A';
                      if (popObj && typeof popObj === 'object') {
                        popText = `P1: ${popObj.p1}% | P2: ${popObj.p2}% | Others: ${popObj.others}%`;
                      }
                      const info = [
                        `State: ${data.State}`,
                        `Lok Sabha Seats: ${data.LokSabhaSeats}`,
                        `Popularity: ${popText}`
                      ].join(' | ');
                      if (regionNameDisplay) regionNameDisplay.textContent = info;
                    } else {
                      if (regionNameDisplay) regionNameDisplay.textContent = target.getAttribute('name') || target.id;
                    }
                  });
                  el.addEventListener('mouseleave', function (e) {
                    if (regionNameDisplay) regionNameDisplay.textContent = '';
                  });
                  // Click: trigger the same logic as the real region
                  el.addEventListener('click', function (e) {
                    if (!window.popularityScores || !window.popularityScores[target.id]) return;
                    let popObj = window.popularityScores[target.id];
                    let seats = +window.statesDataMap[target.id].LokSabhaSeats;
                    if (getPlayer1Purse() < seats) {
                      shakePlayer1Purse();
                      if (typeof playSound === 'function') {
                        playSound('error.mp3');
                      } else {
                        const audio = new Audio('static/sounds/error.mp3');
                        audio.volume = 0.7;
                        audio.play();
                      }
                      return;
                    }
                    showRippleOnState(target, '#ff9800');
                    setPlayer1Purse(getPlayer1Purse() - seats);
                    updatePlayer1PurseDisplay();
                    showPlayer1PurseDeduction(seats);
                    const stateName = window.statesDataMap[target.id]?.State || target.id;
                    logAction(`<Player1> spent ₹ ${seats}M on a ${stateName} campaign`);
                    if (typeof window !== 'undefined') {
                      window.p1SpentThisPhase = (window.p1SpentThisPhase || 0) + seats;
                    }
                    let increase = 5;
                    let newP1 = Math.min(100, popObj.p1 + increase);
                    let delta = newP1 - popObj.p1;
                    if (delta <= 0) return;
                    let totalOther = popObj.p2 + popObj.others;
                    let newP2 = popObj.p2;
                    let newOthers = popObj.others;
                    if (totalOther > 0) {
                      newP2 = Math.max(0, popObj.p2 - Math.round(delta * (popObj.p2 / totalOther)));
                      newOthers = Math.max(0, 100 - newP1 - newP2);
                    } else {
                      newP2 = 0;
                      newOthers = 100 - newP1;
                    }
                    window.popularityScores[target.id] = { p1: newP1, p2: newP2, others: newOthers };
                    refreshAllStateColors();
                    // Update category button borders for bonus
                    if (typeof updateCategoryButtonBorders === 'function') updateCategoryButtonBorders();
                    if (regionNameDisplay) {
                      let data = window.statesDataMap[target.id];
                      let popObj = window.popularityScores[target.id];
                      let popText = 'N/A';
                      if (popObj && typeof popObj === 'object') {
                        popText = `P1: ${popObj.p1}% | P2: ${popObj.p2}% | Others: ${popObj.others}%`;
                      }
                      const info = [
                        `State: ${data.State}`,
                        `Lok Sabha Seats: ${data.LokSabhaSeats}`,
                        `Popularity: ${popText}`
                      ].join(' | ');
                      regionNameDisplay.textContent = info;
                    }
                    if (categoryButtonsContainer && categoryButtonsContainer.querySelector('.active')) return;
                    if (lastHighlighted) {
                      lastHighlighted.classList.remove('region-highlighted');
                    }
                    el.classList.add('region-highlighted');
                    lastHighlighted = el;
                  });
                  el.style.cursor = 'pointer';
                });
            }
        })
        .catch(err => {
            mapContainer.innerHTML = '<p style="color:red">Failed to load map.</p>';
        });
});

