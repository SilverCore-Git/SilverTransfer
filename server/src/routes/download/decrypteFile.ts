import type { Request } from "express";
import decryptFile from "../../assets/Crypter/DecryptFile";
import key from "../../assets/Crypter/key_manager";

export default async function
(
    {
        transferID,
        req,
        encryptedFilePath,
        decryptedFilePath,
        passwd
    }:
    {
        transferID: string,
        req: Request,
        encryptedFilePath: string,
        decryptedFilePath: string,
        passwd: string
    }
)
{

    try {

        const privateKey: string = await key.read(transferID, 'private') as string;

        await decryptFile({
            inputFolder: encryptedFilePath,
            outputFile: decryptedFilePath,
            privateKey,
            passwd
        });

    }
    catch(err) {
        console.error('Error on decrypt file for id=', transferID, ' | : ', err);
    }

}