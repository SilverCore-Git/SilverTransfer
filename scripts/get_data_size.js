

const db = require('../db/database.json');

console.log('Démarage du scirpt')

const objet = Object.values(db);

let size = 0

console.log("Lancement de la boucle for")
for (let i = 0; i < objet.length ; i++) {

    size = size + objet[i].size || size;

    console.log(`taille ${i} = ${objet[i].size}, size = ${size}`);
    
};

function formatBytes(bytes) {
    if (bytes === 0) return '0 o';

    const sizes = ['o', 'Ko', 'Mo', 'Go', 'To', 'Po'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    const value = bytes / Math.pow(1024, i);
    return value.toFixed(2) + ' ' + sizes[i];
}

console.log('size data = ', formatBytes(size));