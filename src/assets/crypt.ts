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

CHUNK_SIZE = 100 * 1024 * 1024; // 100 mo par parti (augementé ??)


async function encryptFile(inputFile, outputFolder = 'data/undefined', publicKey, dev_env = false) {
    try {
        const fileStats = await fs.promises.stat(inputFile);
        const totalSize = fileStats.size;
        const chunkSize = CHUNK_SIZE;

        // Créer un dossier de sortie si nécessaire
        await fs.promises.mkdir(outputFolder, { recursive: true });

        let chunkIndex = 0;
        let filePlan = {
            chunks: [],
            originalFileHash: '',
            aesKey: ''
        };

        // 🔥 Générer une clé AES pour ce fichier
        const aesKey = crypto.randomBytes(32); // 32 bytes = AES-256
        const encryptedAesKey = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            aesKey
        );

        // ⚡️ Calculer le hash sans charger tout le fichier en RAM
        const hash = crypto.createHash('sha256');
        await new Promise((resolve, reject) => {
            const hashStream = fs.createReadStream(inputFile);
            hashStream.on('data', (chunk) => {
                hash.update(chunk);
            });
            hashStream.on('end', () => {
                filePlan.originalFileHash = hash.digest('hex');
                filePlan.aesKey = encryptedAesKey.toString('hex');
                resolve();
            });
            hashStream.on('error', reject);
        });

        // Créer un fichier témoin contenant des informations sur le fichier
        const witnessData = {
            fileName: inputFile,
            fileSize: totalSize,
            fileHash: filePlan.originalFileHash,
            encryptionKeyLength: aesKey.length,
            chunks: Math.ceil(totalSize / chunkSize),
            justadddata: "fds123ERZ!?#{[|`"
        };

        const witnessFile = `${outputFolder}/witness.txt`;
        await fs.promises.writeFile(witnessFile, JSON.stringify(witnessData, null, 2), 'utf8');
        console.log(`✅ Fichier témoin créé : ${witnessFile}`);

        // Créer le layout.json pour le fichier témoin
        const witnessLayout = {
            fileName: 'witness.txt',
            aesKey: encryptedAesKey.toString('hex')
        };
        await fs.promises.writeFile(`${outputFolder}/witness_layout.json`, JSON.stringify(witnessLayout, null, 2));
        console.log(`✅ Layout du fichier témoin écrit dans witness_layout.json`);

        // Fonction pour traiter un morceau du fichier principal
        async function processChunk(startPosition) {
            const outputFile = `${outputFolder}/part${chunkIndex}.enc`;
            const output = fs.createWriteStream(outputFile);

            // Générer un IV unique pour ce morceau
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);

            // Ajouter les informations au plan
            filePlan.chunks.push({
                index: chunkIndex,
                start: startPosition,
                iv: iv.toString('hex') // IV en hex
            });

            // Lire le bon morceau du fichier
            const inputStream = fs.createReadStream(inputFile, { start: startPosition, end: Math.min(startPosition + chunkSize - 1, totalSize - 1) });

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
        while ((chunkIndex * chunkSize) < totalSize) {
            await processChunk(chunkIndex * chunkSize);
        }

        // Écrire le fichier de plan pour le fichier principal
        await fs.promises.writeFile(`${outputFolder}/layout.json`, JSON.stringify(filePlan, null, 2));

        if (!dev_env) {
            // Supprimer l'original
            await fs.promises.unlink(inputFile);
            console.log(`✅ Fichier source "${inputFile}" supprimé après chiffrement.`);
        }

        console.log('✅ Chiffrement terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du chiffrement :', error);
    }
}



async function decryptFile(inputFolder, outputFile = 'temp/undefined', privateKey, passwd) {
    try {
        const filePlanPath = `${inputFolder}/layout.json`;
        const filePlan = JSON.parse(await fs.promises.readFile(filePlanPath, 'utf-8'));
        const sortedFiles = (await fs.promises.readdir(inputFolder))
                .filter(file => file.endsWith('.enc'))
                .sort((a, b) => {
                    // Extraire les numéros dans "partX.enc"
                    const aNum = parseInt(a.match(/\d+/)[0], 10);
                    const bNum = parseInt(b.match(/\d+/)[0], 10);
                    return aNum - bNum;
                });
            

        let aesKey = null;
        const outputStream = fs.createWriteStream(outputFile);
        const hash = crypto.createHash('sha256'); // Hash progressif

        for (let index = 0; index < sortedFiles.length; index++) {
            const file = sortedFiles[index];
            const inputFile = `${inputFolder}/${file}`;
            const inputStream = fs.createReadStream(inputFile);

            const chunkPlan = filePlan.chunks[index];
            const iv = Buffer.from(chunkPlan.iv, 'hex');

            // Déchiffrer la clé AES une seule fois
            if (!aesKey) {
                const encryptedAesKey = Buffer.from(filePlan.aesKey, 'hex');
                aesKey = crypto.privateDecrypt(
                    { key: privateKey, passphrase: passwd },
                    encryptedAesKey
                );
            }

            const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);

            console.log(`🔍 Décryptage du fichier : ${file}`);

            await new Promise((resolve, reject) => {
                inputStream.on('data', (chunk) => {
                    const decryptedChunk = decipher.update(chunk);
                    outputStream.write(decryptedChunk);
                    hash.update(decryptedChunk); // Mettre à jour le hash en direct
                });

                inputStream.on('end', async () => {
                    try {
                        const finalDecrypted = decipher.final();
                        outputStream.write(finalDecrypted);
                        hash.update(finalDecrypted); // Finaliser le hash aussi
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });

                inputStream.on('error', reject);
            });
        }

        outputStream.end();

        // Vérification de l'intégrité du fichier
        const decryptedFileHash = hash.digest('hex');
        console.log(`✅ Hash déchiffré : ${decryptedFileHash}`);
        console.log(`✅ Hash original : ${filePlan.originalFileHash}`);

        if (decryptedFileHash !== filePlan.originalFileHash) {
            throw new Error('Erreur : L\'intégrité du fichier est compromise (hash invalide)');
        }

        console.log(`✅ Déchiffrement terminé avec succès : ${outputFile}`);

    } catch (error) {
        console.error('❌ Erreur lors du déchiffrement du fichier :', error);
    }
}









async function verifyPassword(inputFolder, privateKey, passwd) {  

    try {
        // Lire le fichier de layout pour obtenir la clé AES chiffrée
        const layout = require(`${inputFolder}/witness_layout.json`);
        const encryptedAesKey = Buffer.from(layout.aesKey, 'hex'); // Assurez-vous que la clé est un Buffer

        // 🔥 Essayer de décrypter la clé AES avec la clé privée et le mot de passe
        const decryptedAesKey = crypto.privateDecrypt(
            {
                key: privateKey,
                passphrase: passwd,
            },
            encryptedAesKey
        );

        // Si le décryptage est réussi, cela signifie que le mot de passe est valide
        console.log('✅ Mot de passe valide');
        return true;
    } catch (err) {
        // Si erreur → mot de passe invalide
        console.log('❌ Mot de passe invalide ou erreur lors du décryptage :', err.message);
        return false;
    };

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
