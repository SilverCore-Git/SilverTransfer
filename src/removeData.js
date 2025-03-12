const fs = require('fs');
const path = require('path');
const { loadDatabase, saveDatabase, deleteFiledb } = require('./database.js');
const config = require('../config/config.json');


const dataDir = path.join(__dirname, 'data');
let fileDatabase = loadDatabase();



function deleteFolderRecursive(folderPath) {

    if (fs.existsSync(folderPath)) {

        fs.readdirSync(folderPath).forEach((file) => {

            const curPath = path.join(folderPath, file);

            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath); // Supprime les sous-dossiers récursivement
            } else {
                fs.unlinkSync(curPath); // Supprime les fichiers
            }

        });

        fs.rmdirSync(folderPath); // Supprime le dossier une fois vidé

    }
}

function removeExpirFile() {

    const now = new Date();
    const expirationDays = config.expiretime * 24 * 60 * 60 * 1000;

    for (const fileId in fileDatabase) {

        const fileInfo = fileDatabase[fileId];
        const folderPath = path.join(dataDir, fileInfo.fileName); // C'est un dossier

        // Convertir la date du dossier en objet Date
        const fileDate = new Date(fileInfo.date.replace(' - ', 'T'));

        // Vérifier si la date dépasse X jours
        if ((now - fileDate) > expirationDays) {

            try {

                if (fs.existsSync(folderPath)) {
                    deleteFolderRecursive(folderPath); // Supprime le dossier et son contenu
                    console.log(`🗑️ Dossier supprimé : ${folderPath}`);
                } else {
                    console.warn(`⚠️ Dossier introuvable : ${folderPath}`);
                }

                // Supprimer l'entrée du dossier de la base de données
                delete fileDatabase[fileId];
                deleteFiledb(fileId);

            } catch (error) {

                console.error(`❌ Erreur lors de la suppression du dossier ${folderPath} :`, error);

            }

        }
    }

    // Sauvegarder la base de données après suppression
    saveDatabase(fileDatabase);
    console.log("✅ Nettoyage des dossiers expirés terminé.");
}


module.exports = { removeExpirFile }