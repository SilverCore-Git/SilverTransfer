const fs = require("fs");

module.exports = async function (path, expectedSize) {
  while (true) {
    const stats = fs.statSync(path);

    if (stats.size >= expectedSize) {
      return;
    }

    await new Promise(resolve => setImmediate(resolve));
  }
}
