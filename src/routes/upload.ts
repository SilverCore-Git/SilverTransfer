// packages
import { Router } from "express";
const router = Router();
import multer from "multer";
import path from 'path';



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




router.get('/file', async (req, res) => {
    res.send('ok')
})

router.post('/file', upload.single("file"), async (req, res) => {


});


export default router;