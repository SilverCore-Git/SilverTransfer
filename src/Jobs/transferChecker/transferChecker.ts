import config from '../../config/config.json';
import path from 'path';
import 'dotenv/config';

import _ExpireManager from "./assets/ExpireManager";
import _DiskReporter from "./assets/DiskReporter";

const webhook: string = process.env.DISCORD_WEBHOOK || 'https://d.d';

const ExpireManager = new _ExpireManager();
const DiskReporter = new _DiskReporter(path.join(__dirname, '../..', config.DBFile), webhook);

export default () => {
    ExpireManager.run();
    DiskReporter.run();
}