// On app start, load the SVG map into the map container and resize it appropriately
document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

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
    fetch('static/states_data.json')
        .then(response => response.json())
        .then(statesData => {
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

                // Add hover and click events to all regions (paths with id and name)
                const regions = svg.querySelectorAll('path[id][name]');
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
                                `UT: ${data.UnionTerritory === 'TRUE' ? 'T' : 'F'}`,
                                `CI: ${data.CoastalIndia === 'TRUE' ? 'T' : 'F'}`,
                                `NE: ${data.NortheastIndia === 'TRUE' ? 'T' : 'F'}`,
                                `SI: ${data.SouthIndia === 'TRUE' ? 'T' : 'F'}`,
                                `HH: ${data.HindiHeartland === 'TRUE' ? 'T' : 'F'}`,
                                `AR: ${data.AgriculturalRegion === 'TRUE' ? 'T' : 'F'}`,
                                `BL: ${data.BorderLands === 'TRUE' ? 'T' : 'F'}`,
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
                                `UT: ${data.UnionTerritory === 'TRUE' ? 'T' : 'F'}`,
                                `CI: ${data.CoastalIndia === 'TRUE' ? 'T' : 'F'}`,
                                `NE: ${data.NortheastIndia === 'TRUE' ? 'T' : 'F'}`,
                                `SI: ${data.SouthIndia === 'TRUE' ? 'T' : 'F'}`,
                                `HH: ${data.HindiHeartland === 'TRUE' ? 'T' : 'F'}`,
                                `AR: ${data.AgriculturalRegion === 'TRUE' ? 'T' : 'F'}`,
                                `BL: ${data.BorderLands === 'TRUE' ? 'T' : 'F'}`,
                                `LS: ${data.LokSabhaSeats}`
                            ].join('; ');
                        }
                        regionNameDisplay.textContent = info;
                    });
                    lakshadweepBox.addEventListener('mouseleave', function (e) {
                        regionNameDisplay.textContent = '';
                    });
                    lakshadweepBox.addEventListener('click', function (e) {
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