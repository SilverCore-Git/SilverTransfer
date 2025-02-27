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
const { loadDatabase, saveDatabase, deleteFiledb, resetDatabase, deleteDatabaseFile } = require('./src/database.js');


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

// if (!maintenance.maintenance) {
    app.use(express.static("public"));
// } else {
//     app.use(express.static("https://api.silverdium.fr/maintenance"));
// }

console.log("Express chargé");

const uploadDir = path.join(__dirname, "temp");
// Configuration de Multer pour stocker les fichiers sur disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const encryptedText = encryptText(file.originalname);
        req.body.Textiv = encryptedText.iv;
        const newFileName = encryptedText.encryptedData;
        cb(null, newFileName);
    },
});

const upload = multer({ storage });

// Route pour l'upload de fichier
app.post(config.pushfilepath, upload.single("file"), async (req, res) => {
    console.log("____Réception d'une requête : ", `' ${config.pushfilepath} '`);

    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const fileID = path.basename(req.file.filename, path.extname(req.file.filename));
    const tempFilePath = req.file.path;  // Chemin du fichier temporaire sauvegardé par Multer
    const encryptedFileName = `${req.file.filename}.enc`;
    const encryptedFilePath = path.join(__dirname, "data", encryptedFileName);

    res.json({
        status: "processing",
        message: "Fichier reçu, chiffrement en cours...",
        id: fileID
    });

    console.log('Fichier reçu, chiffrement en cours...');

    try {

        await encryptFile(tempFilePath, encryptedFilePath);
        await fs.unlinkSync(tempFilePath);

        fileDatabase[fileID] = { 
            fileName: encryptedFileName,
            iv: req.body.Textiv,
            date: `${getCurrentDate()} - ${getCurrentTime()}` 
        };
        await saveDatabase(fileDatabase);

        console.log('Fichier enregistré et chiffré !');
    } catch (err) {
        console.error("Erreur lors du chiffrement :", err);
    }
});


// Route pour afficher le bouton de téléchargement
app.get("/t/:id", async (req, res) => {
    console.log("____Réception d'une requête : ", `'/t/${req.params.id}'`);
    const fileID = req.params.id;
    const fileEntry = fileDatabase[fileID];
    if (!fileEntry) {
        return res.status(404).render("fatherfile", { error: "ID non trouver !", describ: "ID de fichier non trouver..." });
    }

    res.render("download", { fileName: fileEntry.fileName });
});

// Route pour servir le fichier déchiffré
app.get("/data/:filename", async (req, res) => {
    console.log("📥 Réception d'une requête :", `'/data/${req.params.filename}'`);
    
    const fileNameEnc = req.params.filename; // Nom chiffré du fichier
    const fileID = fileNameEnc.replace(".enc", ""); // ID du fichier sans ".enc"

    const fileDB = fileDatabase[fileID]; // Récupération de la base de données
    if (!fileDB) {
        return res.status(404).json({ error: "Fichier non trouvé dans la base de données" });
    }

    const iv = fileDB.iv; // Récupérer l'IV stocké
    const decryptedFileName = decryptText(fileID, iv); // Déchiffrer le vrai nom du fichier

    const encryptedFilePath = path.join(__dirname, "data", fileNameEnc); // Fichier chiffré
    const decryptedFilePath = path.join(__dirname, "temp", decryptedFileName); // Destination du déchiffrement

    if (!fs.existsSync(encryptedFilePath)) {
        return res.status(404).json({ error: "Fichier chiffré non trouvé sur le serveur" });
    }

    try {
        console.log("🔓 Déchiffrement du fichier en cours...");
        await decryptFile(encryptedFilePath, decryptedFilePath); // Déchiffrement du contenu

        fs.unlink(encryptedFilePath, (err) => {});

        await res.setHeader("Content-Disposition", `attachment; filename=${decryptedFileName}`);
        await res.sendFile(decryptedFilePath, async (err) => {
            if (err) {
                console.error("❌ Erreur lors de l'envoi du fichier :", err);
                res.status(500).json({ error: "Erreur lors de l'envoi du fichier", describ: err });
            } else {
                console.log(`✅ Fichier envoyé avec succès !`);
                // Supprimer le fichier temporaire après envoi
                await fs.unlink(decryptedFilePath, (err) => {
                    if (err) console.error("❌ Erreur lors de la suppression du fichier temporaire :", err);
                    else console.log(`🗑️ Fichier temporaire supprimé !`);
                });
                await deleteFiledb(fileID)
            }
        });


    } catch (err) {
        console.error("❌ Erreur lors du déchiffrement :", err);
        res.status(500).json({ error: "Erreur lors du déchiffrement", describ: err });
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
