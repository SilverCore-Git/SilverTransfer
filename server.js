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
const http = require("http");
const cors = require("cors");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");
const bodyParser = require('body-parser');
require('dotenv').config();
// const helmet = require('helmet');

const ifdev = false;


const formatFileSize = require('./src/filesize.js')

const config = require('./config/config.json');
let pkg = require('./package.json');



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


let options;

if (ifdev) {
    options = null;
} else {
    // SSL key & cert path
    options = {
        key: fs.readFileSync(config.SSLkeyPath, "utf8"),
        cert: fs.readFileSync(config.SSLcertPath, "utf8"),
    };
}

const corsOptions = {
    origin: 'https://www.silvertransfert.fr',
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
};



const app = express();
console.log("🔄 Démarrage de Express...");

app.set('trust proxy', true);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json({ limit: '11gb' }))
app.use(express.urlencoded({ limit: '11gb', extended: true }))
// app.use(helmet());
app.set("view engine", "ejs");

app.use((req, res, next) => {
 
    if (req.hostname !== config.hostname) {
        return res.redirect(`https://${config.hostname}${req.path}`);
    };

    next(); 

});

app.use(express.static("public"));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));


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
    res.status(200).sendFile(path.join( __dirname, `public/assets/img/${req.params.file}.png` ));
});


app.get('/version', (req, res) => {
    res.status(200).json(pkg.version);
});
app.get("/index.js", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/index.js'))
})

app.get('/admin/stats', (req, res) => {
    const ip =
    req.headers['x-forwarded-for']?.split(',')[0] || // derrière proxy
    req.socket?.remoteAddress || // standard
    req.ip; // fallback

    if (process.env.ip_autorise.includes(ip)) {
        res.render('stats');
    }

})


// root déportés
const root_upload = require('./roots/upload.js');
const root_download = require('./roots/download.js');
const root_api = require('./roots/api.js');

app.use('/upload', root_upload);
app.use('/data', root_download);
app.use('/api', root_api);







// Route pour afficher le bouton de téléchargement
app.get("/t/:id/:passwd", async (req, res) => {

    if (req.hostname === config.hostname) {

        console.log("📥 Réception d'une requête : ", `'/t/${req.params.id}'`);

        const fileID = req.params.id;
        const passwd = req.params.passwd;

            //assets
            if (passwd == 'assets') {
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
                    return await res.render("download", { fileName: 'fileName', fileID: 'fileID', fileSize: 'fSize', passwd: 'e', fileExpir: '15', version: 'version', v: pkg.version });
                }

            }

        
        const fileEntry = fileDatabase[fileID];

        if (!fileEntry) {
            return res.status(404).render("errfile", { status: "ID de fichier non trouver...", v: pkg.version });
        }

        const fSize = await formatFileSize(fileEntry.size);
        
        const fileName = fileEntry.fileName.split('.')[1];
        const decryptedFileName = decryptText(fileName);

        const input = fileEntry.date;
        const parsedDate = new Date(input.replace(" - ", "T"));
        
        const now = new Date();
        const fifteenDaysLater = new Date(parsedDate.getTime() + 15 * 24 * 60 * 60 * 1000);
        
        const diffMs = fifteenDaysLater - now;
        
        if (diffMs <= 0) {
          return res.status(410).render("errfile", { status: "Le fichier a expiré !", v: pkg.version });
        } else {
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
          const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
          const diffSeconds = Math.floor((diffMs / 1000) % 60);
        
          res.status(200).render("download", { fileName: decryptedFileName, passwd: passwd,  fileExpir: diffDays, fileID: fileID, fileSize: fSize, v: pkg.version });

        }

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


app.get('/passwd/:nb', async (req, res) => {

    const nb = req.params.nb;

    function genererMotDePasse(longueur = 10) {
        const caracteres = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
        let motDePasse = '';
    
        for (let i = 0; i < longueur; i++) {
            const index = Math.floor(Math.random() * caracteres.length);
            motDePasse += caracteres[index];
        }
    
        return motDePasse;
    }

    res.json(await genererMotDePasse(nb));

})



app.use((req, res) => {
    res.status(404).send(`<h1>Erreur 404 page non trouvée</h1>`);
});


verifyIfExpire();


const PORT = config.Port;

if (ifdev) {
    http.createServer(app).listen(PORT, () => {
        console.log(`✅ Serveur HTTP en ligne sur ${config.hostname}:${PORT}`);
    });
} else {
    https.createServer(options, app).listen(PORT, () => {
        console.log(`✅ Serveur HTTPS en ligne sur ${config.hostname}:${PORT}`);
    });
}



