import crypto from 'crypto';
import { Layout } from './CrypterTypes';
import fs from 'fs';

export default async function
({
    inputFile, 
    outputFolder = 'data/undefined', 
    publicKey, 
    dev_env = false
}:{
    inputFile: any, 
    outputFolder: string, 
    publicKey: string, 
    dev_env?: boolean
})
{

    try {

        const fileStats = await fs.promises.stat(inputFile);
        const totalSize = fileStats.size;
        const chunkSize = 100 * 1024 * 1024; // 100 mo / chunck

        // Créer un dossier de sortie si nécessaire
        await fs.promises.mkdir(outputFolder, { recursive: true });

        let chunkIndex = 0;
        let filePlan: Layout = {
            chunks: [],
            originalFileHash: '',
            aesKey: ''
        };

        // Générer une clé AES pour ce fichier
        const aesKey = crypto.randomBytes(32); // 32 bytes = AES-256
        const encryptedAesKey = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            aesKey
        );

        // Calculer le hash sans charger tout le fichier en RAM
        const hash = crypto.createHash('sha256');
        await new Promise((resolve, reject) => {
            const hashStream = fs.createReadStream(inputFile);
            hashStream.on('data', (chunk: any) => {
                hash.update(chunk);
            });
            hashStream.on('end', () => {
                filePlan.originalFileHash = hash.digest('hex');
                filePlan.aesKey = encryptedAesKey.toString('hex');
                resolve(null);
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
        async function processChunk(startPosition: number)
        {
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
                inputStream.on('data', (chunk: any) => {
                    const encryptedChunk = cipher.update(chunk);
                    output.write(encryptedChunk);
                });

                inputStream.once('end', () => {
                    const finalEncrypted = cipher.final();
                    output.write(finalEncrypted);
                    output.end();
                    console.log(`✅ Partie ${chunkIndex} chiffrée avec succès : ${outputFile}`);
                    chunkIndex++;
                    resolve(null);
                });

                inputStream.once('error', reject);
                output.once('error', reject);
            });
        }

        // Boucle de découpage
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