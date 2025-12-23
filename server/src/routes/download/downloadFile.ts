import type { Response } from "express";
import mime from "mime-types";
import fs from 'fs';
import path from 'path';

export default async function
(
    {
        res,
        decryptedFilePath
    }:
    {
        res: Response,
        decryptedFilePath: string
    }
)
{

    const filename = path.basename(decryptedFilePath);
    const stat = await fs.promises.stat(decryptedFilePath);

    const mimeType = mime.lookup(filename) || 'application/octet-stream';

    // res headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.setHeader('Cache-Control', 'no-store');
        

    try {
        const stream = fs.createReadStream(decryptedFilePath);

        stream.on('open', () => {
            stream.pipe(res);
        });

        stream.on('error', (err: any) => {
            console.error('❌ Error on file stream :', err);
            if (!res.headersSent) {
                res.status(500).json({
                    error: true,
                    message: { silver: 'Error on send a file' }
                });
            }
        });

        res.on('close', async () => {
            if (!res.writableEnded) {
                console.warn("⚠️ Download interrupted (client closed connection)");
                stream.destroy();
            }

            try {
                await fs.promises.unlink(decryptedFilePath);
                console.log("🗑️ Temp file deleted !");
            } catch (err: any) {
                console.warn("❌ Cannot delete temp file :", err.message);
            }
        });

    } catch (err: any) {
        console.error("An error occured : ", err);
        if (!res.headersSent) {
            return res.status(500).json({
                error: true,
                message: { silver: 'An error occured.', server: err.message }
            });
        }
    }

}