/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */


// divers
const body = document.querySelector('.body');
const loader = document.getElementById('loader');
const progress = document.querySelector('.progress');
const progressbar = document.getElementById('progressbar');
const flach = document.getElementById('flach');
const valuetext = document.getElementById('value');
const link = document.getElementById('linkInput');
const loader_end = document.querySelector('.loader-end');

// card :
const main = document.querySelector('.main');
const done = document.getElementById('done')
const upload = document.getElementById('upload')

// btn :
const gobtn = document.getElementById('go-btn');
const sendbtn = document.querySelector('.send-btn');
const btnsavoir = document.querySelector('.btn-savoir');
const file = document.getElementById('file')


export {
    body,
    main,
    link,
    gobtn,
    btnsavoir,
    upload,
    loader_end,
    file,
    valuetext,
    sendbtn,
    done,
    progress,
    flach,
    progressbar,
    loader
}