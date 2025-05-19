
const fs = require('fs');
const path = require('path');

let statsPath = path.join(__dirname, '../db/stats.json');
const archive_dir = path.join(__dirname, '../db/archives');
const stats_archive_dir = path.join(__dirname, '../db/archives/stats');

class stats {
    
    load(archive = false, date = null) {

        try {

            if (archive) {

                const ddate = date.replace('-', '.');
                statsPath = path.join(__dirname, `../db/archives/stats_silvertransfert_${ddate}.json`);

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
        catch (err) {
            console.error({ error: true, message: err });
            return { error: true, message: err };
        }

    }

    archive(data) {

        try {

            if (!fs.existsSync(archive_dir)) fs.mkdir(archive_dir);
            if (!fs.existsSync(stats_archive_dir)) fs.mkdir(stats_archive_dir);

            const stats_archive_file = `stats_archive_${new Date()}_silvertransfert.json`;

            fs.writeFileSync(path.join(stats_archive_dir + '/' + stats_archive_file), JSON.stringify(data, null, 2));

            fs.unlink(statsPath);

            this.save(this.load());

        }

        catch (err) {
            return console.error('Une erreur est survenue lors de l\'archivage des stats : ', err );
        };

    }

    save(data) {
        fs.writeFileSync(statsPath, JSON.stringify(data, null, 2));
    }

}

module.exports = new stats();