const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Vérification de l'existence du fichier de configuration
const CONFIG_PATH = path.join(__dirname, "../www.api/SilverConfig/transfer/backend.json");
if (!fs.existsSync(CONFIG_PATH)) {
    console.error("Erreur : Fichier de configuration introuvable !");
    process.exit(1);
}

const config = require(CONFIG_PATH);
const DATABASE_FILE = config.DBFile;
const DATA_DIR = config.DATAdir;
const DELETE_AFTER_DAYS = config.expiretime || 15; // Valeur par défaut 15 jours

// Fonction pour charger la base de données JSON
function loadDatabase() {
    if (!fs.existsSync(DATABASE_FILE)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    } catch (error) {
        console.error("Erreur de lecture du fichier JSON :", error);
        return {};
    }
}

// Fonction pour sauvegarder la base de données JSON
function saveDatabase(database) {
    try {
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(database, null, 4), 'utf8');
    } catch (error) {
        console.error("Erreur lors de la sauvegarde de la base de données JSON :", error);
    }
}

// Fonction pour obtenir la date au format "YYYY-MM-DD"
const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Fonction pour obtenir l'heure actuelle au format "HH:MM:SS"
const getCurrentTime = () => new Date().toLocaleTimeString("fr-FR", { hour12: false });

// Fonction d'écriture dans les logs
const logToFile = (message) => {
    const date = getCurrentDate();
    const time = getCurrentTime();
    const logDir = path.join(__dirname, "log");
    const logFilePath = path.join(logDir, `${date}.log`);

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logMessage = `[${date} - ${time}] > ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, "utf8");
};

// Redirection des logs vers fichier
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

// Fonction pour vérifier et supprimer les fichiers obsolètes
function cleanOldFiles() {
    console.log(`Vérification des fichiers obsolètes...`);

    let database = loadDatabase();
    const now = new Date();

    Object.keys(database).forEach((key) => {
        const fileData = database[key];
        const filePath = path.join(DATA_DIR, fileData.fileName);

        // Vérification et conversion correcte de la date
        let fileDate;
        try {
            fileDate = new Date(fileData.date.replace(" - ", "T"));
            if (isNaN(fileDate)) throw new Error("Date invalide");
        } catch (error) {
            console.error(`Erreur de conversion de la date pour ${key} : ${fileData.date}`);
            return;
        }

        // Vérifier si le fichier a plus de DELETE_AFTER_DAYS jours
        const ageInDays = (now - fileDate) / (1000 * 60 * 60 * 24);
        if (ageInDays > DELETE_AFTER_DAYS) {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Fichier supprimé : ${filePath}`);
                } else {
                    console.log(`Fichier non trouvé : ${filePath}`);
                }

                // Supprimer l'entrée de la base de données
                delete database[key];
                console.log(`Entrée supprimée de la base de données : ${key}`);
            } catch (error) {
                console.error(`Erreur lors de la suppression de ${filePath}:`, error);
            }
        }
    });

    // Sauvegarder la base de données mise à jour
    saveDatabase(database);
}

// Planifier l'exécution toutes les 4 heures
cron.schedule('0 */4 * * *', () => {
    cleanOldFiles();
});

// Lancer une première vérification immédiatement
cleanOldFiles();
