const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logsDir, 'application.log');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function getDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function writeLog(level, moduleName, message) {
  const datetime = getDateTime();
  const logLevel = level.toUpperCase();
  const fileName = 'index.js';
  const functionName = 'handler';
  const lineNumber = '0';
  const logLine = `${datetime}|${logLevel}|${moduleName}|${fileName}|${functionName}|${lineNumber}|${message}\n`;
  
  fs.appendFileSync(logFilePath, logLine);
  console.log(logLine.trim());
}

function createLogger(moduleName) {
  return {
    info: function(message) {
      writeLog('info', moduleName, message);
    },
    warn: function(message) {
      writeLog('warn', moduleName, message);
    },
    error: function(message) {
      writeLog('error', moduleName, message);
    },
    debug: function(message) {
      writeLog('debug', moduleName, message);
    },
  };
}

module.exports = createLogger;
