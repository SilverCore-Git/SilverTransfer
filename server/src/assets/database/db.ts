import fs from "fs";
const fsp = fs.promises;
import path from "path";

import config from '../../config/config.json';
import type { Transfert } from "./dbTypes";

const DB_FILE = path.join(__dirname, '../../', config.DBFile);


class db 
{
    
    public async getDB(): Promise<Transfert[]>
    {

        let db: Transfert[];

        if (!fs.existsSync(DB_FILE)) db = [];
        db = JSON.parse(await fsp.readFile(DB_FILE, 'utf-8'));

        return db;

    }

    private async saveDB(db: Transfert[]): Promise<void>
    {
        await fsp.writeFile(DB_FILE, JSON.stringify(db), 'utf-8');
    }


    public async push(tr: Transfert): Promise<void>
    {
        const db = await this.getDB();

        db.push(tr);

        await this.saveDB(db);
    }

    public async get(uuid: string): Promise<Transfert | undefined>
    {

        const db = await this.getDB();

        const transfert: Transfert | undefined = db.find(transfert => transfert.UUID === uuid);

        return transfert;

    }

    public async update(transfer: Transfert)
    {

        await this.delete(transfer.UUID);

        await this.push(transfer);

    }

    public async delete(uuid: string): Promise<void>
    {

        const db = await this.getDB();

        const newDb = db.filter(tr => tr.UUID !== uuid);

        await this.saveDB(newDb);

    }


    public async resetDB(): Promise<void>
    {
        await this.saveDB([]);
    }

}


export default new db();