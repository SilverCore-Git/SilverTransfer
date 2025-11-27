/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */


function formatFileSize(fileSizeInBytes) {
    const ko = 1024;               // 1 Ko = 1024 octets
    const mo = ko * 1024;          // 1 Mo = 1024 Ko
    const go = mo * 1024;          // 1 Go = 1024 Mo

    let size;
    let unit;

    if (fileSizeInBytes >= go) {
        // Taille en Go
        size = (fileSizeInBytes / go).toFixed(2);  // Convertir en Go et limiter à 2 chiffres
        unit = 'Go';
    } else if (fileSizeInBytes >= mo) {
        // Taille en Mo
        size = (fileSizeInBytes / mo).toFixed(2);  // Convertir en Mo et limiter à 2 chiffres
        unit = 'Mo';
    } else if (fileSizeInBytes >= ko) {
        // Taille en Ko
        size = (fileSizeInBytes / ko).toFixed(2);  // Convertir en Ko et limiter à 2 chiffres
        unit = 'Ko';
    } else {
        // Taille en octets (B)
        size = fileSizeInBytes;  // Affiche la taille en octets
        unit = 'o';
    }

    return `${size} ${unit}`;  // Retourner la taille formatée
}

module.exports = formatFileSize;