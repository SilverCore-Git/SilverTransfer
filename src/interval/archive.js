const stats = require('../stats_manager.js');


let lastRunMonth = new Date().getMonth();


class interval {

    archive_stats() {
        setInterval(() => {
            const now = new Date();
            const currentMonth = now.getMonth();
          
            if (currentMonth !== lastRunMonth) {
              lastRunMonth = currentMonth;
          
              stats.archive(stats.load());
              console.log('Base de données stats archivé et vidé');
          
            }
          }, 1000 * 60 * 60 * 6);
    }

}

module.export = new interval();