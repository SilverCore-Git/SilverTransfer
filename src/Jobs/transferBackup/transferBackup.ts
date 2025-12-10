import config from '../../config/config.json';
import fs from 'fs';
import path from 'path';
import db from '../../assets/database/db';
import copyFile from './assets/copyFolder';


class transferBackup
{

    private jobs_run: boolean;
    private BACKUP_DATA_DIR: string;

    constructor ()
    {

        this.jobs_run = false;
        this.BACKUP_DATA_DIR = '';

        if (config.BACKUP_DATA_DIR) {
            this.BACKUP_DATA_DIR = path.join(config.BACKUP_DATA_DIR);
        }

    }

    public isRun ()
    {
        return this.jobs_run;
    }


    public async run ()
    {

        if (!config.BACKUP) {
            console.log('[JOBS:transferBackup]: backup disabled in config.');
            return;
        }
        if (this.jobs_run)
        {
            console.error('[JOBS:transferBackup]: jobs already run.');
            return;
        }

        this.jobs_run = true;
        console.log('[JOBS:transferBackup]: starting backup process...');

        if (!config.BACKUP_DATA_DIR) {
            console.error('[JOBS:transferBackup]: config.BACKUP_DATA_DIR not defined.');
            this.jobs_run = false;
            return;
        }

        console.log(`[JOBS:transferBackup]: backup directory: ${this.BACKUP_DATA_DIR}`);

        const transfers = await db.getDB();
        console.log(`[JOBS:transferBackup]: found ${transfers.length} transfers to backup`);

        let successCount = 0;
        let failCount = 0;

        for (const transfer of transfers)
        {

            try {

                const outDir: string = path.join(this.BACKUP_DATA_DIR, transfer.cryptedFileName);
                const srcDir: string = path.join(__dirname, '../', config.DATAdir, transfer.cryptedFileName);
                
                console.log(`[JOBS:transferBackup]: backing up transfer: ${transfer.cryptedFileName}`);
                console.log(`[JOBS:transferBackup]: from ${srcDir} to ${outDir}`);
                
                copyFile(srcDir, outDir);
                
                console.log(`[JOBS:transferBackup]: successfully backed up: ${transfer.cryptedFileName}`);
                successCount++;

            }
            catch (err) {
                console.error(`[JOBS:transferBackup]: failed to backup transfer ${transfer.cryptedFileName}:`, err);
                failCount++;
                continue;
            }

        }
        
        console.log(`[JOBS:transferBackup]: backup complete - Success: ${successCount}, Failed: ${failCount}`);

    }

}

export default new transferBackup();