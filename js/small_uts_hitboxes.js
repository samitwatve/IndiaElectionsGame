// This file defines fake hitboxes for small Union Territories to improve mouse interaction
// Each hitbox is a transparent SVG rectangle or circle overlaying the real region
// The hitboxes are injected and event-bound in map.js

export const smallUTsHitboxes = [
  {
    id: 'hitbox-chandigarh',
    targetId: 'INCH',
    type: 'rect',
    cx: 334.9,
    cy: 255.1,
    width: 24,
    height: 24,
    rx: 6,
    fill: 'transparent',
    style: 'pointer-events: all;',
  },
  {
    id: 'hitbox-dadra-nagar-haveli',
    targetId: 'INDH',
    type: 'rect',
    cx: 232.5,
    cy: 573.8,
    width: 28,
    height: 28,
    rx: 8,
    fill: 'transparent',
    style: 'pointer-events: all;',
  },
  {
    id: 'hitbox-daman-diu',
    targetId: 'INDH', // Same as Dadra & Nagar Haveli (merged UT)
    type: 'rect',
    cx: 232.5,
    cy: 573.8,
    width: 28,
    height: 28,
    rx: 8,
    fill: 'transparent',
    style: 'pointer-events: all;',
  },
  {
    id: 'hitbox-puducherry',
    targetId: 'INPY',
    type: 'rect',
    cx: 417.7,
    cy: 838.9,
    width: 32,
    height: 32,
    rx: 10,
    fill: 'transparent',
    style: 'pointer-events: all;',
  }
];
