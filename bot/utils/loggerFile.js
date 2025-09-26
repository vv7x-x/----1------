const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const logsDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logsDir, 'main.log');

fse.ensureDirSync(logsDir);

const queue = [];
let writing = false;

function writeNext() {
  if (writing || queue.length === 0) return;
  writing = true;
  const line = queue.shift();
  fs.appendFile(logFile, line + '\n', (err) => {
    writing = false;
    if (err) console.error('file-log error:', err.message || err);
    writeNext();
  });
}

function log(level, event, meta = {}) {
  try {
    const entry = JSON.stringify({ ts: new Date().toISOString(), level, event, ...meta });
    queue.push(entry);
    writeNext();
  } catch (e) {
    console.error('file-log serialize error:', e.message || e);
  }
}

module.exports = { log };
