import { background } from '/assets/js/background.js';

background();
setInterval(() => {
    background();
}, 10000);