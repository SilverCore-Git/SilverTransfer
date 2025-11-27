import crypto from 'crypto';

export default function (inputFolder: string, privateKey: string, passwd: string)
{  

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
        return true;

    } catch (err) {
        // Si erreur → mot de passe invalide
        return false;
    };

}