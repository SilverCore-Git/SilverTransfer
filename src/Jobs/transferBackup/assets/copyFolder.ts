import { promises as fs } from "fs";
import path from "path";


export default async function 
copyFolder(src: string, dest: string): Promise<void>
{

    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) 
    {

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // copie récursive
            await copyFolder(srcPath, destPath);
        } else {
            // copie simple
            await fs.copyFile(srcPath, destPath);
        }
    
    }

}
