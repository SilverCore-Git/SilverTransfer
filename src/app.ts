console.log('🔄 Démarrage du serveur...');

// Importation des bibliothèques
import express from "express";
import fs from "fs";
import http from "http";
import cors from "cors";
import path from "path";
import crypto from "crypto";
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import config from './config/config.json';
import { dev, version } from '../package.json';

import './assets/logger';


async function resetDB() {

    if (config.resetDB) {

        await resetDatabase(); 

        setTimeout(() => {}, 1000);

    };

};
resetDB();


const corsOptions = {
    origin: dev ? 'http://localhost:84' : 'https://www.silvertransfert.fr',
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
};


const app = express();
console.log("🔄 Démarrage de Express...");

app.set('trust proxy', true);
app.set("view engine", "ejs");

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '16gb' }))
app.use(express.urlencoded({ limit: '16gb', extended: true }))

app.use((req, res, next) => {

    if (req.hostname !== config.hostname) {
        return res.redirect(`https://${config.hostname}${req.path}`);
    };

    next(); 

});

app.use(express.static(path.join(__dirname, 'public')));
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));


console.log("✅ Express chargé");


const uploadDir = path.join(__dirname, config.TEMPdir);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('✅ Répertoire "',config.TEMPdir,'" créé');
};

if (!fs.existsSync(path.join(__dirname, config.DATAdir))) {
    fs.mkdirSync(path.join(__dirname, config.DATAdir));
    console.log('✅ Répertoire "',config.DATAdir,'" créé'); 
};

if (!fs.existsSync(path.join(__dirname, config.LOGDir))) {
    fs.mkdirSync(path.join(__dirname, config.LOGDir));
    console.log('✅ Répertoire "',config.LOGDir,'" créé'); 
}

if (!fs.existsSync(path.join(__dirname, config.DBFile)))  {
    resetDatabase();
};




// route fontend
app.get("/sitemap.xml", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'assets/sitemap.xml'))
});
app.get("/patchnotes", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/patchnotes.html'))
});
app.get("/politiques", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/politiques.html'))
});
app.get("/legale", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/politiques.html'))
});
app.get("/favicon.ico", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'assets/favicon.ico'))
});
app.get("/favicon", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'assets/favicon.ico'))
});
app.get("/ads.txt", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'assets/ads.txt'))
});
app.get("/favicon.png", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/assets/img/logo.png'))
});
app.get("/robots.txt", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'assets/robots.txt'))
});

app.get('/assets/img/background/:file', (req, res) => {
    res.status(200).sendFile(path.join( __dirname, `public/assets/img/background/${req.params.file}.jpg` ));
});

app.get('/assets/img/:file', (req, res) => {
    res.status(200).sendFile(path.join( __dirname, `public/assets/img/${req.params.file.endsWith('gnp') ? req.params.file : req.params.file+'.png'}` ));
});


app.get('/version', (req, res) => {
    res.status(200).json(version);
});

app.get('/admin/stats', (req, res) => {
 
    if (req.query.mdp == process.env.stats_mdp) {

        res.render('stats', { mdp: process.env.stats_mdp_api, ifarchive: req.query.archive || 0, date: req.query.date || null });

    } else { res.json(false) }

})


// root déportés
const root_upload = require('./roots/upload.js');
const root_download = require('./roots/download.js');
const root_api = require('./roots/api.js');

app.use('/upload', root_upload);
app.use('/data', root_download);
app.use('/api', root_api);



// Générer une clé
app.get("/key/:bytes", (req, res) => {
    console.log("📥 Réception d'une requête : ", `'/key/${req.params.bytes}'`)
    const bytes = parseInt(req.params.bytes, 10);

    let statu;
    let message;
    let key = "none";

    if (isNaN(bytes)) { 
        statu = "ERROR";
        message = "Erreur lors de la création de la clé : bytes is not a number !";
        console.log(`Annulation d'une requête : ${statu} => ${message}`);
        return res.json({ "status": statu, "message": message, "key": key, "bytes": bytes });
     }

    if (bytes >= config.maxbyteforkey) {
        statu = "ERROR";
        message = "Erreur lors de la création de la clé : bytes is too big !";
        console.log(`Annulation d'une requête : ${statu} => ${message}`);
    } else {
        statu = "OK";
        message = "Clé envoyée avec succès";
        key = crypto.randomBytes(bytes).toString("hex");
        console.log('Nouvelle clé créée : ', bytes, 'bytes');
        console.log(`Envoi de la clé type res.json : "{ "status": ${statu}, "message": ${message}, "key": ForSecureDontShow, "bytes": ${bytes} }"`);
    }
    
    return res.json({ "status": statu, "message": message, "key": key, "bytes": bytes });
});


app.get('/passwd/:nb', async (req, res) => {

    const nb = Number(req.params.nb);

    function genererMotDePasse(longueur: number = 10) {
        const caracteres = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let motDePasse = '';
    
        for (let i = 0; i < longueur; i++) {
            const index = Math.floor(Math.random() * caracteres.length);
            motDePasse += caracteres[index];
        }
    
        return motDePasse;
    }

    res.json(genererMotDePasse(nb));

})



app.use((req, res) => {
    res.status(404).send(`<h1>Erreur 404 page non trouvée</h1>`);
});

const PORT = config.Port;

http.createServer(app).listen(PORT, () => {
    console.log(`✅ Serveur HTTP en ligne sur ${config.hostname}:${PORT}`);
});