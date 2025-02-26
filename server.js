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
const https = require("https");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

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

const maintenance = require("../www.api/SilverConfig/maintenance.json");
const config = require("../www.api/SilverConfig/transfer/backend.json");
const { encryptFile, decryptFile } = require("./crypt.js");

const DB_FILE = config.DBFile;
let fileDatabase = {};

// Charger la base de données
const loadDatabase = () => {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch {
        return {};
    }
};

// Sauvegarder la base de données
const saveDatabase = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4));
};

fileDatabase = loadDatabase();

// SSL key & cert path
const options = {
    key: fs.readFileSync(config.SSLkeyPath, "utf8"),
    cert: fs.readFileSync(config.SSLcertPath, "utf8"),
};

const corsOptions = {
    origin: [
        "https://t.silverdium.fr",
        "https://transfer.silverdium.fr",
        "https://t.silverdium.fr:84",
        "https://transfer.silverdium.fr:84",
        "https://t.silverdium.fr:8445",
        "https://transfer.silverdium.fr:8445"
        ],
    allowedHeaders: ["Content-Type"],
};

const app = express();
console.log("Démarrage de Express...");
app.use(cors(corsOptions));
app.use(express.json());
app.set("view engine", "ejs");

if (!maintenance.maintenance) {
    app.use(express.static("public"));
} else {
    app.use(express.static("https://api.silverdium.fr/maintenance"));
}

console.log("Express chargé");

const uploadDir = path.join(__dirname, "temp");
// Configuration de Multer pour stocker les fichiers sur disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileID = crypto.randomBytes(8).toString("hex");
        const newFileName = `${fileID}_${file.originalname}`;
        cb(null, newFileName);
    },
});

const upload = multer({ storage });

// Route pour l'upload de fichier
app.post(config.pushfilepath, upload.single("file"), (req, res) => {
    console.log("____Réception d'une requête : ", `'/${config.pushfilepath}'`);

    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const fileID = path.basename(req.file.filename, path.extname(req.file.filename));
    const tempFilePath = req.file.path;  // Chemin du fichier temporaire sauvegardé par Multer
    const encryptedFileName = `${req.file.filename}.enc`;
    const encryptedFilePath = path.join(__dirname, "data", encryptedFileName);
    const fileSize = req.file.size;

    res.json({
        status: "processing",
        message: "Fichier reçu, chiffrement en cours...",
        id: fileID
    });

    console.log('Fichier reçu, chiffrement en cours...');

    try {
        encryptFile(tempFilePath, encryptedFilePath);
        fs.unlinkSync(tempFilePath);

        fileDatabase[fileID] = { fileName: encryptedFileName, date: `${getCurrentDate()} - ${getCurrentTime()}` };
        saveDatabase(fileDatabase);

        console.log('Fichier enregistré et chiffré !');
    } catch (err) {
        console.error("Erreur lors du chiffrement :", err);
    }
});


// Route pour afficher le bouton de téléchargement
app.get("/t/:id", (req, res) => {
    console.log("____Réception d'une requête : ", `'/t/${req.params.id}'`);
    const fileID = req.params.id;
    const fileEntry = fileDatabase[fileID];
    if (!fileEntry) {
        return res.status(404).render("fatherfile", { error: "ID non trouver !", describ: "ID de fichier non trouver..." });
    }

    res.render("download", { fileName: fileEntry.fileName });
});

// Route pour servir le fichier déchiffré
app.get("/data/:filename", (req, res) => {
    console.log("____Réception d'une requête : ", `'/data/${req.params.filename}'`);
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, "data", fileName);
    const decryptedPath = path.join(__dirname, "temp", `dec_${fileName.replace(".enc", "")}`);

    if (fs.existsSync(filePath)) {
        try {
            decryptFile(filePath, decryptedPath);

            res.setHeader("Content-Disposition", `attachment; filename=${fileName.replace(".enc", "")}`);
            res.sendFile(decryptedPath, (err) => {
                if (err) {
                    console.error("Erreur lors de l'envoi du fichier :", err);
                    res.status(500).render("fatherfile", { error: "Erreur lors de l'envoi du fichier", describ: err });
                } else {
                    fs.unlinkSync(decryptedPath);
                    console.log(`✅ Fichier envoyé et supprimé : ${decryptedPath}`);
                }
            });

        } catch (err) {
            console.error("Erreur lors du déchiffrement :", err);
            res.status(500).render("fatherfile", { error: "Erreur lors du déchiffrement !", describ: err });
        }
    } else {
        res.status(404).render("fatherfile", { error: "Fichier non trouvé !", describ: "Fichier non trouvé..." });
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
https.createServer(options, app).listen(PORT, () => {
    console.log(`Serveur HTTPS en ligne sur https://transfer.silverdium.fr:${PORT}`);
});
