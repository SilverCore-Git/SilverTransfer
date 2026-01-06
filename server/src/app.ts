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

import './assets/Logger';
import './Jobs';


const corsOptions = {
    origin: dev ? '*' : 'https://www.silvertransfert.fr',
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

if (!fs.existsSync(path.join(__dirname, config.BACKUP_DATA_DIR))) {
    fs.mkdirSync(path.join(__dirname, config.BACKUP_DATA_DIR));
    console.log('✅ Répertoire "',config.BACKUP_DATA_DIR,'" créé'); 
}

if (!fs.existsSync(path.join(__dirname, config.DBFile))) {
    fs.mkdirSync(path.join(__dirname, path.dirname(config.DBFile)));
    fs.writeFileSync(path.join(__dirname, config.DBFile), JSON.stringify([]), 'utf-8');
    console.log('✅ Répertoire "',config.DBFile,'" créé'); 
}


// root déportés
import root_upload from './routes/upload/upload';
import root_download from './routes/download/download';
import root_api from './routes/api';

app.use('/upload', root_upload);
app.use('/data', root_download);
app.use('/api', root_api);


app.get('/version', (req, res) => {
    res.status(200).json(version);
});


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