// packages
const express = require("express");
const router = express.Router();

const Stats = require('../src/stats_manager.js');

// Route pour ajouter des stats
router.post('/stats', (req, res) => {
  const { country, device, browser, os, referrer, pages, unique = 1 } = req.body;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // format yyyy-mm-dd
  

  const stats = Stats.load();

  // Initialise la date si elle n'existe pas
  if (!stats.visit[dateStr]) {
    stats.visit[dateStr] = {
      all: 0,
      unique: 0,
      country: {},
      device: {},
      pages: {},
      ips: {} // Assure-toi que `ips` est bien initialisé
    };
  }

  // Incrément global
  stats.visit.général.all += 1;
  stats.visit.général.unique += unique;
  stats.visit[dateStr].all += 1;
  stats.visit[dateStr].unique += unique;

  // Récupère l’IP client
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] || // derrière proxy
    req.socket?.remoteAddress || // standard
    req.ip; // fallback

  if (ip) {
    // Assure-toi que l'IP est correctement initialisée dans le cas où il n'y a pas d'IP pour aujourd'hui
    if (!stats.visit[dateStr].ips) {
      stats.visit[dateStr].ips = {};  // Si nécessaire, initialise `ips`
    }

    // Marquer l'IP comme visitée pour la journée
    stats.visit[dateStr].ips[ip] = (stats.visit[dateStr].ips[ip] || 0) + 1;
  }

  // Fonctions d'incrément
  const addCounts = (target, data) => {
    for (const key in data) {
      target[key] = (target[key] || 0) + data[key];
    }
  };

  addCounts(stats.visit.général.country, country || {});
  addCounts(stats.visit[dateStr].country, country || {});

  addCounts(stats.visit.général.device, device || {});
  addCounts(stats.visit[dateStr].device, device || {});

  addCounts(stats.visit.général.browser, browser || {});
  addCounts(stats.visit.général.os, os || {});
  addCounts(stats.visit.général.referrer, referrer || {});

  if (typeof pages === 'object' && pages !== null) {
    for (const page in pages) {
      if (page.startsWith('/t')) {
        // Incrément pour les pages qui commencent par '/t'
        addCounts(stats.visit.général.pages, { '/t': 1 });
        addCounts(stats.visit[dateStr].pages, { '/t': 1 });
      } else {
        // Incrément pour les autres pages
        addCounts(stats.visit.général.pages, { [page]: 1 });
        addCounts(stats.visit[dateStr].pages, { [page]: 1 });
      }
    }
  }



  Stats.save(stats);
  res.json({ message: 'Stat ajoutée avec succès', ip });
});

router.get('/stats/view', (req, res) => {
    try {
      const stats = Stats.load();
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(stats, null, 4));
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors du chargement des statistiques' });
    }
});



const user_db = require('../db/users.json');
const session = require('../src/sessions_manager.js');


router.get('/session/create', (req, res) => {

  const type = req.query.type;

  const user_id = req.cookies.user_id;
  const session_id = req.cookies.session_id;

  if (type == "first") {


  } else {

    if (user_id.include(user_db) && user_db[user_id]) {
    
      
  
    }

  }

});

router.get('/session/verify', (req, res) => {

});








module.exports = router;
