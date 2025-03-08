/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

console.log('Démarrage du serveur...');

// Importation des bibliothèques
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const http = require("http");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const formatFileSize = require('./src/filesize.js')

// Fonction pour obtenir la date au format "YYYY-MM-DD"
const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
};

// Fonction pour obtenir l'heure actuelle au format "HH:MM:SS"
const getCurrentTime = () => {
    return new Date().toLocaleTimeString("fr-FR", { hour12: false });
};

const logToFile = (message) => {
    const date = getCurrentDate();
    const time = getCurrentTime();
    const logDir = path.join(__dirname, "log");
    const logFilePath = path.join(logDir, `${date}.log`);

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    const logMessage = `[${date} - ${time}] > ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, "utf8");
};

// Redirection des logs
const originalConsoleLog = console.log;
console.log = (...args) => {
    originalConsoleLog(...args);
    logToFile(args.join(" "));
};

const originalConsoleError = console.error;
console.error = (...args) => {
    originalConsoleError(...args);
    logToFile(args.join(" "));
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
    originalConsoleWarn(...args);
    logToFile(args.join(" "));
};

// const maintenance = require("../www.api/SilverConfig/maintenance.json");

const config = require('./config/config.json');

const { encryptFile, decryptFile, encryptText, decryptText } = require("./src/crypt.js");
const { loadDatabase, saveDatabase, deleteFiledb, resetDatabase, deleteDatabaseFile, createDatabaseFile } = require('./src/database.js');
const { setTimeout } = require("timers/promises");

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




// SSL key & cert path
// const options = {
//     key: fs.readFileSync(config.SSLkeyPath, "utf8"),
//     cert: fs.readFileSync(config.SSLcertPath, "utf8"),
// };

const corsOptions = {
    origin: [
        "https://t.silverdium.fr",
        "https://transfer.silverdium.fr"
        ],
    allowedHeaders: ["Content-Type"],
};

const app = express();
console.log("Démarrage de Express...");
app.use(cors(corsOptions));
app.use(express.json());
app.set("view engine", "ejs");

// if (!maintenance.maintenance) {
    app.use(express.static("public"));
// } else {
//     app.use(express.static("https://api.silverdium.fr/maintenance"));
// }

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

// Configuration de Multer pour stocker les fichiers sur disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const encryptedText = encryptText(file.originalname);
        const fileExt = path.extname(file.originalname);
        const newFileName = `${encryptedText}${fileExt}`;
        cb(null, newFileName);
    },
});

const upload = multer({ storage });


// route fontend




// Route pour l'upload de fichier
app.post(config.pushfilepath, upload.single("file"), async (req, res) => {
    console.log("____Réception d'une requête : ", `' ${config.pushfilepath} '`);

    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    let randomNumber = Math.floor(Math.random() * 100000000);
    randomNumber = randomNumber.toString().padStart(8, '0');

    const fileID = randomNumber;
    const tempFilePath = req.file.path;  // Chemin du fichier temporaire sauvegardé par Multer
    const encryptedFileName = `${fileID}.${req.file.filename}.enc`;
    const encryptedFilePath = path.join(__dirname, config.DATAdir, encryptedFileName);

    res.json({
        status: "processing",
        message: "Fichier reçu, chiffrement en cours...",
        id: fileID
    });

    console.log('Fichier reçu, chiffrement en cours...');

    try {

        await encryptFile(tempFilePath, encryptedFilePath);

        fileDatabase[fileID] = {
            fileName: encryptedFileName,
            size: req.file.size,
            date: `${getCurrentDate()} - ${getCurrentTime()}` 
        };
        await saveDatabase(fileDatabase);

        console.log('✅✅__Fichier enregistré ! ', `?id=${fileID}`);
    } catch (err) {
        console.error("Erreur lors du chiffrement :", err);
    }
});


// Route pour afficher le bouton de téléchargement
app.get("/t/:id", async (req, res) => {
    console.log("____Réception d'une requête : ", `'/t/${req.params.id}'`);
    const fileID = req.params.id;
    const fileEntry = fileDatabase[fileID];
    const fSize = await formatFileSize(fileEntry.size);
    const fileName = fileEntry.fileName.split('.')[1];
    const decryptedFileName = decryptText(fileName);
    if (!fileEntry) {
        return res.status(404).render("fatherfile", { error: "ID non trouver !", describ: "ID de fichier non trouver..." });
    }

    res.render("download", { fileName: decryptedFileName, fileID: fileID, fileSize: fSize });
});

// Route pour servir le fichier déchiffré
app.get("/data/:filename", async (req, res) => {
    console.log("📥 Réception d'une requête :", `'/data/${req.params.filename}'`);
    
    const fileID = req.params.filename; // Nom chiffré du fichier

    
    const fileDB = fileDatabase[fileID]; // Récupération de la base de données
    if (!fileDB) {
        return res.status(404).json({ error: "Fichier non trouvé dans la base de données" });
    }

    const fileName = fileDB.fileName.split('.')[1];


    const decryptedFileName = decryptText(fileName); // Déchiffrer le vrai nom du fichier

    const encryptedFilePath = path.join(__dirname, "data", fileDB.fileName); // Fichier chiffré
    const decryptedFilePath = path.join(__dirname, "temp", decryptedFileName); // Destination du déchiffrement

    if (!fs.existsSync(encryptedFilePath)) {
        return res.status(404).json({ error: "Fichier chiffré non trouvé sur le serveur" });
    }

    console.log("🔓 Déchiffrement du fichier en cours...");

    await decryptFile(encryptedFilePath, decryptedFilePath); // Déchiffrement du fichier

    await res.setHeader("Content-Disposition", `attachment; filename=${decryptedFileName}`);

    try {

        let { setTimeout } = require('timers/promises');
        await setTimeout(1000);

        await new Promise((resolve, reject) => {
            res.sendFile(decryptedFilePath, (err) => {
                if (err) {
                    console.error("❌ Erreur lors de l'envoi du fichier :", err);
                    reject({ status: 500, error: "Erreur lors de l'envoi du fichier", describ: err });
                } else {
                    console.log(`✅ Fichier envoyé avec succès !`);
                    resolve();
                }
            });
        });
    
        // Supprimer le fichier temporaire après envoi
        await fs.promises.unlink(decryptedFilePath);
        console.log(`🗑️ Fichier temporaire supprimé !`);
    
        // Suppression du fichier de la base de données
        await deleteFiledb(fileID);


    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.error, describ: error.describ });
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

const PORT = config.Port;
http.createServer(app).listen(PORT, () => {
    console.log(`Serveur HTTPS en ligne sur https://transfer.silverdium.fr:${PORT}`);
});
