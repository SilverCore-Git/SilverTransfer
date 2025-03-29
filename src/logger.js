/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

const { getCurrentDate, getCurrentTime } = require('./datemanager.js')
const path = require('path')
const fs = require('fs')


const logToFile = (message) => {
    const date = getCurrentDate();
    const time = getCurrentTime();
    const logDir = path.join(__dirname, "../log");
    const logFilePath = path.join(logDir, `${date}.log`);

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    const logMessage = `[${date} - ${time}] > ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, "utf8");
};


// Redirection des logs
const originalConsoleLog = console.log;
console.log = (...args) => {
    originalConsoleLog(...args);
    logToFile(args.join(" "));
};

const originalConsoleError = console.error;
console.error = (...args) => {
    originalConsoleError(...args);
    logToFile(args.join(" "));
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
    originalConsoleWarn(...args);
    logToFile(args.join(" "));
};



module.exports = {
    logToFile,
    originalConsoleError, 
    originalConsoleLog,
    originalConsoleWarn
}