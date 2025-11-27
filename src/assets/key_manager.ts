const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class Key {

    async generate(id, passwd, opt = 'all') {
        const dirPath = path.join('key', 'live', id);
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });

            if (opt === 'all') {
                const { publicKey, privateKey } = await new Promise((resolve, reject) => {
                    crypto.generateKeyPair('rsa', {
                        modulusLength: 4096,
                        publicKeyEncoding: {
                            type: 'pkcs1',
                            format: 'pem',
                        },
                        privateKeyEncoding: {
                            type: 'pkcs8',
                            format: 'pem',
                            cipher: 'aes-256-cbc',
                            passphrase: passwd,
                        },
                    }, (err, publicKey, privateKey) => {
                        if (err) return reject(err);
                        resolve({ publicKey, privateKey });
                    });
                });

                await fs.promises.writeFile(path.join(dirPath, 'public_key.pem'), publicKey, 'utf8');
                await fs.promises.writeFile(path.join(dirPath, 'private_key.pem'), privateKey, 'utf8');
            }
            // (pareil pour 'public' et 'private')

            console.log(`✅ ${opt} clé générée pour l'id = ${id}`);
        } catch (err) {
            console.error(`❌ Erreur lors de la génération de la clé (${opt}) pour l'id = ${id} :\n${err}`);
        }
    }

    async remove(id, opt = 'all') {
        try {
            if (opt === 'all') {
                fs.rmSync(`key/live/${id}/public_key.pem`);
                fs.rmSync(`key/live/${id}/private_key.pem`);
                await fs.promises.rmdir(`key/live/${id}`);
            } else if (opt === 'private') {
                fs.rmSync(`key/live/${id}/private_key.pem`);
            } else if (opt === 'public') {
                fs.rmSync(`key/live/${id}/public_key.pem`);
            }

            console.log(`✅ Clé ${opt} bien supprimée ! id = ${id}`);
        } catch (err) {
            console.error(`❌ Une erreur est survenue lors de la suppression de la clé ${opt} pour l'id = ${id} :\n${err}`);
        }
    }

    async read(id, opt = 'all') {
        try {
            if (opt === 'all') {
                const publicKey = await fs.promises.readFile(`key/live/${id}/public_key.pem`, 'utf8');
                const privateKey = await fs.promises.readFile(`key/live/${id}/private_key.pem`, 'utf8');
                return { publicKey, privateKey };
            } else if (opt === 'private') {
                const key = await fs.promises.readFile(`key/live/${id}/private_key.pem`, 'utf8');
                return key;
            } else if (opt === 'public') {
                const key = await fs.promises.readFile(`key/live/${id}/public_key.pem`, 'utf8');
                return key;
            } else {
                console.error('Argument mal défini (key.read => key_manager l74)')
            }  
        } catch (err) {
            console.error(`❌ Erreur lors de la lecture de la clé ${opt} pour l'id = ${id} :\n${err}`);
        }
    }
}

module.exports = new Key();
