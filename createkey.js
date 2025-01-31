/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

const crypto = require("crypto");

function createKey(log, bytes) {
    const key = crypto.randomBytes(bytes).toString("hex");
    if (log) { console.log('Key : ', key) }
}


module.exports = createKey 
