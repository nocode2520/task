const fs = require('fs');
const path = require('path');

const logsDir = path.resolve(__dirname, '..', 'logs');
const logFilePath = path.join(logsDir, 'application.log');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function getStackInfo() {
  const stackLines = new Error().stack?.split('\n') || [];
  for (let i = 3; i < stackLines.length; i += 1) {
    const line = stackLines[i].trim();
    const match = line.match(/at (.+?) \((.+?):(\d+):\d+\)/);
    if (match) {
      const [, fn, filePath, lineNo] = match;
      return { fn, filePath: path.relative(process.cwd(), filePath), lineNo };
    }
    const altMatch = line.match(/at (.+?):(\d+):\d+/);
    if (altMatch) {
      const [, filePath, lineNo] = altMatch;
      return { fn: 'anonymous', filePath: path.relative(process.cwd(), filePath), lineNo };
    }
  }
  return { fn: 'anonymous', filePath: 'unknown', lineNo: '0' };
}

function writeLog(level, moduleName, message) {
  const { fn, filePath, lineNo } = getStackInfo();
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];
  const line = `${now}|${level.toUpperCase()}|${moduleName}|${filePath}|${fn}|${lineNo}|${message}\n`;
  fs.appendFileSync(logFilePath, line);
  console.log(line.trim());
}

function createLogger(moduleName) {
  return {
    info: (message) => writeLog('info', moduleName, message),
    warn: (message) => writeLog('warn', moduleName, message),
    error: (message) => writeLog('error', moduleName, message),
    debug: (message) => writeLog('debug', moduleName, message),
  };
}

module.exports = createLogger;

