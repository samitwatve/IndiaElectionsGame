// This file defines fake hitboxes for small Union Territories to improve mouse interaction
// Each hitbox is a transparent SVG rectangle or circle overlaying the real region
// The hitboxes are injected and event-bound in map.js

// Place fake bounding boxes for small UTs as SVG buttons in the bottom left
// For clean layout, all buttons will be inside a single group rectangle
// Rectangle: x = -100, y = 700, width = 180, height = 300
const groupBoxX = -100;
const groupBoxY = 700;
const labelHeight = 36; // Space for the "Small UTs" label
const groupBoxWidth = 180;
const groupBoxHeight = 300;

const buttonCount = 4;
const buttonHeight = 48;
const buttonSpacing = (groupBoxHeight - labelHeight - buttonCount * buttonHeight) / (buttonCount + 1);
const buttonWidth = groupBoxWidth - 20;
const buttonStartX = groupBoxX + (groupBoxWidth - buttonWidth) / 2;

export const smallUTsHitboxes = [
  {
    id: 'hitbox-chandigarh',
    targetId: 'INCH',
    type: 'rect',
    cx: buttonStartX + buttonWidth / 2,
    cy: groupBoxY + labelHeight + buttonSpacing + buttonHeight / 2,
    width: buttonWidth,
    height: buttonHeight,
    rx: 8,
    fill: '#1976d2',
    style: 'cursor:pointer; opacity:0.92;',
    label: 'Chandigarh',
  },
  {
    id: 'hitbox-dnh',
    targetId: 'INDH',
    type: 'rect',
    cx: buttonStartX + buttonWidth / 2,
    cy: groupBoxY + labelHeight + 2 * buttonSpacing + buttonHeight + buttonHeight / 2,
    width: buttonWidth,
    height: buttonHeight,
    rx: 8,
    fill: '#1976d2',
    style: 'cursor:pointer; opacity:0.92;',
    label: 'Dadra & Nagar Haveli',
  },
  {
    id: 'hitbox-diu',
    targetId: 'INDD',
    type: 'rect',
    cx: buttonStartX + buttonWidth / 2,
    cy: groupBoxY + labelHeight + 3 * buttonSpacing + 2 * buttonHeight + buttonHeight / 2,
    width: buttonWidth,
    height: buttonHeight,
    rx: 8,
    fill: '#1976d2',
    style: 'cursor:pointer; opacity:0.92;',
    label: 'Daman & Diu',
  },
  {
    id: 'hitbox-puducherry',
    targetId: 'INPY',
    type: 'rect',
    cx: buttonStartX + buttonWidth / 2,
    cy: groupBoxY + labelHeight + 4 * buttonSpacing + 3 * buttonHeight + buttonHeight / 2,
    width: buttonWidth,
    height: buttonHeight,
    rx: 8,
    fill: '#1976d2',
    style: 'cursor:pointer; opacity:0.92;',
    label: 'Puducherry',
  }
];
