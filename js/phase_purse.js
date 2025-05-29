// Purse phase update logic
import { getPlayer1Purse, setPlayer1Purse, updatePlayer1PurseDisplay } from './js/purse.js';

export function addPhasePurseBonus() {
    let purse = getPlayer1Purse();
    purse += 100;
    setPlayer1Purse(purse);
    updatePlayer1PurseDisplay();
}
