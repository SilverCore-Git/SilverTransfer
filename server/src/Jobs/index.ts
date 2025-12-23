import cron from "node-cron";
import run from "./run";

// all days to 1our
cron.schedule("0 1 * * *", () => {
    run();
});
