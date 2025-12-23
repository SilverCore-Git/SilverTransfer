import fs from "fs";
import path from "path";
const fsp = fs.promises;

import db from "../../../assets/database/db";
import config from "../../../config/config.json";
import type { Transfert } from "../../../assets/database/dbTypes";

export default class ExpireManager {

    private EXPIRE_DAYS = config.expiretime;            // durée avant expiration
    private DELETE_AFTER_EXPIRE_DAYS = 10;              // durée avant suppression DB

    constructor() {}

    private toTimestamp(dateStr: string): number {
        const cleanDate = dateStr.split(" - ")[0];
        return new Date(cleanDate).getTime();
    }

    private async deleteFiles(tr: Transfert) {
        const folder = path.join(__dirname, "..", "data", tr.cryptedFileName);
        const tempFile = path.join(__dirname, "..", "data", tr.tempFileName);

        await fsp.rm(folder, { recursive: true, force: true });
        await fsp.rm(tempFile, { recursive: true, force: true });

        console.log(`🗑️ Fichiers supprimés pour ${tr.UUID}`);
    }

    private async markExpired(tr: Transfert): Promise<void> {
        tr.status = "expired";
        await db.update(tr);
        console.log(`⌛ Marqué comme expiré : ${tr.UUID}`);
    }


    public async run() {

        console.log("🔍 Lancement du ExpireManager...");

        const database = await this.getAll();
        const now = Date.now();

        let updated = 0;
        let deleted = 0;

        for (const tr of database) {

            const createdTs = this.toTimestamp(tr.date);
            if (isNaN(createdTs)) {
                console.error(`❌ Date invalide pour ${tr.UUID} : ${tr.date}`);
                continue;
            }

            const age = now - createdTs;
            const expireMs = this.EXPIRE_DAYS * 24 * 60 * 60 * 1000;
            const deleteMs = (this.EXPIRE_DAYS + this.DELETE_AFTER_EXPIRE_DAYS) * 24 * 60 * 60 * 1000;

            // Expiration
            if (age > expireMs && tr.status !== "expired") {
                console.log(`⚠️ Expiration détectée : ${tr.UUID}`);
                await this.deleteFiles(tr);
                await this.markExpired(tr);
                updated++;
                continue;
            }

            // Suppression 10 jours après expiration
            if (age > deleteMs && tr.status === "expired") {
                console.log(`💥 Suppression définitive de ${tr.UUID}`);
                await db.delete(tr.UUID);
                deleted++;
                continue;
            }

        }

        console.log(
            `🏁 ExpireManager terminé → Expirés mis à jour : ${updated} | Supprimés définitivement : ${deleted}`
        );
    }

    private async getAll(): Promise<Transfert[]> {
        const all: Transfert[] = [];
        const uuids = await this.listAllUUIDs();
        for (const id of uuids) {
            const tr = await db.get(id);
                if (tr) all.push(tr);
            }
        return all;
    }

    private async listAllUUIDs(): Promise<string[]> {
        const file = await fs.promises.readFile(path.join(__dirname, '../../..', config.DBFile), "utf-8");
        const arr: Transfert[] = JSON.parse(file);
        return arr.map(tr => tr.UUID);
    }

}
