/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

// libs
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const maintenance = require('../www.api/SilverConfig/maintenance.json');
const config = require('../www.api/SilverConfig/transfer/backend.json');
const { encryptFile, decryptFile } = require('./crypt.js');
const createKey = require('./createkey.js');

const DB_FILE = config.DBFile;

// Charger la base de données
function loadDatabase() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (error) {
        return {};
    }
}

function saveDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4));
}

let fileDatabase = loadDatabase();

// SSL key & cert path
const options = {
    key: fs.readFileSync(config.SSLkeyPath, "utf8"),
    cert: fs.readFileSync(config.SSLcertPath, "utf8"),
};

const corsOptions = {
    origin: ["https://t.silverdium.fr", "https://transfer.silverdium.fr", "https://t.silverdium.fr:84", "https://transfer.silverdium.fr:84"],
    allowedHeaders: ["Content-Type"],
};

const app = express();
app.use(cors(corsOptions));
if (!maintenance.maintenance) {
    app.use(express.static("public"));
} else {
    app.use(express.static("https://api.silverdium.fr/maintenance"));
}
app.use(express.json());
app.set("view engine", "ejs");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route pour l'upload de fichier (config.pushfilepath)
app.post(config.pushfilepath, upload.single("file"), (req, res) => {
    console.log("Réception d'une requête : ", `'/key/${config.pushfilepath}'`)
    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const fileID = crypto.randomBytes(8).toString("hex");
    const originalFileName = req.file.originalname;
    const tempFilePath = path.join(__dirname, "data", `${fileID}_${originalFileName}`);
    const encryptedFilePath = path.join(__dirname, "data", `${fileID}_${originalFileName}.enc`);

    try {
        console.log(`――――――――― { RECEPTION D'UN FICHIER } ――――――――――`)
        fs.writeFileSync(tempFilePath, req.file.buffer);
        console.log("Un fichier recu avec succes !")
        encryptFile(tempFilePath, encryptedFilePath);
        console.log("Un fichier chiffrer avec succes !")
        fs.unlinkSync(tempFilePath);

        fileDatabase[fileID] = { fileName: `${fileID}_${originalFileName}.enc` };
        saveDatabase(fileDatabase);

        res.json({ message: "Fichier reçu et chiffré avec succès", id: fileID });
        console.log('――――――――― { Fin de la reception } ―――――――――')
    } catch (err) {
        console.error("Erreur lors du chiffrement :", err);
        res.status(500).json({ message: "Erreur lors du chiffrement du fichier." });
    }
});

// Route pour afficher le bouton de téléchargement
app.get("/t/:id", (req, res) => {
    console.log("Réception d'une requête : ", `'/t/${req.params.id}'`)
    const fileID = req.params.id;
    const fileEntry = fileDatabase[fileID];
    if (!fileEntry) {
        return res.status(404).render("fatherfile");
    }

    const filePath = path.join(__dirname, "data", fileEntry.fileName);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            return res.status(404).send("Erreur de fichier.");
        }

        const fileAgeInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

        if (fileAgeInDays > config.expiretime) { // Supprimer après expiration
            fs.unlink(filePath, (deleteErr) => {
                if (!deleteErr) {
                    delete fileDatabase[fileID];
                    saveDatabase(fileDatabase);
                }
                res.status(404).send("Le fichier a été supprimé car il est trop ancien.");
            });
        } else {
            res.render("download", { fileName: fileEntry.fileName });
        }
    });
});

// Route pour servir le fichier déchiffré au téléchargement
app.get("/data/:filename", (req, res) => {
    console.log("Réception d'une requête : ", `'/data/${req.params.filename}'`)
    console.log(`――――――――― { ENVOIE D'UN FICHIER } ――――――――――`)
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, "data", fileName);
    const decryptedPath = path.join(__dirname, "data", `dec_${fileName.replace('.enc', '')}`);

    console.log("Déchiffrement d'un fichier")
    if (fs.existsSync(filePath)) {
        try {
            decryptFile(filePath, decryptedPath);
            console.log('Fichier déchifrer !!')
            res.setHeader('Content-Disposition', `attachment; filename=${fileName.replace('.enc', '')}`);
            res.sendFile(decryptedPath, () => fs.unlinkSync(decryptedPath));
            console.log("――――――――― { Fin de la l'envoie } ―――――――――")
        } catch (err) {
            console.error("Erreur lors du déchiffrement :", err);
            res.status(500).send("Erreur lors du déchiffrement du fichier.");
        }
    } else {
        res.status(404).render("fatherfile");
    }
});

// Générer une clé
app.get("/key/:bytes", (req, res) => {
    console.log("Réception d'une requête : ", `'/key/${req.params.bytes}'`)
    const bytes = parseInt(req.params.bytes, 10);
    const key = createKey(true, bytes);
    res.json({ "key": key, "bytes": bytes });
});

const PORT = config.Port;
https.createServer(options, app).listen(PORT, () => {
    console.log(`Serveur HTTPS en ligne sur https://transfer.silverdium.fr:${PORT}`);
});
