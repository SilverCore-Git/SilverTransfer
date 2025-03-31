/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */


// packages
const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require('fs');

const config = require('../config/config.json');
const { loadDatabase } = require('../src/database.js');
const { getCurrentDate, getCurrentTime } = require('../src/datemanager.js')
const { decryptFile, decryptText } = require("../src/crypt.js");


router.get('/end', (req, res) => {
    if (req.hostname === config.hostname) {
        res.render("end", {})
    }
})



// roote => Déchiffrement et téléchargement du fichier
router.get("/:filename", async (req, res) => {

    let fileDatabase = {};
    fileDatabase = loadDatabase();

    if (req.hostname === config.hostname2) {     

        console.log("📥 Requête reçue : /data/",req.params.filename);
        const fileID = req.params.filename;
        const action = req.query.action;

        // Gestion accès développeur
        const dev = req.query.dev;
        const err = req.query.err;
        if (dev == 1) {
            console.warn("⚠️ Accès développeur ! ?ID=",fileID);

            if (err === "404") {
                return res.status(404).render("errfile", { status: "Erreur 404" });
            } else if (err === "end") {
                return res.status(200).render("end");
            }

            return res.status(200).render("data", { status: "Statut inconnu" });
        }

        const fileDB = fileDatabase[fileID];

        if (!fileDB) {
            return res.status(404).json({ error: true, step: 'verify if existing in db file', message: { silver: "Fichier non trouvé" } });
        }

        const fileName = fileDB.fileName.split(".")[1];
        const decryptedFileName = decryptText(fileName);

        const encryptedFilePath = path.join(__dirname, "../data", fileDB.fileName);
        const decryptedFilePath = path.join(__dirname, "../temp", decryptedFileName);

        console.log(encryptedFilePath)

        if (!fs.existsSync(encryptedFilePath)) {
            return res.status(404).json({ error: true, message: { silver: "Fichier chiffré non trouvé" } });
        }

        if (action === "decrypt") {
            try {
                console.log("🔓 Déchiffrement...");
                await decryptFile(encryptedFilePath, decryptedFilePath);
                return res.status(200).json({ success: true, message: { silver: 'Déchiffrement terminé !' } });
            } catch (err) {
                return res.status(500).json({ error: true, message: { silver: 'Une erreur est survenue lors du déchiffrement.', server: err.message } });
            }
        } 

        else if (action === "download") {

            try {

                console.log("📤 Envoi du fichier...");

                await new Promise((resolve, reject) => {
                    // Force le téléchargement du fichier
                    res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(decryptedFilePath) + '"');
                    res.setHeader('Content-Type', 'application/octet-stream');  // MIME type générique pour le téléchargement
        
                    // Envoi du fichier
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

            } catch (err) {
                console.error("Une erreur est survenue : ", err);
                if (!res.headersSent) {
                    return res.status(500).json({ error: true, message: { silver: 'Une erreur est survenue.', server: err.message } });
                }
            }
        }

    }
});



module.exports = router;