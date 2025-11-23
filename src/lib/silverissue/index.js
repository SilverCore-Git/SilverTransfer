const Webhook = require("./src/webhook.js");
const webhook = new Webhook('https://discord.com/api/webhooks/1441721233275355257/iFMyXCCPobM7VC2uRg5RXna4uC4CWPA---Q2VTIGVeo4o8BtotIiCpqXxxR-ZywgjIK2');
process.on("uncaughtException", async (error) => {
    console.error("Erreur non gérée :", error);
    await webhook.sendError(error, "uncaughtException");
});
process.on("unhandledRejection", async (reason) => {
    console.error("Rejet non géré :", reason);
    await webhook.sendError(reason, "unhandledRejection");
});
const SilverIssueMiddleware = (err, req, res, next) => {
    webhook.sendError(err, `Route : ${req.method} ${req.url}`);
    next();
};
webhook.sendMessage('SilverIssue loaded !');
module.exports = { webhook, SilverIssueMiddleware };
