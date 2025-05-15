// packages
const express = require("express");
const router = express.Router();
const cookieParser = require('cookie-parser');

router.use(cookieParser());

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




const session = require('../src/sessions_manager.js');


router.get('/session/create', async (req, res) => {

  const type = req.query?.type;

  const user_id = req.cookies?.user_id;
  const session_id = req.cookies?.session_id;
  let premium = req.query?.premium;

  if (!type) return res.json("query incomplet");

  if (type == "first") {

    if (user_id) return res.status(400).json({ error: true, message: "user déjà identifié" });
    if (!premium) return res.json("query incomplet");
    premium = premium == "1" ? true : false;

    session.create(
      "first",
      {
        user_agent: req.headers['user-agent'],
        user_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
        premium: premium,
        premium_parms: {}
      }
    ).then(resp => {
      if (resp.error) {
        return res.status(500).json(resp);
      } else {
        res.cookie('user_id', resp.id, {
          httpOnly: true,    // ne peut pas être lu par le JS client
          maxAge: 100 * 365 * 24 * 60 * 60 * 1000,   // expire dans 100 ans
          signed: false
        });
        return res.status(200).json(resp);
      }
    }).catch(err => {
      console.error("Erreur lors de la création de session :", err);
      return res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    });

  } else {

    let verify;
    if (!user_id) verify = true;
    if (!session_id) verify = true;
    if (user_id && session_id) verify = true;

    if (verify) {
    
      const Session = await session.create(
                        "temp",
                        {
                          user_agent: req.headers['user-agent'],
                          user_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
                          premium: req.query.premium == "1" ? true : false,
                          premium_parms: {}
                        },
                        user_id
                      );

      if (Session.error) {
        return res.status(500).json(Session);
      }

      else {
        res.cookie('session_id', Session.id, {
          httpOnly: true,    // ne peut pas être lu par le JS client  
          signed: false
        });
        return res.status(200).json(Session);
      };
  
    } else {
      return res.status(200).json({ message: "une session est déjà existante", data: session.verify(user_id, session_id) || null });
    };

  };

});

router.get('/session/verify', async (req, res) => {

  const user_id = req.cookies?.user_id;
  const session_id = req.cookies?.session_id;
  
  if (!user_id) return res.json("query incomplet");
  if (!session_id) return res.json("query incomplet");

  console.log(user_id, '\n', session_id )
  console.log(await session.verify(user_id, session_id))

  if (await session.verify(user_id, session_id) == false) {

    return res.status(400).json({ error: true, message: "session inexistante" });

  } else {
    return res.status(200).json(await session.verify(user_id, session_id));
  }

});


router.get('/session/close', async (req, res) => {

  const user_id = req.cookies?.user_id;
  const session_id = req.cookies?.session_id;
  
  if (!user_id) return res.json("query incomplet");
  if (!session_id) return res.json("query incomplet");

  if (await session.verify(user_id, session_id) == false) {

    return res.status(400).json({ error: true, message: "session inexistante" });

  } else {
    session.close(user_id, session_id).then(r => {

      if (r.error) {
        return res.status(500).json(r);
      }

      if (r) {
        res.clearCookie('session_id', {
          httpOnly: true,    // ne peut pas être lu par le JS client  
          signed: false
        });
        return res.status(200).json(true);
      }

    })
  }

});








module.exports = router;
