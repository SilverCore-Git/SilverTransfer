import crypto from 'crypto';
import { Layout } from './CrypterTypes';
import fs from "fs";

export default async function
({
    inputFolder, 
    outputFile = 'temp/undefined', 
    privateKey, 
    passwd
}:{
    inputFolder: string, 
    outputFile: string, 
    privateKey: string, 
    passwd: string
})
{

    try {

        const filePlanPath = `${inputFolder}/layout.json`;
        const filePlan: Layout = JSON.parse(await fs.promises.readFile(filePlanPath, 'utf-8'));
        const sortedFiles = (await fs.promises.readdir(inputFolder))
                .filter((file: any) => file.endsWith('.enc'))
                .sort((a: any, b: any) => {
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
                inputStream.on('data', (chunk: any) => {
                    const decryptedChunk = decipher.update(chunk);
                    outputStream.write(decryptedChunk);
                    hash.update(decryptedChunk); // Mettre à jour le hash en direct
                });

                inputStream.on('end', async () => {
                    try {
                        const finalDecrypted = decipher.final();
                        outputStream.write(finalDecrypted);
                        hash.update(finalDecrypted); // Finaliser le hash aussi
                        resolve(null);
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