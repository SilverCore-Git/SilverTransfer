/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */




// Fonction pour obtenir la date au format "YYYY-MM-DD"
const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
};

// Fonction pour obtenir l'heure actuelle au format "HH:MM:SS"
const getCurrentTime = () => {
    return new Date().toLocaleTimeString("fr-FR", { hour12: false });
};


module.exports = {
    getCurrentDate,
    getCurrentTime
}