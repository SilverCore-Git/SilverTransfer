import key from "../../assets/Crypter/key_manager";
import encryptFile from "../../assets/Crypter/EncryptFile";
import db from "../../assets/database/db";

export default async function
(
    { 
        transferID, 
        tempFilePath, 
        encryptedFilePath
    }: 
    { 
        transferID: string, 
        tempFilePath: string, 
        encryptedFilePath: string
    })
{

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

        transfer.status = 'ready_to_decrypt';
        
        await db.update(transfer);

    }
    catch(err) {
        console.error('Error on afterUpload for id=', transferID, ' | : ', err);
    }

}