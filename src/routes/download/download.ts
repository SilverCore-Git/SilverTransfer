// packages
import { Router } from "express";
const router = Router();
import path from 'path';
import fs from 'fs';
import db from "../../assets/database/db";
import { Transfert } from "../../assets/database/dbTypes";
import decrypteFile from "./decrypteFile";


router.get('/download', (req, res) => {

    const { id, passwd }: { id: string, passwd: string } = req.body;

    

})

router.get('/decrypt', async (req, res) => {

    const { id, passwd }: { id: string, passwd: string } = req.body;

    const transfer = await db.get(id);
    if (!transfer) return res.status(404).json({ error: true, message: 'transfer not found' });

    if (transfer.status == 'ready_to_download')
    {
        return res.json({ ready_to_download: true });
    }

    const encryptedFilePath = path.join(__dirname, "../data", transfer.cryptedFileName);
    const decryptedFilePath = path.join(__dirname, "../temp", transfer.tempFileName);

    res.json({ status: 'processing' });

    await decrypteFile({
        transferID: id,
        req,
        encryptedFilePath,
        decryptedFilePath,
        passwd
    });

})

router.get('/status', async (req, res) => {
    
    const id: string = req.body.id;

    const transfer: Transfert | undefined = await db.get(id);
    if (!transfer) return res.status(404).json({ message: 'Transfer not found', canBeDownload: false });
    
    res.json({
        id: transfer.UUID,
        canBeDownload: transfer.status == 'ready_to_download',
        canBeEncrypt: transfer.status == 'ready_to_decrypt'
    })

})


export default router;