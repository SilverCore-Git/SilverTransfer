/**
 * @author SilverCore
 * @author SilverTransfert
 * @author MisterPapaye
 */

const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();
const fatherKey = Buffer.from(process.env.SECRET_KEY, 'hex');
const babyKey = Buffer.from(process.env.TEXT_SECRET_KEY, 'hex'); // clée de 32bytes
if (fatherKey.length !== 32) {
    return console.error("FATHER_KEY doit être de 32 octets en hexadécimal !");
}

CHUNK_SIZE = 100 * 1024 * 1024;

// 🔒 Chiffrement 
async function encryptFile(inputFile, outputFolder = 'data/undefined', publicKey) {
    try {
        const fileStats = await fs.promises.stat(inputFile);
        const totalSize = fileStats.size;

        // Créer un dossier de sortie si nécessaire
        await fs.promises.mkdir(outputFolder, { recursive: true });

        let chunkIndex = 0;

        // 🔥 Générer une clé AES pour ce fichier
        const aesKey = crypto.randomBytes(32); // 32 bytes = AES-256
        const encryptedAesKey = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            aesKey
        );

        // Fonction pour traiter un morceau
        async function processChunk(startPosition) {
            const outputFile = `${outputFolder}/part${chunkIndex}.enc`;
            const output = fs.createWriteStream(outputFile);

            // Générer un IV unique pour ce morceau
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);

            // ➡️ Si c'est le premier morceau, écrire d'abord la clé AES chiffrée + l'IV
            if (chunkIndex === 0) {
                const keyLengthBuffer = Buffer.alloc(4);
                keyLengthBuffer.writeUInt32BE(encryptedAesKey.length);

                output.write(keyLengthBuffer);     // 4 octets : taille de la clé AES chiffrée
                output.write(encryptedAesKey);      // Clé AES chiffrée
            }

            output.write(iv); // IV pour ce morceau

            // Lire le bon morceau du fichier
            const inputStream = fs.createReadStream(inputFile, { start: startPosition, end: startPosition + CHUNK_SIZE - 1 });

            return new Promise((resolve, reject) => {
                inputStream.on('data', (chunk) => {
                    const encryptedChunk = cipher.update(chunk);
                    output.write(encryptedChunk);
                });

                inputStream.once('end', () => {
                    const finalEncrypted = cipher.final();
                    output.write(finalEncrypted);
                    output.end();
                    console.log(`✅ Partie ${chunkIndex} chiffrée avec succès : ${outputFile}`);
                    chunkIndex++;
                    resolve();
                });

                inputStream.once('error', reject);
                output.once('error', reject);
            });
        }

        // ➡️ Boucle de découpage
        while ((chunkIndex * CHUNK_SIZE) < totalSize) {
            await processChunk(chunkIndex * CHUNK_SIZE);
        }

        // Supprimer l'original
        await fs.promises.unlink(inputFile);
        console.log(`✅ Fichier source "${inputFile}" supprimé après chiffrement.`);

        console.log('✅ Chiffrement terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du chiffrement :', error);
    }
}



async function verifyPassword(inputFile, privateKey, passwd) {
    try {
        const buffer = await fs.promises.readFile(inputFile);

        if (buffer.length < 4) {
            throw new Error('Fichier trop petit pour contenir une clé AES.');
        }

        const keyLength = buffer.readUInt32BE(0);

        if (buffer.length < 4 + keyLength) {
            throw new Error('Fichier incomplet : clé AES manquante.');
        }

        const encryptedAesKey = buffer.slice(4, 4 + keyLength);

        // 🔥 Essayer de décrypter la clé AES
        crypto.privateDecrypt(
            {
                key: privateKey,
                passphrase: passwd,
            },
            encryptedAesKey
        );

        // Si aucun erreur : mot de passe valide
        return true;
    } catch (err) {
        // Si erreur → mot de passe invalide
        return false;
    }
}



// 🔓 Déchiffrement
async function decryptFile(inputFolder, outputFile = 'temp/undefined', privateKey, passwd) {

    const files = await fs.promises.readdir(inputFolder);
    const sortedFiles = files.filter(file => file.endsWith('.enc')).sort(); // Trier dans l'ordre
    const outputStream = fs.createWriteStream(outputFile);

    let aesKey = null; // clé AES une fois récupérée

    try {

        for (let index = 0; index < sortedFiles.length; index++) {
            const file = sortedFiles[index];
            const inputFile = `${inputFolder}/${file}`;
            const inputStream = fs.createReadStream(inputFile);

            await new Promise((resolve, reject) => {
                let decipher;
                let isFirstChunk = true;
                let bufferCache = Buffer.alloc(0);

                inputStream.on('data', (chunk) => {
                    bufferCache = Buffer.concat([bufferCache, chunk]);

                    if (isFirstChunk) {
                        if (index === 0) {
                            // Cas particulier du premier fichier (clé AES et IV stockés au début)
                            if (bufferCache.length < 4) {
                                // Pas encore assez de données pour lire la taille de la clé
                                return;
                            }
                            const keyLength = bufferCache.readUInt32BE(0);

                            if (bufferCache.length < 4 + keyLength + 16) {
                                // Pas encore assez de données pour lire clé + IV
                                return;
                            }

                            const encryptedAesKey = bufferCache.slice(4, 4 + keyLength);
                            const iv = bufferCache.slice(4 + keyLength, 4 + keyLength + 16);

                            // Déchiffrer la clé AES
                            aesKey = crypto.privateDecrypt(
                                {
                                    key: privateKey,
                                    passphrase: passwd,
                                },
                                encryptedAesKey
                            );

                            decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);

                            // Récupérer le reste des données (après 4 + clé + 16 octets)
                            const encryptedData = bufferCache.slice(4 + keyLength + 16);
                            const decryptedChunk = decipher.update(encryptedData);
                            outputStream.write(decryptedChunk);

                            isFirstChunk = false;
                            bufferCache = Buffer.alloc(0); // vider le buffer
                        } else {
                            // Pour les autres fichiers
                            if (bufferCache.length < 16) {
                                // Pas assez de données pour lire IV
                                return;
                            }
                            const iv = bufferCache.slice(0, 16);
                            decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);

                            const encryptedData = bufferCache.slice(16);
                            const decryptedChunk = decipher.update(encryptedData);
                            outputStream.write(decryptedChunk);

                            isFirstChunk = false;
                            bufferCache = Buffer.alloc(0); // vider le buffer
                        }
                    } else {
                        // Après avoir traité l'IV, tout est des données encryptées
                        const decryptedChunk = decipher.update(chunk);
                        outputStream.write(decryptedChunk);
                    }
                });

                inputStream.on('end', () => {
                    try {
                        if (decipher) {
                            const finalDecrypted = decipher.final();
                            outputStream.write(finalDecrypted);
                        }
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

// for text
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
    decryptText,
    verifyPassword
};
