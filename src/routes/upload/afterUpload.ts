import key from "../../assets/Crypter/key_manager";
import encryptFile from "../../assets/Crypter/EncryptFile";
import path from "path";
import type { Request } from "express";
import db from "../../assets/database/db";

export default async function
({ transferID, req }: { transferID: string, req: Request })
{

    if (!req.file) return;

    const { passwd } = req.body;

    // générate crypter key + define const
    await key.generate(transferID, passwd);
    const tempFilePath = req.file.path;
    const encryptedFileName = `${transferID}.${req.file.filename}.enc`;
    const encryptedFilePath = path.join(__dirname, `../${config.DATAdir}`, encryptedFileName);

    try {

        // get public key
        const public_key: string = await key.read(transferID, 'public') as string;

        // encrypte temp file
        await encryptFile({
            inputFile: tempFilePath,
            outputFolder: encryptedFilePath,
            publicKey: public_key
        });

        // update statu to ready to download
        const transfer = await db.get(transferID);
        if (!transfer) return;

        transfer.statu = 'ready';
        
        await db.update(transfer);

    }
    catch(err) {
        console.error('Error on afterUpload for id=', transferID, ' | : ', err);
    }

}