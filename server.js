/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

console.log('🔄 Démarrage du serveur...');

// Importation des bibliothèques
const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");

const formatFileSize = require('./src/filesize.js')

const config = require('./config/config.json');
let pkg = require('./package.json');

setInterval(() => {
    pkg = require('./package.json');
}, 1 * 3600 * 1000);


const { decryptFile, decryptText } = require("./src/crypt.js");
const { loadDatabase, saveDatabase, deleteFiledb, resetDatabase, deleteDatabaseFile, createDatabaseFile } = require('./src/database.js'); 
const { logToFile, originalConsoleError, originalConsoleLog, originalConsoleWarn } = require('./src/logger.js');
const { getCurrentDate, getCurrentTime } = require('./src/datemanager.js');
const { verifyIfExpire } = require('./src/verifyIfExpire.js');

async function resetDB() {

    if (config.resetDB) {

        await resetDatabase(); 

        const { setTimeout } = require('timers/promises');
        await setTimeout(1000);

    };

};
resetDB();

 
let fileDatabase = {};
fileDatabase = loadDatabase();

setInterval(() => {
    fileDatabase = loadDatabase();
}, 5000);

setInterval(() => {
    verifyIfExpire();
}, 24 * 3600 * 1000); // check for expire file




// SSL key & cert path
const options = {
    key: fs.readFileSync(config.SSLkeyPath, "utf8"),
    cert: fs.readFileSync(config.SSLcertPath, "utf8"),
};

const corsOptions = {
    origin: ["https://transfer.silverdium.fr", "https://t.silverdium.fr"],
    methods: ["GET", "POST", "PUT", "DELETE"],
};


const app = express();
console.log("🔄 Démarrage de Express...");

app.use(cors(corsOptions));
app.use(express.json());
app.set("view engine", "ejs");

app.use((req, res, next) => {
 
    if (req.hostname !== config.hostname && req.path === "/") {
        res.set("X-Robots-Tag", "noindex, nofollow");
        return res.send(`
            <h1>Tu utilises le mauvais nom de domaine, le bon est :</h1>
            <br>
            <a href="https://transfer.silverdium.fr">
                <button><h2>https://transfer.silverdium.fr</h2></button>
            </a>
        `);
    };

    if (req.hostname !== config.hostname && req.hostname !== config.hostname2) {
        res.end();
    };

    next(); 

});


app.use(express.static("public"));


console.log("✅ Express chargé");


const uploadDir = path.join(__dirname, config.TEMPdir);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('✅ Répertoire "',config.TEMPdir,'" créé');
}
if (!fs.existsSync(path.join(__dirname, config.DATAdir))) {
    fs.mkdirSync(path.join(__dirname, config.DATAdir));
    console.log('✅ Répertoire "',config.DATAdir,'" créé'); 
}
if (!fs.existsSync(path.join(__dirname, config.DBFile)))  {
    resetDatabase();
} 




// route fontend
app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(__dirname, 'sitemap.xml'))
})
app.get("/patchnotes", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/patchnotes.html'))
})
app.get("/favicon.ico", (req, res) => {
    res.redirect('https://api.silverdium.fr/img/transfer/favicon.ico')
})
app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'))
})
app.get('/assets/img/background/background2', (req, res) => {
    res.sendFile(path.join( __dirname, 'public/assets/img/background/background2.jpg' ))
})
app.get('/assets/img/background/background1', (req, res) => {
    res.sendFile(path.join( __dirname, 'public/assets/img/background/background1.jpg' ))
})
app.get('/version', (req, res) => {
    res.json(pkg.version);
});


// root déportés
const root_upload = require('./roots/upload.js');
const root_download = require('./roots/download.js');
const { version } = require("os");

app.use('/upload', root_upload);
app.use('/data', root_download);







// Route pour afficher le bouton de téléchargement
app.get("/t/:id", async (req, res) => {

    if (req.hostname === config.hostname2) {

        console.log("📥 Réception d'une requête : ", `'/t/${req.params.id}'`);
        const fileID = req.params.id;

            //assets
            if (fileID == 'assets') {
                const fileName = req.query.file
                const ext = req.query.ext
                res.sendFile(path.join(__dirname, 'views', 'assets', ext, `${fileName}.${ext}`))
                return
            }

            // dev access
            const dev = req.query.dev

            if (dev === 'true') {

                console.warn('⚠️ </> Acces développeur ! ?id=',fileID)

                const type = req.query.type
                const err = req.query.err

                if (type === 'err') {

                    if (err === '500') {

                    }

                } else {
                    return await res.render("download", { fileName: 'fileName', fileID: 'fileID', fileSize: 'fSize', version: 'version', v: pkg.version });
                }

            }

        
        const fileEntry = fileDatabase[fileID];

        if (!fileEntry) {
            return res.status(404).render("errfile", { status: "ID de fichier non trouver...", v: pkg.version });
        }

        const fSize = await formatFileSize(fileEntry.size);
        
        const fileName = fileEntry.fileName.split('.')[1];
        const decryptedFileName = decryptText(fileName);


        res.status(200).render("download", { fileName: decryptedFileName, fileID: fileID, fileSize: fSize, v: pkg.version });

    }

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



app.use((req, res) => {
    res.status(404).redirect('https://api.silverdium.fr/www.errors/404.html');
});

verifyIfExpire();

const PORT = config.Port;
https.createServer(options, app).listen(PORT, () => {
    console.log(`✅ Serveur HTTPS en ligne sur ${config.hostname}:${PORT}`);
});


