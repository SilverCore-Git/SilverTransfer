/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */


// packages
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require('path');

const config = require('../config/config.json');
const { loadDatabase, saveDatabase } = require('../src/database.js');
const { getCurrentDate, getCurrentTime } = require('../src/datemanager.js')
const { encryptFile, decryptFile, encryptText, decryptText } = require("../src/crypt.js");

let fileDatabase = {};
fileDatabase = loadDatabase();

const uploadDir = path.join(__dirname, '../', config.TEMPdir);

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



router.post('/yourmother', upload.single("file"), async (req, res) => {
    console.log("____Réception d'une requête : ", `' /upload/yourmother '`);

    fileDatabase = loadDatabase();

    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }

    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    let randomNumber = Math.floor(Math.random() * 100000000);
    randomNumber = randomNumber.toString().padStart(8, '0');

    const fileID = randomNumber;
    const tempFilePath = req.file.path;  // Chemin du fichier temporaire sauvegardé par Multer
    const encryptedFileName = `${fileID}.${req.file.filename}.enc`;
    const encryptedFilePath = path.join(__dirname, `../${config.DATAdir}`, encryptedFileName);

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



module.exports = router;