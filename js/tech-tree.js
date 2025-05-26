// ---------------------
// Campaign “tech tree”
// ---------------------
// ----------------------------
// 5×4 Campaign Tech‑Tree (20)
// ----------------------------
export const policyTree = {
  /* 1 ── Social & Cultural Identity */
'Social & Cultural Identity': [
  'Hindutva Cultural Push',
  'Uniform Civil Code',
  'Hindi Education Mandate',
  'Secularism Safeguards'
],

/* 2 ── Social Justice & Inclusion */
'Social Justice & Inclusion': [
  'Reservation Expansion (Mandal)',
  'Women’s Reservation Bill',
  'Tribal Rights Protection',
  'Waqf Board Reforms'
],

/* 3 ── Infrastructure & Development */
  'Infrastructure & Development': [
    'National Highways & Airports Upgrade',
    'Ports Modernisation (Coastal)',
    'Smart Cities & Urban Renewal',
    'Defense & Border Infrastructure Boost'
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
    'MSP Guarantee & Farm Loan Waivers',
    'Irrigation & River‑Linking Projects',
    'GMOs',
    'Farm Bills'
  ]
};


// Render the tech tree as five rows (one per branch)
function renderTechTreeRows(tree, container) {
  Object.entries(tree).forEach(([branch, leaves]) => {
    const row = document.createElement('div');
    row.className = 'tech-tree-row';

    const branchLabel = document.createElement('div');
    branchLabel.className = 'tech-tree-branch-label';
    branchLabel.textContent = branch;
    row.appendChild(branchLabel);

    const leavesWrap = document.createElement('div');
    leavesWrap.className = 'tech-tree-leaves';
    leaves.forEach(leaf => {
      // Health bar structure
      const barContainer = document.createElement('div');
      barContainer.className = 'tech-tree-leaf health-bar';
      barContainer.setAttribute('data-progress', '0');

      const barFill = document.createElement('div');
      barFill.className = 'health-bar-fill';
      barFill.style.width = '0%';

      const barLabel = document.createElement('span');
      barLabel.className = 'health-bar-label';
      barLabel.textContent = leaf;

      barContainer.appendChild(barFill);
      barContainer.appendChild(barLabel);

      // Click to increase fill
      barContainer.addEventListener('click', function() {
        let progress = parseInt(barContainer.getAttribute('data-progress'));
        if (progress < 100) {
          progress += 25;
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
        }
      });

      leavesWrap.appendChild(barContainer);
    });
    row.appendChild(leavesWrap);
    container.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const techTreeRows = document.getElementById('tech-tree-rows');
  if (techTreeRows) {
    renderTechTreeRows(policyTree, techTreeRows);
  }
});
