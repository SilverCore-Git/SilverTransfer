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
const { encryptFile, encryptText } = require("../src/crypt.js");
const key = require('../src/key_manager.js');

let fileDatabase = {};
fileDatabase = loadDatabase();

let filesIDS = [];

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
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 11 * 1024 * 1024 * 1024 // 11 Go
    }
 });


router.get('/create/id', async (req, res) => {

    if (req.hostname === config.hostname) {

        console.log("📥 Réception d'une requête : ", `' /upload/create/id '`);

        fileDatabase = loadDatabase();

        let id;
        do {
            let randomNumber = Math.floor(Math.random() * 100000000);
            randomNumber = randomNumber.toString().padStart(8, '0');
            id = randomNumber;
        } while (fileDatabase[id] !== undefined);         

        // const socket_id = randomNumber;

        // filesIDS.push({ id, socket_id });

        res.json({
            status: "success",
            message: "Socket créé",
            id
        });

    } else {
        res.status(403).json({ message: "Accès interdit" });
    }

});

router.get('/file', async (req, res) => {
    res.send('ok')
})

router.post('/file', upload.single("file"), async (req, res) => {

    // if (req.hostname === config.hostname) {

        console.log("📥 Réception d'une requête : ", `' /upload/file '`);

        fileDatabase = loadDatabase();

        // if (req.fileValidationError) {
        //     return res.status(400).json({ message: req.fileValidationError });
        // }

        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier reçu" });
        }

        const fileID = req.query.id;
        const passwd = req.query.passwd;
        await key.generate(fileID, passwd);
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

            const public_key = await key.read(fileID, 'public');
            await encryptFile(tempFilePath, encryptedFilePath, public_key);

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

    // }

});

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Erreur Multer : ${err.message}` });
    }
    console.error('Erreur inconnue:', err);
    res.status(500).json({ message: 'Erreur serveur lors du transfert' });
});

module.exports = router;