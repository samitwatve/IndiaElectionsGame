// ---------------------
// Campaign “tech tree”
// ---------------------
// ----------------------------
// 5×4 Campaign Tech‑Tree (20)
// ----------------------------
// ----------------------------
// 6×4 Campaign Tech-Tree (24)
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
  'Justice & Inclusion': [
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

  /* 4 ── Economic Policy */
  'Economic Policy': [
    'MGNREGA Expansion',
    'GST',
    'Digital India',
    'Industry & Mining'
  ],

  /* 5 ── Agriculture & Environment */
  'Agriculture & Environment': [
    'Farm Loan Waivers',
    'River-Linking Projects',
    'GMOs',
    'Farm Bills'
  ],

  /* 6 ── Public Health & Welfare  ← new card */
  'Public Health & Welfare': [
    'Swachh Bharat Mission',
    'Ayushman Bharat',
    'P M Jan-Dhan Yojana',
    'Beti Bachao Beti Padhao'
  ]
};


// Render the tech tree as five rows (one per branch)
import { getPlayer1Purse, setPlayer1Purse, updatePlayer1PurseDisplay, shakePlayer1Purse, showPlayer1PurseDeduction } from './purse.js';
import { logAction } from './logger.js';

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

        // Completion bar with race mechanic
        const barContainer = document.createElement('div');
        barContainer.className = 'tech-tree-leaf health-bar';
        barContainer.setAttribute('data-leaf', leaf);

        const barFill = document.createElement('div');
        barFill.className = 'health-bar-fill';
        barFill.style.width = '0%';
        barContainer.appendChild(barFill);

        // Helper to get progress for both players
        function getProgress(leaf) {
          const p1 = (window.p1PromiseProgress && window.p1PromiseProgress[leaf]) || 0;
          const p2 = (window.p2PromiseProgress && window.p2PromiseProgress[leaf]) || 0;
          return { p1, p2 };
        }

        // Helper to update the bar UI based on both players' progress
        function updateBarUI() {
          const { p1, p2 } = getProgress(leaf);
          let progress = Math.max(p1, p2) * 10;
          barContainer.setAttribute('data-progress', progress);
          barFill.style.width = progress + '%';
          // Determine leader and set color
          let color = '#b0bec5'; // neutral
          if (p1 > p2) color = '#ff9800'; // Player 1 (orange)
          else if (p2 > p1) color = '#43a047'; // Player 2 (green)
          else if (p1 === p2 && p1 > 0) color = '#757575'; // tie, but not zero
          // Completed: color of the winner
          if (p1 === 10 && p1 > p2) color = '#ff9800'; // Player 1 completed (orange)
          if (p2 === 10 && p2 > p1) color = '#43a047'; // Player 2 completed (green)
          barFill.style.background = color;
        }

        // Track if bonus has been awarded for each player for each promise
        if (!window.p1PromiseBonusAwarded) window.p1PromiseBonusAwarded = {};
        if (!window.p2PromiseBonusAwarded) window.p2PromiseBonusAwarded = {};

        // Click to increase fill for Player 1 (10M per click)
        barContainer.addEventListener('click', function() {
          const { p1, p2 } = getProgress(leaf);
          if (p1 < 10 && (p1 <= p2 || p2 < 10)) { // Only allow if not already maxed
            let purse = getPlayer1Purse();
            if (purse >= 10) {
              purse -= 10;
              setPlayer1Purse(purse);
              updatePlayer1PurseDisplay();
              showPlayer1PurseDeduction(10);
              // Update Player 1 progress
              if (!window.p1PromiseProgress) window.p1PromiseProgress = {};
              window.p1PromiseProgress[leaf] = (window.p1PromiseProgress[leaf] || 0) + 1;
              if (window.p1PromiseProgress[leaf] > 10) window.p1PromiseProgress[leaf] = 10;
              // Track funds spent
              window.p1SpentThisPhase = (window.p1SpentThisPhase || 0) + 10;
              // Log the action
              logAction(`<Player1> spent ₹ 10M on ${leaf}`);
              updateBarUI();
              // Award bonus if just completed (and not already awarded)
              if (window.p1PromiseProgress[leaf] === 10 && !window.p1PromiseBonusAwarded[leaf]) {
                window.p1PromiseBonusAwarded[leaf] = true;
                let bonus = 15;
                setPlayer1Purse(getPlayer1Purse() + bonus);
                updatePlayer1PurseDisplay();
                import('./purse.js').then(({ showPlayer1PurseAddition, playSound }) => {
                  showPlayer1PurseAddition(bonus);
                  playSound('cash_added.mp3');
                });
                logAction(`<Player1> COMPLETED campaign promise '${leaf}' and received ₹ +${bonus}M bonus!`);
              }
              if (window.p1PromiseProgress[leaf] === 10 && window.p1PromiseProgress[leaf] > ((window.p2PromiseProgress && window.p2PromiseProgress[leaf]) || 0)) {
                barContainer.classList.add('shake');
                setTimeout(() => barContainer.classList.remove('shake'), 400);
              }
            } else {
              // Not enough money, show a warning (shake)
              barContainer.classList.add('shake');
              shakePlayer1Purse();
              import('./purse.js').then(({ playSound }) => playSound('error.mp3'));
              setTimeout(() => barContainer.classList.remove('shake'), 400);
            }
          } else {
            // Already full, shake to indicate no more allowed
            barContainer.classList.add('shake');
            setTimeout(() => barContainer.classList.remove('shake'), 400);
          }
        });


        // Listen for AI/Player 2 progress updates (polling or event-based)
        // Also, check for Player 2 bonus award
        setInterval(() => {
          updateBarUI();
          // Award Player 2 bonus if just completed (and not already awarded)
          if (window.p2PromiseProgress && window.p2PromiseProgress[leaf] === 10 && !window.p2PromiseBonusAwarded[leaf]) {
            window.p2PromiseBonusAwarded[leaf] = true;
            // Give Player 2 the bonus
            import('./purse.js').then(({ getPlayer2Purse, setPlayer2Purse, logAction }) => {
              let bonus = 22.5;
              setPlayer2Purse(getPlayer2Purse() + bonus);
              logAction(`<Player2> COMPLETED campaign promise '${leaf}' and received ₹ +${bonus}M bonus!`);
            });
          }
        }, 500);
        // Initial render
        updateBarUI();

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
