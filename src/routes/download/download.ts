// packages
import { Router } from "express";
const router = Router();
import path from 'path';
import fs from 'fs';
import db from "../../assets/database/db";
import { Transfert } from "../../assets/database/dbTypes";


router.get('/download', (req, res) => {

    const { id, passwd }: { id: string, passwd: string } = req.body;

    

})

router.get('/decrypt', (req, res) => {

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