// logger_node_helper.js
// Node.js helper for saving logs from the browser (used via window.api in Electron or with a backend)
const fs = require('fs');
const path = require('path');

function saveLogToFile(logText, gameID) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const filename = `${gameID}_${dd}${mm}${yy}.txt`;
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  const filePath = path.join(logsDir, filename);
  fs.writeFileSync(filePath, logText, 'utf8');
  return filePath;
}

module.exports = { saveLogToFile };
