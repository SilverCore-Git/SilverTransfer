
const fs = require('fs/promises');
const path = require('path');

async function viderDossier(dossier) {
    try {
        const fichiers = await fs.readdir(dossier);

        for (const fichier of fichiers) {
            const cheminComplet = path.join(dossier, fichier);
            const stats = await fs.lstat(cheminComplet);

            if (stats.isDirectory()) {
                await viderDossier(cheminComplet); 
                await fs.rmdir(cheminComplet);
            } else {
                await fs.unlink(cheminComplet);
            }
        }

        console.log(`Dossier vidé : ${dossier}`);
    } catch (err) {
        console.error(`Erreur lors du vidage du dossier : ${err}`);
    }
}

if (process.argv[2] == 'data') {
    if (process.argv[3] != 'force') {
        return console.log('Ce dossier est catégoriser comme vital !\npour le vider, ajoute l\'argument "force"');
    };
};

const dossier = path.join(__dirname, '../', process.argv[2]);
viderDossier(dossier);
