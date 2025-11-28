// packages
import { Router } from "express";
import router = Router();
import fs from 'fs';
import path from "path";

import Stats from '../assets/stats_manager';

// Route pour ajouter des stats
router.post('/stats', (req, res) => {
  const { country, device, browser, os, referrer, pages, unique = 1 } = req.body;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // format yyyy-mm-dd
  
    // Récupère l’IP client
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] || // derrière proxy
    req.socket?.remoteAddress || // standard
    req.ip; // fallback

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
  const isUnique = !Object.hasOwn(stats.visit[dateStr].ips, ip);

  stats.visit.général.all += 1;
  stats.visit.général.unique += isUnique ? 1 : 0;

  stats.visit[dateStr].all += 1;
  stats.visit[dateStr].unique += isUnique ? 1 : 0;

  // Ajouter ou incrémenter l'IP
  stats.visit[dateStr].ips[ip] = (stats.visit[dateStr].ips[ip] || 0) + 1;

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

router.get('/stats/view', async (req, res) => {

  const archive = req.query.archive == 1 ? true : false;
  const date = req.query.date;

  if (req.query.mdp == process.env.stats_mdp_api) {

    try {

      const stats = await fs.promises.readFile('./db/stats.json', 'utf-8');
      const users = await fs.promises.readFile('./db/users.json', 'utf-8');
      res.send({ stats: JSON.parse(stats, null, 2), users: JSON.parse(users, null, 2) });

    } catch (err) {
      res.status(500).json({ error: true, message: err });
      console.error({ error: true, message: err });
    }

  } else { res.json(false) }
});



module.exports = router;
