// This file defines fake hitboxes for small Union Territories to improve mouse interaction
// Each hitbox is a transparent SVG rectangle or circle overlaying the real region
// The hitboxes are injected and event-bound in map.js

// Place fake bounding boxes for small UTs as SVG buttons in the bottom left
// For clean layout, all buttons will be inside a single group rectangle
// Rectangle: x = -100, y = 700, width = 180, height = 300
const groupBoxX = -100;
const groupBoxY = 700;
const groupBoxWidth = 180;
const groupBoxHeight = 300;
const buttonCount = 3;
const buttonSpacing = 24;
const buttonHeight = Math.floor((groupBoxHeight - (buttonCount + 1) * buttonSpacing) / buttonCount * 0.8);
const buttonWidth = groupBoxWidth - 20;
const buttonStartX = groupBoxX + (groupBoxWidth - buttonWidth) / 2;

export const smallUTsHitboxes = [
  {
    id: 'hitbox-chandigarh',
    targetId: 'INCH',
    type: 'rect',
    cx: buttonStartX + buttonWidth / 2,
    cy: groupBoxY + 2 * buttonSpacing + buttonHeight / 2,
    width: buttonWidth,
    height: buttonHeight,
    rx: 8,
    fill: '#1976d2',
    style: 'cursor:pointer; opacity:0.92;',
    label: 'Chandigarh',
  },
  {
    id: 'hitbox-dnh-diu',
    targetId: ['INDH', 'INDD'],
    type: 'rect',
    cx: buttonStartX + buttonWidth / 2,
    cy: groupBoxY + 2 * buttonSpacing + buttonHeight + buttonSpacing + buttonHeight / 2,
    width: buttonWidth,
    height: buttonHeight,
    rx: 8,
    fill: '#1976d2',
    style: 'cursor:pointer; opacity:0.92;',
    label: 'Dadra & Nagar Haveli & Daman & Diu',
  },
  {
    id: 'hitbox-puducherry',
    targetId: 'INPY',
    type: 'rect',
    cx: buttonStartX + buttonWidth / 2,
    cy: groupBoxY + 2 * buttonSpacing + 2 * (buttonHeight + buttonSpacing) + buttonHeight / 2,
    width: buttonWidth,
    height: buttonHeight,
    rx: 8,
    fill: '#1976d2',
    style: 'cursor:pointer; opacity:0.92;',
    label: 'Puducherry',
  }
];
