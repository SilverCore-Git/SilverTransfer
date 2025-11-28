import config from '../../config/config.json';

import _ExpireManager from "./assets/ExpireManager";
import _DiskReporter from "./assets/DiskReporter";

const webhook: string = process.env.DISCORD_WEBHOOK!;

const ExpireManager = new _ExpireManager();
const DiskReporter = new _DiskReporter(config.DBFile, webhook);

export default () => {
    ExpireManager.run();
    DiskReporter.run();
}