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
const { decryptFile, decryptText, verifyPassword } = require("../src/crypt.js");
const key = require('../src/key_manager.js');

var download_status = [];

router.get('/end', (req, res) => {
    if (req.hostname === config.hostname) {
        res.status(200).render("end", {})
    }
})


router.get('/status', (req, res) => {

    const fileID = req.query.id;

    let foundItem = download_status.find(item => item.id === fileID);

    res.status(200).json(foundItem);

})


// roote => Déchiffrement et téléchargement du fichier
router.get("/:id", async (req, res) => {

    let fileDatabase = {};
    fileDatabase = loadDatabase();

    if (req.hostname === config.hostname) {     

        console.log("📥 Requête reçue : /data/",req.params.id);

        const passwd = req.query.passwd;
        const fileID = req.params.id;
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

        if (!fs.existsSync(encryptedFilePath)) {
            return res.status(404).json({ error: true, message: { silver: "Fichier chiffré non trouvé" } });
        }

        if (action === "decrypt") {
            try {

                if (fs.existsSync(decryptedFilePath)) {
                    let { size } = fs.statSync(decryptedFilePath);
                    if (size == fileDB.size) {
                        download_status.push( { id: fileID, status: "decrypted", end: true } )
                        return res.status(200).json({ message: { silver: "Déchiffrement terminé" } })
                    }
                }

                console.log('🔄 Vérification du passwd...');

                const private_key = await key.read(fileID, 'private');

                if (!await verifyPassword(encryptedFilePath, private_key, passwd)) {
                    download_status = download_status.filter(item => item.id !== fileID);
                    return res.json( { id: fileID, error: true, message: { silver: 'url incorect' }, status: "error",  end: false } );
                }

                console.log("🔓 Déchiffrement...");

                download_status.push( { id: fileID, status: "decrypt", end: false } );
                res.status(200).json({ message: { silver: "Déchiffrement en cours.." } })

                await decryptFile(encryptedFilePath, decryptedFilePath, private_key, passwd)

                download_status = download_status.filter(item => item.id !== fileID);
                download_status.push( { id: fileID, status: "end", end: true } );

            } catch (err) {
                return console.error('Une erreur est survenue lors du déchiffrement.', err.message );
            }
        } 

        else if (action === "download") {
            console.log("📤 Envoi du fichier...");
        
            try {
                await fs.promises.access(decryptedFilePath);   // vérifie qu’il existe
            } catch (e) {
                return res.status(404).json({ error: true, message: 'Fichier introuvable' });
            }
        
            const filename11 = path.basename(decryptedFilePath);
            res.type(path.extname(filename11));
            res.setHeader('Content-Disposition', `attachment; filename="${filename11}"`);
        
            try {
                const stream = fs.createReadStream(decryptedFilePath);
        
                stream.on('open', () => {
                    stream.pipe(res);
                });
        
                stream.on('error', (err) => {
                    console.error('❌ Erreur lors du streaming du fichier :', err);
                    if (!res.headersSent) {
                        res.status(500).json({ error: true, message: { silver: 'Erreur lors de l’envoi du fichier' } });
                    }
                });
        
                res.on('close', async () => {
                    if (!res.writableEnded) {
                        console.warn("⚠️ Téléchargement interrompu (client a fermé la connexion)");
                        stream.destroy();
                    }
        
                    // Supprimer le fichier temporaire
                    try {
                        await fs.promises.unlink(decryptedFilePath);
                        console.log("🗑️ Fichier temporaire supprimé !");
                    } catch (err) {
                        console.warn("❌ Impossible de supprimer le fichier temporaire :", err.message);
                    }
                });
        
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