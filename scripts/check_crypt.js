// Le chiffrement est l'art d'encoder des informations : 
// À midi, l'agent 007 devra transmettre les coordonnées suivantes : 
// Latitude: 48.8566° N, Longitude: 2.3522° E. 

// "Attention !" cria-t-elle. "Ne divulguez rien, même sous la torture !"
// Mot de passe : p@ssW0rd!2025#Chiffrement_💻🔒
// Clé secrète : b@n4n3-C0c0nuts&Drag0n$fly

// Quelques caractères spéciaux pour tester : 
// ~`!@#$%^&*()-_=+[{]}\\|;:'",<.>/?

// Texte multi-lignes, avec des tabulations et des sauts de lignes :

// \tVoici une tabulation.
// \nVoici un saut de ligne.

// Fin du message. Terminé.




const fs = require('fs').promises;  // Utilisation de la version promise pour fs
const key = require('../src/key_manager.js');
const { decryptFile, encryptFile } = require("../src/crypt.js");

const fichierOriginal = 'scripts/crypt_test_origin.txt';
const fichierDechiffre = 'scripts/crypt_test_dec.txt';


async function name() {
    try {
        // Génération des clés
        await key.generate("0", `test~\`!@#$%^&*()-_=+[{]}\\|;:'",<.>/?`);

        // Lecture des clés publique et privée
        const public_key = await key.read("0", 'public');
        const privat_key = await key.read("0", 'private');

        // Chiffrement et déchiffrement des fichiers
        await encryptFile(fichierOriginal, 'temp/crypt_test_enc', public_key, true);
        await decryptFile('temp/crypt_test_enc', fichierDechiffre, privat_key, `test~\`!@#$%^&*()-_=+[{]}\\|;:'",<.>/?`);

        // Suppression du fichier temporaire de chiffrement
        await fs.rm('temp/crypt_test_enc', { recursive: true, force: true });

        // Suppression des clés générées
        await key.remove("0");

    } catch (err) {
        console.error("Erreur dans la fonction 'name' : ", err);
    }
}

async function unef() {
    try {
        // Lire le contenu des deux fichiers
        const contenuOriginal = await fs.readFile(fichierOriginal, 'utf8');
        const contenuDechiffre = await fs.readFile(fichierDechiffre, 'utf8');

        // Comparer les contenus
        if (contenuOriginal === contenuDechiffre) {
            console.log('✅ Succès : les fichiers sont identiques.');
        } else {
            console.log('❌ Erreur : les fichiers sont différents.');
        }
    } catch (err) {
        console.error("Erreur dans la fonction 'unef' : ", err);
    }
}

// Écriture du fichier de test
async function run() {
    try {
        
        // Exécuter le chiffrement et déchiffrement
        await name();

        // Comparer les fichiers
        await unef();
    } catch (err) {
        console.error("Erreur dans l'exécution principale : ", err);
    }
}

// Lancer l'exécution
run();
