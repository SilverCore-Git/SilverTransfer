// packages
import { Router } from "express";
const router = Router();
import multer from "multer";
import path from 'path';
import text_crypter from "../../assets/Crypter/Text_crypter";
import db from "../../assets/database/db";
import key from "../../assets/Crypter/key_manager";
import getClientIp from "../../assets/utils/getClientIp";
import { getCurrentDate, getCurrentTime } from "../../assets/utils/getDate";
import { Transfert } from "../../assets/database/dbTypes";
import afterUpload from "./afterUpload";

const uploadDir = path.join(__dirname, '../', config.TEMPdir);

// Configuration de Multer pour stocker les fichiers sur disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const encryptedText = text_crypter.encrypt(file.originalname);
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


router.post('/file', upload.single("file"), async (req, res) => {

    let { id, passwd }: { id: string, passwd: string } = req.body;
    const ip: string = getClientIp(req);

    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    console.log('New transfer : ', req.body.id);

    await key.generate(id, passwd);
    const tempFilePath: string = req.file.path;
    const encryptedFileName: string = `${id}.${req.file.filename}.enc`;
    const encryptedFilePath: string = path.join(__dirname, `../${config.DATAdir}`, encryptedFileName);
    const downloadPath: string = `https://t.silvertransfert.fr/${id}-${passwd}`;

    // remove passwd on ram
    passwd = 'AZERTYmlkj123';

    const transfer: Transfert = {
        UUID: req.body.id as string,
        cryptedFileName: encryptedFileName,
        tempFileName: path.basename(tempFilePath),
        size: req.file.size as number,
        senderIp: ip,
        date: `${getCurrentDate()} - ${getCurrentTime()}`,
        status: 'await_crypting'
    }

    await db.push(transfer);

    res.json({
        status: transfer.status,
        message: "Fichier reçu !",
        id,
        downloadPath
    });

    await afterUpload({
        transferID: id,
        encryptedFilePath,
        tempFilePath
    });

});


export default router;