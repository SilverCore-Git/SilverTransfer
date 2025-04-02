/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */


const path = require('path');
const fs = require('fs');
const config = require('../config/config.json');
const { loadDatabase, deleteFiledb } = require('../src/database.js');

 
async function verifyIfExpire() {

    console.log("🔄 Vérification des dates d'éxpiration des data");

    let database = {};
    database = loadDatabase();

    const now = new Date();
    const maxAge = config.expiretime * 24 * 60 * 60 * 1000; 

    let intdelFile = 0;
    let intError = 0;


    for (const id in database) {

        if (database[id].date) {

            const dateStr = database[id].date.split(" - ")[0]; // Extraire la partie date
            const entryDate = new Date(dateStr);
            
            if (isNaN(entryDate.getTime())) {

                console.error(`❌ Erreur lors de la vérification => Date invalide pour l'ID ${id} : ${database[id].date}`);

                intError++

            }
            
            if (now - entryDate > maxAge) {

                console.warn(`✅ Vérification => L'ID ${id} a une date dépassant 15 jours : ${database[id].date}`);

                const filePath = path.join( __dirname, 'data', database[id].fileName );
                await fs.promises.rm(filePath, { recursive: true, force: true });

                console.log(`🗑️ Vérification => Fichier supprimé ! ID : ${id}`);

                await deleteFiledb(id);

                intdelFile++
                
            }

        }

    }
    
    console.log(`🏁 Vérification terminer => Fichier suprimer : ${intdelFile}; Erreurs : ${intError}`);

}


module.exports = { verifyIfExpire };