// packages
import { Router } from "express";
const router = Router();
import multer from "multer";
import path from 'path';


import config from '../config/config.json';
import { loadDatabase, saveDatabase } from '../assets/database/db';
import { getCurrentDate, getCurrentTime } from '../assets/datemanager'
import { encryptFile, encryptText } from "../assets/crypt";
import session from '../assets/sessions_manager';
import key from '../assets/Crypter/key_manager';

let fileDatabase = {};
fileDatabase = loadDatabase();


const uploadDir = path.join(__dirname, '../', config.TEMPdir);

// Configuration de Multer pour stocker les fichiers sur disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const encryptedText = encryptText(file.originalname);
        const fileExt = path.extname(file.originalname);
        const newFileName = `${encryptedText}${fileExt}`;
        cb(null, newFileName);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 16 * 1024 * 1024 * 1024 // 16 Go
    }
 });


router.get('/create/id', async (req, res) => {

    if (req.hostname === config.hostname) {

        console.log("📥 Réception d'une requête : ", `' /upload/create/id '`);

        fileDatabase = loadDatabase();

        if (req.query.premium == 1) {

            let id = null;
            let length = 2;
            
            while (length <= 6 && id === null) {
              for (let i = 0; i < 1000; i++) {
                let randomNumber = Math.floor(Math.random() * Math.pow(10, length));
                let candidateId = randomNumber.toString().padStart(length, '0');
            
                if (fileDatabase[candidateId] === undefined) {
                  id = candidateId;
                  break;
                }
              }
              length++;
            }
            
            if (id === null) {
              throw new Error("Aucune ID libre trouvée jusqu’à 6 chiffres !");
            }     
    
            return res.json({
                status: "success",
                id
            });

        } else {

            let id = null;
            let length = 8;
            
            while (length <= 20 && id === null) {
              for (let i = 0; i < 10000; i++) {
                let randomNumber = Math.floor(Math.random() * Math.pow(10, length));
                let candidateId = randomNumber.toString().padStart(length, '0');
            
                if (fileDatabase[candidateId] === undefined) {
                  id = candidateId;
                  break;
                }
              }
              length++;
            }
            
            if (id === null) {
              throw new Error("Aucune ID libre trouvée jusqu’à 20 chiffres !");
            }  

            return res.json({
                status: "success",
                id
            });

        }

    } else {
        res.status(403).json({ message: "Accès interdit" });
    }

});

router.get('/file', async (req, res) => {
    res.send('ok')
})

router.post('/file', upload.single("file"), async (req, res) => {

    const user_id = req.cookies.user_id;

    // if (req.hostname === config.hostname) {

        console.log("📥 Réception d'une requête : ", `/upload/file`);

        fileDatabase = loadDatabase();

        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier reçu" });
        }

        let ifpremium = req.query.premium || null == 1 ? true : false;
        const premium_expire_date = req.query.premium_expire_date || 15;
        const fileID = req.query.id;
        const passwd = req.query.passwd;
        let user = req.query.user; if (user == 'ip') { user =  req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || req.ip; };
        await key.generate(fileID, passwd);
        const tempFilePath = req.file.path;  // Chemin du fichier temporaire sauvegardé par Multer
        const encryptedFileName = `${fileID}.${req.file.filename}.enc`;
        const encryptedFilePath = path.join(__dirname, `../${config.DATAdir}`, encryptedFileName);

        res.json({
            status: "processing",
            message: "Fichier reçu, chiffrement en cours...",
            id: fileID,
            premium: ifpremium
        });

        console.log('Fichier reçu, chiffrement en cours...');

        try {

            const public_key = await key.read(fileID, 'public');
            await encryptFile(tempFilePath, encryptedFilePath, public_key);

            // await session.create('transfert', {
            //     premium: ifpremium,
            //     premium_parms: ifpremium ? {
            //         premium_expire_date
            //     } : null,
            //     id: fileID,
            //     size: req.file.size
            // }, user_id);    

            fileDatabase[fileID] = {
                fileName: encryptedFileName,
                size: req.file.size,
                user: user || null,
                premium: ifpremium,
                premium_data: ifpremium ? {
                    expire_day: premium_expire_date
                } : null,
                date: `${getCurrentDate()} - ${getCurrentTime()}` 
            };
            await saveDatabase(fileDatabase);

            console.log('✅✅__Fichier enregistré ! ', `?id=${fileID}`);
        } catch (err) { 
            console.error("Erreur lors du chiffrement :", err);
        }

    // }

});


export default router;