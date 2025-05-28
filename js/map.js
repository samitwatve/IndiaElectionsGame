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
function popularityToColor(score) {
    // Green: #43a047, Orange: #ff9800
    const green = '43a047';
    const orange = 'ff9800';
    // Clamp score
    const s = Math.max(0, Math.min(100, score));
    return interpolateColor(green, orange, s / 100);
}

import { getPlayer1Purse, updatePlayer1PurseDisplay, setPlayer1Purse } from './purse.js';
// On app start, load the SVG map into the map container and resize it appropriately
document.addEventListener('DOMContentLoaded', function () {

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
                // Remove active from all category-btns (including those in all rows)
                const allBtns = categoryButtonsContainer.querySelectorAll('.category-btn');
                allBtns.forEach(btn => btn.classList.remove('active'));
                // Toggle active only for the clicked button
                e.target.classList.add('active');
                const category = e.target.getAttribute('data-category');
                lastCategory = category;
                highlightCategoryStates(category);
            }
        });
    }

    // Helper to highlight all states for a category
    function highlightCategoryStates(category) {
        // Remove previous highlights
        const svg = mapContainer.querySelector('svg');
        if (!svg || !window.statesDataMap) return;
        svg.querySelectorAll('.region-highlighted').forEach(el => el.classList.remove('region-highlighted'));
        // Find all SvgIds where category is TRUE or true
        const matchingIds = Object.values(window.statesDataMap)
            .filter(d => (d[category] === true) || (d[category] === 'TRUE'))
            .map(d => d.SvgId);
        // Highlight all matching regions
        matchingIds.forEach(id => {
            const els = svg.querySelectorAll(`[id="${id}"]`);
            els.forEach(el => el.classList.add('region-highlighted'));
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

                // --- INITIAL LEAN ASSIGNMENT ---
                import(`./game_logic.js?t=${Date.now()}`).then(mod => {
                  // Get popularity scores for player 1
                  window.popularityScores = mod.assignInitialLeans(svg, window.statesDataMap, 100); // 100 seats each
                  // Color each region by popularity
                  Object.entries(window.popularityScores).forEach(([id, score]) => {
                    const region = svg.querySelector(`#${id}`);
                    if (region) {
                      region.style.fill = popularityToColor(score);
                    }
                  });
                }).catch(() => {});

                // Highlight logic
                let lastHighlighted = null;

                // Add hover and click events to all SVG elements with an id
                // Only bind to actual state elements by checking against our data map
                const regions = svg.querySelectorAll('[id]');
                regions.forEach(region => {
                    if (!window.statesDataMap[region.id]) return;
                    // Hover: show state name, Lok Sabha seats, and popularity score
                    region.addEventListener('mouseenter', function (e) {
                        if (!window.statesDataMap) {
                            if (regionNameDisplay) regionNameDisplay.textContent = region.getAttribute('name') || region.id;
                            return;
                        }
                        let data = window.statesDataMap[region.id];
                        let popScore = window.popularityScores ? window.popularityScores[region.id] : undefined;
                        if (data) {
                            const info = [
                                `State: ${data.State}`,
                                `Lok Sabha Seats: ${data.LokSabhaSeats}`,
                                `Popularity: ${popScore !== undefined ? popScore : 'N/A'}`
                            ].join(' | ');
                            if (regionNameDisplay) regionNameDisplay.textContent = info;
                        } else {
                            if (regionNameDisplay) regionNameDisplay.textContent = region.getAttribute('name') || region.id;
                        }
                    });
                    region.addEventListener('mouseleave', function (e) {
                        if (regionNameDisplay) regionNameDisplay.textContent = '';
                    });
                    // Click: capture logic and highlight
                    region.addEventListener('click', function (e) {
                        // capture logic: only if not already captured and is a state
                        if (!region.classList.contains('captured-p1') &&
                            !region.classList.contains('captured-p2')) {
                            let seats = +window.statesDataMap[region.id].LokSabhaSeats;
                            let isMinorUT = false;
                            // Special handling for Lakshadweep: also deduct for Daman & Diu and Dadra & Nagar Haveli
                            if (window.statesDataMap[region.id].State === 'Lakshadweep') {
                                const minorUTs = ['Lakshadweep', 'Daman And Diu', 'Dadra And Nagar Haveli'];
                                seats = minorUTs.reduce((sum, ut) => {
                                    const utEntry = Object.values(window.statesDataMap).find(d => d.State === ut);
                                    return sum + (utEntry ? +utEntry.LokSabhaSeats : 0);
                                }, 0);
                                isMinorUT = true;
                            }
                            // Only Player 1's purse is affected
                            if (currentPlayer === 1) {
                                if (getPlayer1Purse() >= seats) {
                                    setPlayer1Purse(getPlayer1Purse() - seats);
                                    updatePlayer1PurseDisplay();
                                } else {
                                    alert('Not enough funds!');
                                    return;
                                }
                            }
                            // Mark all minor UTs as captured if Lakshadweep is clicked
                            if (isMinorUT) {
                                const minorUTs = ['Lakshadweep', 'Daman And Diu', 'Dadra And Nagar Haveli'];
                                minorUTs.forEach(ut => {
                                    const utEntry = Object.values(window.statesDataMap).find(d => d.State === ut);
                                    if (utEntry) {
                                        const utRegion = svg.querySelector(`[id="${utEntry.SvgId}"]`);
                                        if (utRegion && !utRegion.classList.contains('captured-p1') && !utRegion.classList.contains('captured-p2')) {
                                            utRegion.classList.add(`captured-p${currentPlayer}`);
                                            capturedCounts[currentPlayer] += +utEntry.LokSabhaSeats;
                                            capturedList[currentPlayer].push(utEntry.State);
                                        }
                                    }
                                });
                            } else {
                                region.classList.add(`captured-p${currentPlayer}`);
                                capturedCounts[currentPlayer] += seats;
                                capturedList[currentPlayer].push(window.statesDataMap[region.id].State);
                            }

                            // Update both info panels and highlight active
                            ['1','2'].forEach(p => {
                              const box = document.getElementById(`player${p}-info`);
                              box.textContent = `Seats: ${capturedCounts[p]}; States: ${capturedList[p].join(', ')}`;
                              box.classList.toggle('active', +p === currentPlayer);
                            });

                            // Check for win
                            if (capturedCounts[currentPlayer] >= 272) {
                              alert(`Player ${currentPlayer} wins with ${capturedCounts[currentPlayer]} seats!`);
                              return;
                            }

                            // Switch turn
                            currentPlayer = currentPlayer === 1 ? 2 : 1;

                            // Update turn display
                            if(currentTurnDisplay) currentTurnDisplay.textContent = `Current Turn: Player ${currentPlayer}`;
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

                // Add hover and click events to Lakshadweep bounding box
                const lakshadweepBox = svg.querySelector('#bbox-lakshadweep');
                if (lakshadweepBox) {
                    lakshadweepBox.addEventListener('mouseenter', function (e) {
                        // Try to show Lakshadweep info
                        let info = 'Lakshadweep';
                        if (window.statesDataMap && window.statesDataMap['INLD']) {
                            const data = window.statesDataMap['INLD'];
                            info = [
                                `State: ${data.State}`,
                                `UT: ${data.UnionTerritory ? 'T' : 'F'}`,
                                `CI: ${data.CoastalIndia ? 'T' : 'F'}`,
                                `NE: ${data.NortheastIndia ? 'T' : 'F'}`,
                                `SI: ${data.SouthIndia ? 'T' : 'F'}`,
                                `HH: ${data.HindiHeartland ? 'T' : 'F'}`,
                                `AR: ${data.AgriculturalRegion ? 'T' : 'F'}`,
                                `BL: ${data.BorderLands ? 'T' : 'F'}`,
                                `LS: ${data.LokSabhaSeats}`
                            ].join('; ');
                        }
                        if (regionNameDisplay) regionNameDisplay.textContent = info;
                    });
                    lakshadweepBox.addEventListener('mouseleave', function (e) {
                        if (regionNameDisplay) regionNameDisplay.textContent = '';
                    });
                    lakshadweepBox.addEventListener('click', function (e) {
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
            }
        })
        .catch(err => {
            mapContainer.innerHTML = '<p style="color:red">Failed to load map.</p>';
        });
});

