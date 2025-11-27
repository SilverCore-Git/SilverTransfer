
const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '../db/stats.json');
const archive_dir = path.join(__dirname, '../db/archives');
const stats_archive_dir = path.join(__dirname, '../db/archives/stats');

class stats {
    
    load(archive = false, date = null) {

        try {

            if (archive == true) {

                const ddate = date.replace('-', '.');
                const sStatsPath = path.join(__dirname, `../db/archives/stats_silvertransfert_${ddate}.json`);

                if (!fs.existsSync(sStatsPath)) {
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

                return JSON.parse(fs.readFileSync(sStatsPath));

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

    fix() {
        try {

            console.log('Run stats fix');

            const stats = this.load();
            const fixedStats = JSON.parse(JSON.stringify(stats));

            let totalAll = 0;
            let totalUnique = 0;

            for (const day in fixedStats.visit)
            {
                if (day === "général") continue;

                const dayData = fixedStats.visit[day];
                if (!dayData || typeof dayData !== "object") continue;

                const ips = dayData.ips && typeof dayData.ips === "object" ? dayData.ips : {};

                const unique = Object.keys(ips).length;

                const all = Object.values(ips)
                    .reduce((sum, n) => sum + (typeof n === "number" ? n : 0), 0);

                dayData.unique = unique;
                dayData.all = all;

                totalAll += all;
                totalUnique += unique;
            }

            fixedStats.visit.général = {
                ...fixedStats.visit.général,
                all: totalAll,
                unique: totalUnique
            };

            this.save(fixedStats);

        } catch (err) {
            console.error('Une erreur est survenue lors du fix des stats : ', err);
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