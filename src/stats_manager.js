const fs = require('fs');
const path = require('path');
const statsPath = path.join(__dirname, '../db/stats.json');

class stats {
    
    // Charge ou initialise la DB
    load() {
        if (!fs.existsSync(statsPath)) {
            return {
                stats_db: {
                date: new Date().toLocaleDateString('fr-FR'),
                id: Math.random().toString(36).substring(2, 10)
                },
                visit: {
                général: {
                    ip: {},
                    all: 0,
                    unique: 0,
                    country: {},
                    device: {},
                    browser: {},
                    os: {},
                    referrer: {},
                    pages: {}
                }
                }
            };
        }
        return JSON.parse(fs.readFileSync(statsPath));
    }

    save(data) {
        fs.writeFileSync(statsPath, JSON.stringify(data, null, 2));
    }

}

module.exports = new stats();