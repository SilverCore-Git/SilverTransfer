import checkDiskSpace from "check-disk-space";
import fs from "fs";
import path from "path";
import axios from "axios";
import { dev } from '../../../../package.json';

export default class DiskReporter {
        
    private dbPath: string;
    private webhookUrl: string;

    constructor(dbPath: string, webhookUrl: string) {
        this.dbPath = dbPath;
        this.webhookUrl = webhookUrl;
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return "0 o";
        const sizes = ["o", "Ko", "Mo", "Go", "To", "Po"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
    }

    private loadDatabase(): any[] {
        const fullPath = path.resolve(this.dbPath);
        const raw = fs.readFileSync(fullPath, "utf-8");
        return Object.values(JSON.parse(raw));
    }

    private async buildReport(): Promise<any> {
        const entries = this.loadDatabase();
        const totalTransfers = entries.length;

        // Total storage used by transfers
        let totalSize = 0;
        for (const entry of entries) {
            totalSize += entry.size || 0;
        }

        // Disk info
        const disk = await checkDiskSpace(dev ? "C:\\Users\\felix\\OneDrive\\Documents\\SilverCore\\app\\SilverTransfert\\app\\dist\\data" : "/mnt/data");

        // Formatting
        const totalSizeFormatted = this.formatBytes(totalSize);
        const diskSizeFormatted = this.formatBytes(disk.size);
        const freeSizeFormatted = this.formatBytes(disk.free);
        const percentUsed = ((totalSize / disk.size) * 100).toFixed(2) + "%";

        const timestamp = Math.floor(Date.now() / 1000);

        // Embed Discord
        return {
            embeds: [
                {
                    title: "📦 Rapport Silvertransfert — Stockage",
                    color: 0x0099ff, // Bleu
                    fields: [
                        { name: "🗂️ Nombre de transferts", value: `${totalTransfers}`, inline: true },
                        { name: "💾 Taille totale utilisée", value: `${totalSizeFormatted}`, inline: true },
                        { name: "\u200B", value: "\u200B", inline: false }, // ligne vide
                        { name: "🖥️ Disque", value: '', inline: false },
                        { name: "Taille totale", value: `${diskSizeFormatted}`, inline: true },
                        { name: "Libre", value: `${freeSizeFormatted}`, inline: true },
                        { name: "Utilisation estimée", value: `${percentUsed}`, inline: true },
                    ],
                    footer: {
                        text: `Rapport généré`,
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };
    }

    private async sendToDiscord(payload: any) {
        await axios.post(this.webhookUrl, payload);
    }

    public async run() {
        try {
            console.log("📡 Génération du rapport SilverTransfer...");
            const report = await this.buildReport();
            await this.sendToDiscord(report);
            console.log("✅ Rapport envoyé avec succès !");
        } catch (err) {
            throw new Error(`❌ Erreur lors du rapport : ${err}`);
        }
    }

}
