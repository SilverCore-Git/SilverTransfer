/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */



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
    originalConsoleError, 
    originalConsoleLog,
    originalConsoleWarn
}