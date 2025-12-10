import config from '../../config/config.json';
import fs from 'fs';
import path from 'path';
import db from '../../assets/database/db';
import copyFile from './assets/copyFolder';


export default class transferBackup
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

        if (!config.BACKUP) return;
        if (this.jobs_run)
        {
            console.error('[JOBS:transferBackup]: jobs already run.');
            return;
        }

        this.jobs_run = true;

        if (!config.BACKUP_DATA_DIR) {
            console.error('[JOBS:transferBackup]: config.BACKUP_DATA_DIR not defined.');
            this.jobs_run = false;
            return;
        }

        const transfers = await db.getDB();

        for (const transfer of transfers)
        {

            try {

                const outDir: string = path.join(this.BACKUP_DATA_DIR, transfer.cryptedFileName);
                const srcDir: string = path.join(__dirname, '../', config.DATAdir, transfer.cryptedFileName);
                copyFile(srcDir, outDir);

            }
            catch (err) {
                console.error('[JOBS:transferBackup]: an error ocured on backup a transfer : ', err);
                continue;
            }

        }
        
        console.log('[JOBS:transferBackup]: success');

    }

}

