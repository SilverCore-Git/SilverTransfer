const exp = require('constants');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();
const fatherKey = Buffer.from(process.env.SECRET_KEY, 'hex');
if (fatherKey.length !== 32) {
    throw new Error("FATHER_KEY doit être de 32 octets en hexadécimal !");
    console.error("FATHER_KEY doit être de 32 octets en hexadécimal !");
}

// 🔒 Chiffrement AES-256-GCM d'un fichier
function encryptFile(inputFile, outputFile) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', fatherKey, iv);
    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);

    output.write(iv); // On stocke l'IV au début du fichier
    const authTagStream = cipher.pipe(output); // Chiffrer et écrire dans le fichier

    input.pipe(cipher);

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
    console.log(`✅ Fichier déchiffré : ${outputFile}`);
}

module.exports = {
    encryptFile,
    decryptFile
};
