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

    fetch('static/INDIA_V2.svg')
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
                    // Hover: show name
                    region.addEventListener('mouseenter', function (e) {
                        regionNameDisplay.textContent = region.getAttribute('name') || region.id;
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
                        regionNameDisplay.textContent = 'Lakshadweep';
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