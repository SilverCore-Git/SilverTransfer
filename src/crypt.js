/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();
const fatherKey = Buffer.from(process.env.SECRET_KEY, 'hex');
const babyKey = Buffer.from(process.env.TEXT_SECRET_KEY, 'hex'); // clée de 20bytes
if (fatherKey.length !== 32) {
    throw new Error("FATHER_KEY doit être de 32 octets en hexadécimal !");
    console.error("FATHER_KEY doit être de 32 octets en hexadécimal !");
}

// 🔒 Chiffrement AES-256-GCM d'un fichier
async function encryptFile(inputFile, outputFile) {
    const iv = await crypto.randomBytes(16);
    const cipher = await crypto.createCipheriv('aes-256-gcm', fatherKey, iv);
    const input = await fs.createReadStream(inputFile);
    const output = await fs.createWriteStream(outputFile);

    await output.write(iv); // On stocke l'IV au début du fichier
    const authTagStream = await cipher.pipe(output); // Chiffrer et écrire dans le fichier

    await input.pipe(cipher);

    authTagStream.on('finish', () => {
        const authTag = cipher.getAuthTag();
        fs.appendFileSync(outputFile, authTag); // Ajouter l'authTag à la fin 
        console.log(`✅ Fichier chiffré : ${outputFile}`);
    });
}

// 🔓 Déchiffrement AES-256-GCM d'un fichier
function decryptFile(encryptedFile, outputFile) {
    const input = fs.readFileSync(encryptedFile);
    const iv = input.slice(0, 16); // Lire l'IV
    const authTag = input.slice(-16); // Lire l'authTag
    const encryptedData = input.slice(16, -16); // Extraire les données chiffrées

    const decipher = crypto.createDecipheriv('aes-256-gcm', fatherKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    fs.writeFileSync(outputFile, decrypted);
    console.log(`✅ Fichier déchiffré !`);
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
