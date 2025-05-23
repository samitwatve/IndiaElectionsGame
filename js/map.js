// On app start, load the SVG map into the map container and resize it appropriately
document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // --- CATEGORY BUTTONS LOGIC ---
    const categoryButtonsContainer = document.getElementById('category-buttons-container');
    let lastCategory = null;
    if (categoryButtonsContainer) {
        categoryButtonsContainer.addEventListener('click', function (e) {
            if (e.target.classList.contains('category-btn')) {
                const category = e.target.getAttribute('data-category');
                // Remove active from all
                Array.from(categoryButtonsContainer.children).forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                lastCategory = category;
                highlightCategoryStates(category);
            }
        });
    }

    // Helper to highlight all states for a category
    function highlightCategoryStates(category) {
        // Ensure a debug output container exists
        let debugEl = document.getElementById('debug-output');
        if (!debugEl) {
            debugEl = document.createElement('pre');
            debugEl.id = 'debug-output';
            debugEl.style.position = 'absolute';
            debugEl.style.bottom = '0';
            debugEl.style.left = '0';
            debugEl.style.width = '100%';
            debugEl.style.maxHeight = '150px';
            debugEl.style.overflow = 'auto';
            debugEl.style.background = 'rgba(0,0,0,0.7)';
            debugEl.style.color = '#fff';
            debugEl.style.fontSize = '12px';
            debugEl.style.padding = '8px';
            mapContainer.appendChild(debugEl);
        }
        // Helper to append messages
        const log = msg => { debugEl.textContent += msg + '\n'; };
        // Remove previous highlights
        const svg = mapContainer.querySelector('svg');
        if (!svg || !window.statesDataMap) return;
        svg.querySelectorAll('.region-highlighted').forEach(el => el.classList.remove('region-highlighted'));
        // Find all SvgIds where category is TRUE or true
        const matchingIds = Object.values(window.statesDataMap)
            .filter(d => (d[category] === true) || (d[category] === 'TRUE'))
            .map(d => d.SvgId);
        debugEl.textContent = `Category: ${category}\n`;
        log(`Matching IDs: ${matchingIds.join(', ')}`);
        // Highlight all matching regions
        matchingIds.forEach(id => {
            const els = svg.querySelectorAll(`[id="${id}"]`);
            log(`Elements for ${id}: ${els.length}`);
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
        mapContainer.parentElement.appendChild(regionNameDisplay);
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
            // Now load the SVG
            return fetch('static/INDIA_V2.svg');
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

                // Highlight logic
                let lastHighlighted = null;

                // Add hover and click events to all SVG elements with an id
                const regions = svg.querySelectorAll('[id]');
                regions.forEach(region => {
                    // Hover: show all info from states_data.json
                    region.addEventListener('mouseenter', function (e) {
                        if (!window.statesDataMap) {
                            regionNameDisplay.textContent = region.getAttribute('name') || region.id;
                            return;
                        }
                        // Try to match by id, then by name (case-insensitive, ignoring spaces)
                        let data = window.statesDataMap[region.id];
                        if (!data) {
                            // Try to match by name (normalize both)
                            const regionName = (region.getAttribute('name') || '').replace(/\s+/g, '').toLowerCase();
                            data = Object.values(window.statesDataMap).find(d => d.State.replace(/\s+/g, '').toLowerCase() === regionName);
                        }
                        if (data) {
                            const info = [
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
                            regionNameDisplay.textContent = info;
                        } else {
                            regionNameDisplay.textContent = region.getAttribute('name') || region.id;
                        }
                    });
                    region.addEventListener('mouseleave', function (e) {
                        regionNameDisplay.textContent = '';
                    });
                    // Click: highlight
                    region.addEventListener('click', function (e) {
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
                        regionNameDisplay.textContent = info;
                    });
                    lakshadweepBox.addEventListener('mouseleave', function (e) {
                        regionNameDisplay.textContent = '';
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