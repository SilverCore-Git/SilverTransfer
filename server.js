/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

console.log('Démarrage du serveur...');

// Importation des bibliothèques
const express = require("express");
const fs = require("fs");
// const https = require("https");
const http = require("http");
const cors = require("cors");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");
const formatFileSize = require('./src/filesize.js')




// const maintenance = require("../www.api/SilverConfig/maintenance.json");

const config = require('./config/config.json');

const { decryptFile, decryptText } = require("./src/crypt.js");
const { loadDatabase, saveDatabase, deleteFiledb, resetDatabase, deleteDatabaseFile, createDatabaseFile } = require('./src/database.js');
const { logToFile, originalConsoleError, originalConsoleLog, originalConsoleWarn } = require('./src/logger.js');
const { getCurrentDate, getCurrentTime } = require('./src/datemanager.js')
const { removeExpirFile } = require("./src/removeData.js");


async function resetDB() {

    if (config.resetDB) {

        await resetDatabase(); 

        const { setTimeout } = require('timers/promises');
        await setTimeout(1000);

    };

}
resetDB()

 
let fileDatabase = {};
fileDatabase = loadDatabase();

setInterval(() => {
    fileDatabase = loadDatabase();
}, 5000)


// initialisation de la suprésion des fichier expirer
// setInterval(() => { removeExpirFile() }, 3600000); // marche pas, fait crach remplacer dans la fin de la root /data


// SSL key & cert path
// const options = {
//     key: fs.readFileSync(config.SSLkeyPath, "utf8"),
//     cert: fs.readFileSync(config.SSLcertPath, "utf8"),
// };

const corsOptions = {
    origin: ["https://transfer.silverdium.fr", "https://t.silverdium.fr"],
    allowedHeaders: ["Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE"],
};


const app = express();
console.log("Démarrage de Express...");

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
    }

    next(); 

});


app.use(express.static("public"));


console.log("Express chargé");


const uploadDir = path.join(__dirname, config.TEMPdir);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Répertoire "',config.TEMPdir,'" créé');
}
if (!fs.existsSync(path.join(__dirname, config.DATAdir))) {
    fs.mkdirSync(path.join(__dirname, config.DATAdir));
    console.log('Répertoire "',config.DATAdir,'" créé');
}



// route fontend
app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(__dirname, 'sitemap.xml'))
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


// root déportés
const root_upload = require('./roots/upload.js');
const root_download = require('./roots/download.js');
const { error } = require("console");

app.use('/upload', root_upload);







// Route pour afficher le bouton de téléchargement
app.get("/t/:id", async (req, res) => {
    console.log("____Réception d'une requête : ", `'/t/${req.params.id}'`);
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

            console.warn('⚠️ </> Acces développeur ! id?=',fileID)

            const type = req.query.type
            const err = req.query.err

            if (type === 'err') {

                if (err === '500') {

                }
                else if (err === '404') {
                    await res.status(404).render("fatherfile", { error: "ID non trouver !", describ: "ID de fichier non trouver..." });
                    return
                }

            } else {

                await res.render("download", { fileName: 'fileName', fileID: 'fileID', fileSize: 'fSize' });
                return

            }

        }

    
    const fileEntry = fileDatabase[fileID];

    if (!fileEntry) {
        return res.status(404).render("errfile", { status: "ID de fichier non trouver..." });
    }

    const fSize = await formatFileSize(fileEntry.size);
    
    const fileName = fileEntry.fileName.split('.')[1];
    const decryptedFileName = decryptText(fileName);


    res.render("download", { fileName: decryptedFileName, fileID: fileID, fileSize: fSize });
});



app.get('/data/end', (req, res) => {
    res.render("end", {})
})



// ➤ **Route principale** : Déchiffrement et téléchargement du fichier
app.get("/data/:filename", async (req, res) => {

    console.log("📥 Requête reçue : /data/", req.params.filename);
    const fileID = req.params.filename;
    const action = req.query.action;

    // Gestion accès développeur
    const dev = req.query.dev;
    const err = req.query.err;
    if (dev == 1) {
        console.warn("⚠️ Accès développeur ! ID =", fileID);

        if (err === "404") {
            return res.status(404).render("errfile", { status: "Erreur 404" });
        } else if (err === "end") {
            return res.status(200).render("end");
        }

        return res.status(200).render("data", { status: "Statut inconnu" });
    }
        
    const fileDB = fileDatabase[fileID];

    if (!fileDB) {
        return res.status(404).json({ error: true, message: { silver: "Fichier non trouvé" } });
    }

    const fileName = fileDB.fileName.split(".")[1];
    const decryptedFileName = decryptText(fileName);

    const encryptedFilePath = path.join(__dirname, "data", fileDB.fileName);
    const decryptedFilePath = path.join(__dirname, "temp", decryptedFileName);

    if (!fs.existsSync(encryptedFilePath)) {
        return res.status(404).json({ error: true, message: { silver: "Fichier chiffré non trouvé" } });
    }

    if (action === "decrypt") {

        try {

            console.log("🔓 Déchiffrement...");

            await decryptFile(encryptedFilePath, decryptedFilePath)
            .then(end => {
                return res.status(200).json({ success: true, message: { silver: 'Déchiffrement terminer !' } });
            })
            .catch(err => {
                return res.status(500).json({ error: true, message: { silver: 'Une erreur est survenue lors du déchiffrement.', server: err || err.message } });
            })


        }
        catch (err) {
            return res.status(500).json({ error: true, message: { silver: 'Une erreur est survenue.', server: err || err.message } });
        };
            

    }

    else if (action === "download") {

        try {
            await new Promise((resolve, reject) => {

                res.sendFile(decryptedFilePath, (err) => {
                    if (err) {
                        console.error("❌ Erreur d'envoi :", err);
                        reject({ status: 500, error: "Erreur d'envoi", detail: err });
                    } else {
                        console.log("✅ Fichier envoyé !");
                        resolve();
                    }
                });

            });

            // Supprime le fichier temporaire après l'envoi
            await fs.promises.unlink(decryptedFilePath);
            console.log("🗑️ Fichier temporaire supprimé !");
            await fs.promises.rm(encryptedFilePath, { recursive: true, force: true });
            console.log("🗑️ Fichier local supprimé !");
            await deleteFiledb(fileID);



        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: true, message: { silver: 'Une erreur est survenue.', server: err || err.message } });
        }

    }

});



// Générer une clé
app.get("/key/:bytes", (req, res) => {
    console.log("____Réception d'une requête : ", `'/key/${req.params.bytes}'`)
    const bytes = parseInt(req.params.bytes, 10);

    let statu;
    let message;
    let key = "none";

    if (isNaN(bytes)) { 
        statu = "ERROR";
        message = "Erreur lors de la création de la clé : bytes is not a number !";
        console.log(`Annulation d'une requête : ${statu} => ${message}`);
        res.json({ "status": statu, "message": message, "key": key, "bytes": bytes });
        return;
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
    
    res.json({ "status": statu, "message": message, "key": key, "bytes": bytes });
});



app.use((req, res) => {
    res.status(404).redirect('https://api.silverdium.fr/www.errors/404.html');
});



const PORT = config.Port;
http.createServer(app).listen(PORT, () => {
    console.log(`Serveur HTTPS en ligne sur https://transfer.silverdium.fr:${PORT}`);
});


