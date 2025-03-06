/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

const fs = require("fs");

const config = require('../config/config.json');

const DB_FILE = config.DBFile;

// Charger la base de données
const loadDatabase = () => {
    try {
        if (!fs.existsSync(DB_FILE)) return {}; // Si le fichier n'existe pas, retourner un objet vide
        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (error) {
        console.error("❌ Erreur lors du chargement de la base de données :", error);
        return {};
    }
};

// Sauvegarder la base de données
const saveDatabase = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4));
        console.log("✅ Base de données mise à jour !");
    } catch (error) {
        console.error("❌ Erreur lors de la sauvegarde :", error);
    }
};

// Supprimer une entrée spécifique de la base de données
function deleteFiledb(fileID) {
    let data = loadDatabase();

    if (!data[fileID]) {
        console.log(`⚠️ L'entrée "${fileID}" n'existe pas dans la base de données.`);
        return;
    }

    delete data[fileID]; // Supprimer l'entrée
    saveDatabase(data); // Sauvegarder la mise à jour

    console.log(`🗑️ Entrée supprimée : ${fileID}`);
}

// Supprimer complètement la base de données
function resetDatabase() {
    try {
        fs.writeFileSync(DB_FILE, "{}"); // Réinitialiser en un objet vide
        console.log("🗑️ Base de données réinitialisée !");
    } catch (error) {
        console.error("❌ Erreur lors de la réinitialisation :", error);
    }
}

// Supprimer entièrement le fichier DB_FILE
function deleteDatabaseFile() {
    try {
        if (fs.existsSync(DB_FILE)) {
            fs.unlinkSync(DB_FILE);
            console.log("🚮 Fichier de base de données supprimé !");
        } else {
            console.log("⚠️ Le fichier de base de données n'existe pas.");
        }
    } catch (error) {
        console.error("❌ Erreur lors de la suppression du fichier :", error);
    }
}

module.exports = {
    loadDatabase,
    saveDatabase,
    deleteFiledb,
    resetDatabase,
    deleteDatabaseFile
}