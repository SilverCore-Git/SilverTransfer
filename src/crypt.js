/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();
const fatherKey = Buffer.from(process.env.SECRET_KEY, 'hex');
const babyKey = Buffer.from(process.env.TEXT_SECRET_KEY, 'hex'); // clée de 32bytes
if (fatherKey.length !== 32) {
    throw new Error("FATHER_KEY doit être de 32 octets en hexadécimal !");
    console.error("FATHER_KEY doit être de 32 octets en hexadécimal !");
}
const MAX_CONCURRENT_FILES = 5;




// 🔒 Chiffrement AES-256-CBC d'un fichier en plusieurs morceaux
async function encryptFile(inputFile, outputFolder) {
    try {
        const CHUNK_SIZE = 100 * 1024 * 1024; // 100 Mo par fichier
        const fileStats = await fs.promises.stat(inputFile);
        const totalSize = fileStats.size;

        const inputStream = fs.createReadStream(inputFile);
        let chunkIndex = 0;

        // Créer un dossier de sortie si nécessaire
        await fs.promises.mkdir(outputFolder, { recursive: true });

        // Fonction pour traiter un morceau et créer le fichier de sortie
        async function processChunk(startPosition) {
            const outputFile = `${outputFolder}/part${chunkIndex}.enc`;
            const iv = crypto.randomBytes(16);  // Générer un IV unique pour chaque morceau
            const cipher = crypto.createCipheriv('aes-256-cbc', fatherKey, iv);
            const output = fs.createWriteStream(outputFile);
            
            output.write(iv);  // Écrire l'IV au début du fichier

            // Créer un stream de lecture à partir de la position actuelle du fichier
            const buffer = Buffer.alloc(CHUNK_SIZE);
            const inputStream = fs.createReadStream(inputFile, { start: startPosition, end: startPosition + CHUNK_SIZE - 1 });

            let chunkWritten = 0;

            return new Promise((resolve, reject) => {
                // Lire les données du fichier à partir de la position
                inputStream.on('data', (chunk) => {
                    const encryptedChunk = cipher.update(chunk);
                    output.write(encryptedChunk);
                    chunkWritten += chunk.length;
                });

                inputStream.once('end', () => {
                    const finalEncrypted = cipher.final();
                    output.write(finalEncrypted);  // Ajouter la fin du chiffrement
                    output.end();
                    console.log(`✅ Partie ${chunkIndex} chiffrée avec succès : ${outputFile}`);

                    chunkIndex++;  // Passer au prochain fichier
                    resolve();
                });

                inputStream.once('error', (err) => {
                    reject(err);
                });

                output.once('error', (err) => {
                    reject(err);
                });
            });
        }

        // Découper le fichier en morceaux et les traiter
        while ((chunkIndex * CHUNK_SIZE) < totalSize) {
            await processChunk(chunkIndex * CHUNK_SIZE);
        }

        // Suppression du fichier d'entrée après chiffrement
        await fs.promises.unlink(inputFile);
        console.log(`✅ Le fichier d'entrée "${inputFile}" a été supprimé après chiffrement.`);

        console.log('✅ Chiffrement terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du chiffrement du fichier :', error);
    }
}







// 🔓 Déchiffrement AES-256-CBC d'un fichier en plusieurs morceaux
async function decryptFile(inputFolder, outputFile) {
    try {
        const files = await fs.promises.readdir(inputFolder); // Lire les fichiers dans le dossier
        const sortedFiles = files.filter(file => file.endsWith('.enc')).sort(); // Trier par ordre croissant
        const outputStream = fs.createWriteStream(outputFile);

        for (const file of sortedFiles) {
            const inputFile = `${inputFolder}/${file}`;
            const inputStream = fs.createReadStream(inputFile);

            await new Promise((resolve, reject) => {
                let iv;
                let decipher;
                let isFirstChunk = true;

                inputStream.on('data', (chunk) => {
                    if (isFirstChunk) {
                        iv = chunk.slice(0, 16); // Extraire l'IV
                        decipher = crypto.createDecipheriv('aes-256-cbc', fatherKey, iv);
                        chunk = chunk.slice(16); // Supprimer l'IV du chunk
                        isFirstChunk = false;
                    }

                    const decryptedChunk = decipher.update(chunk);
                    outputStream.write(decryptedChunk);
                });

                inputStream.on('end', () => {
                    try {
                        const finalDecrypted = decipher.final();
                        outputStream.write(finalDecrypted);
                        console.log(`✅ Partie déchiffrée : ${inputFile}`);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });

                inputStream.on('error', reject);
            });
        }

        outputStream.end();
        console.log(`✅ Déchiffrement terminé avec succès : ${outputFile}`);

    } catch (error) {
        console.error('❌ Erreur lors du déchiffrement du fichier :', error);
    }
}








const algorithm = 'AES-256-ECB';

// for texte
// Fonction pour chiffrer un texte
function encryptText(text) {
    const cipher = crypto.createCipheriv(algorithm, babyKey, null); 
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted; 
}

// Fonction pour déchiffrer un texte
function decryptText(encryptedData) {
    const decipher = crypto.createDecipheriv(algorithm, babyKey, null); 
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encryptFile,
    decryptFile,
    encryptText,
    decryptText
};
