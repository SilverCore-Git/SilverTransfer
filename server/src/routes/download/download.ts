// packages
import { Router } from "express";
const router = Router();
import path from 'path';
import fs from 'fs';
import db from "../../assets/database/db";
import { Transfert } from "../../assets/database/dbTypes";
import decrypteFile from "./decrypteFile";
import VerifyPasswd from "../../assets/Crypter/VerifyPasswd";
import key from "../../assets/Crypter/key_manager";
import downloadFile from "./downloadFile";


router.get('/download', async (req, res) => {

    const { id, passwd }: { id: string, passwd: string } = req.body;

    const transfer = await db.get(id);
    if (!transfer) return res.status(404).json({ error: true, message: 'transfer not found' });

    const encryptedFilePath = path.join(__dirname, "../data", transfer.cryptedFileName);
    const decryptedFilePath = path.join(__dirname, "../temp", transfer.tempFileName);
    const privateKey: string = await key.read(id, 'private') as string;

    const verifyPasswd: boolean = VerifyPasswd(
        encryptedFilePath,
        privateKey,
        passwd
    );

    if (!verifyPasswd) {
        res.status(400).json({ message: 'Invalid password' })
        return;
    }

    try {
        await fs.promises.access(decryptedFilePath);   // verify exist file
    } catch (e) {
        return res.status(404).json({ error: true, message: 'File not found' });
    }
    
    return await downloadFile({
        decryptedFilePath,
        res
    });


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
    const privateKey: string = await key.read(id, 'private') as string;

    const verifyPasswd: boolean = VerifyPasswd(
        encryptedFilePath,
        privateKey,
        passwd
    );

    if (!verifyPasswd) {
        res.status(400).json({ message: 'Invalid password' })
        return;
    }

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