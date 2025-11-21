export interface StatsPayload {
  browser: Record<string, number>;
  os: Record<string, number>;
  device: Record<string, number>;
  country: Record<string, number>;
  referrer: Record<string, number>;
  pages: Record<string, number>;
  unique: number;
}

export default class StatsClient {
    
    private api: string;

    constructor() {
        this.api = "https://www.silvertransfert.fr/api";
    }

    async create_session(type: string = "temp", premium: boolean = false): Promise<any> {
        const url = `${this.api}/session/create?type=${type}&premium=${premium ? "1" : "0"}`;

        try {
            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
            });
            return await res.json();
        } catch (e) {
            console.error("Erreur create_session :", e);
            return null;
        }
    }

    async verify_session(): Promise<any> {
        try {
            const res = await fetch(`${this.api}/session/verify`, {
                method: "GET",
                credentials: "include",
            });
            return await res.json();
        } catch (e) {
            console.error("Erreur verify_session :", e);
            return null;
        }
    }

    async close_session(): Promise<any> {
        try {
            const res = await fetch(`${this.api}/session/close`, {
                method: "GET",
                credentials: "include",
            });
            return await res.json();
        } catch (e) {
            console.error("Erreur close_session :", e);
            return null;
        }
    }

    detectStats(): StatsPayload {
        const ua = navigator.userAgent.toLowerCase();

        const browser: Record<string, number> = {};
        if (ua.includes("chrome")) browser.chrome = 1;
        else if (ua.includes("firefox")) browser.firefox = 1;
        else if (ua.includes("safari") && !ua.includes("chrome")) browser.safari = 1;

        const os: Record<string, number> = {};
        if (ua.includes("windows")) os.windows = 1;
        else if (ua.includes("mac")) os.macos = 1;
        else if (ua.includes("android")) os.android = 1;
        else if (ua.includes("iphone") || ua.includes("ios")) os.ios = 1;

        const device: Record<string, number> = {};
        if (/mobile|iphone|android/.test(ua)) device.mobile = 1;
        else device.desktop = 1;

        return {
            browser,
            os,
            device,
            country: {},
            referrer: { [document.referrer || "direct"]: 1 },
            pages: { [window.location.pathname]: 1 },
            unique: 1,
        };
    }

    async send(customStats: StatsPayload | null = null): Promise<any> {
        const stats = customStats || this.detectStats();

        try {
            const res = await fetch(`${this.api}/stats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(stats),
            });

            return await res.json();
        } catch (e) {
            console.error("Erreur send stats :", e);
            return null;
        }
    }

}
