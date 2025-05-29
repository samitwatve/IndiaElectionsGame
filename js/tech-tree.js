// ---------------------
// Campaign “tech tree”
// ---------------------
// ----------------------------
// 5×4 Campaign Tech‑Tree (20)
// ----------------------------
export const policyTree = {
  /* 1 ── Social & Cultural Identity */
'Social Policy': [
  'Hindutva',
  'Uniform Civil Code',
  'Hindi Education Mandate',
  'Secularism'
],

/* 2 ── Social Justice & Inclusion */
'Social Justice & Inclusion': [
  'Mandal Commission',
  'Women’s Reservation',
  'Tribal Rights',
  'Waqf Board Reforms'
],

/* 3 ── Infrastructure & Development */
  'Infrastructure': [
    'Highways & Airports',
    'Ports Modernisation',
    'Smart Cities',
    'Defense & Border Infra'
  ],

  /* 4 ── Economic & Fiscal Reform */
  'Economic & Fiscal Reform': [
    'MGNREGA Expansion',
    'GST',
    'Digital India & E-Governance',
    'Industrial & Mining Corridors'
  ],

  /* 5 ── Agriculture & Environment */
  'Agriculture & Environment': [
    'Farm Loan Waivers',
    'River‑Linking Projects',
    'GMOs',
    'Farm Bills'
  ]
};


// Render the tech tree as five rows (one per branch)
import { getPlayer1Purse, setPlayer1Purse, updatePlayer1PurseDisplay, shakePlayer1Purse, showPlayer1PurseDeduction } from './purse.js';

function renderTechTreeRows(tree, container) {
  Object.entries(tree).forEach(([branch, leaves]) => {
    // Section wrapper for each branch
    const section = document.createElement('div');
    section.className = 'tech-tree-section';

    // Section header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'tech-tree-section-header';
    sectionHeader.textContent = branch;
    section.appendChild(sectionHeader);

    // Cards grid for this branch
    const cardGrid = document.createElement('div');
    cardGrid.className = 'tech-tree-card-grid';
    for (let i = 0; i < 2; i++) {
      const row = document.createElement('div');
      row.className = 'tech-tree-card-row';
      for (let j = 0; j < 2; j++) {
        const idx = i * 2 + j;
        if (idx >= leaves.length) break;
        const leaf = leaves[idx];
        const cell = document.createElement('div');
        cell.className = 'tech-tree-leaf-cell';

        // Text label for campaign promise (OUTSIDE the bar)
        const barLabel = document.createElement('div');
        barLabel.className = 'health-bar-label';
        barLabel.textContent = leaf;
        cell.appendChild(barLabel);

        // Completion bar
        const barContainer = document.createElement('div');
        barContainer.className = 'tech-tree-leaf health-bar';
        barContainer.setAttribute('data-progress', '0');

        const barFill = document.createElement('div');
        barFill.className = 'health-bar-fill';
        barFill.style.width = '0%';
        barContainer.appendChild(barFill);

        // Click to increase fill (10 clicks to full, 10M rupees per click, free after full)
        barContainer.addEventListener('click', function() {
          let progress = parseInt(barContainer.getAttribute('data-progress'));
          if (progress < 100) {
            // Check purse
            let purse = getPlayer1Purse();
            if (purse >= 10) {
              purse -= 10;
              setPlayer1Purse(purse);
              updatePlayer1PurseDisplay();
              showPlayer1PurseDeduction(10);
              progress += 10;
              if (progress > 100) progress = 100;
              barContainer.setAttribute('data-progress', progress);
              barFill.style.width = progress + '%';
              // Color transition
              if (progress < 50) {
                barFill.style.background = '#b0bec5';
              } else if (progress < 100) {
                barFill.style.background = '#64b5f6';
              } else {
                barFill.style.background = '#43a047';
              }
              if (progress === 100) {
                // Shake the promise bar to indicate it's maxed out
                barContainer.classList.add('shake');
                setTimeout(() => barContainer.classList.remove('shake'), 400);
              }
            } else {
              // Not enough money, show a warning (shake)
              barContainer.classList.add('shake');
              shakePlayer1Purse();
              setTimeout(() => barContainer.classList.remove('shake'), 400);
            }
          } else {
            // Already full, shake to indicate no more allowed
            barContainer.classList.add('shake');
            setTimeout(() => barContainer.classList.remove('shake'), 400);
          }
        });

        cell.appendChild(barContainer);
        row.appendChild(cell);
      }
      cardGrid.appendChild(row);
    }
    section.appendChild(cardGrid);
    container.appendChild(section);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const techTreeRows = document.getElementById('tech-tree-rows');
  console.log('[tech-tree.js] DOMContentLoaded. techTreeRows:', techTreeRows);
  if (techTreeRows) {
    renderTechTreeRows(policyTree, techTreeRows);
    console.log('[tech-tree.js] renderTechTreeRows called.');
  } else {
    console.warn('[tech-tree.js] techTreeRows element not found!');
  }
});
