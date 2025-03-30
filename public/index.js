/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

import { loader, file, sendbtn, btnsavoir, gobtn, main, upload, progressbar, link, progress, flach, done } from './assets/js/idclassloader.js';
import { salert } from './assets/js/salert.js';
import { send } from './assets/js/send.js';
import popups from './popups.js';

const urlParams = new URLSearchParams(window.location.search);
const ifdev = urlParams.get('dev');
const page = urlParams.get('page');
const salerttest = urlParams.get('salerttest');


if (ifdev == 1) {

    history.pushState(null, "", `?dev=1`);

    main.style.display = 'flex';
    upload.style.display = 'flex';
    progress.style.display = 'flex';
    done.style.display = 'flex';
 
    const Link = `lien de téléchargement`
    link.value = Link
    const qr = new QRious({
        element: document.getElementById('codeQR'),
        value: Link,
        size: 200
    });

}

else {

    main.style.display = 'none';
    upload.style.display = 'none';
    progress.style.display = 'none';
    done.style.display = 'none';

    if (salerttest == 1) {
        salert('Une alert test', 'success')
    } 

    history.pushState(null, "", `?page=home`);

}

function openLoader() {
    history.pushState(null, "", `?page=loader`);
    loader.style.display = 'flex'
};

function closeLoader() {
    loader.style.display = 'none'
};

function openmain() {
    history.pushState(null, "", `?page=home`);
    main.style.display = 'flex'
};

function closemain() {
    main.style.display = 'none'
};

export function openform(page) {

    if (page === 'upload') {

        history.pushState(null, "", `?page=upload`);
        upload.style.display = 'flex'
    
    }
    else if (page === 'success') {
        history.pushState(null, "", `?page=success`);
        done.style.display = 'flex'
    }

};
function closeform(page) {

    if (page === 'upload') {

        upload.style.display = 'none'
    
    }
    else if (page === 'success') {
        done.style.display = 'none'
    }

};

function setFlach() {
    const randomAlert = popups[Math.floor(Math.random() * popups.length)];
    flach.innerHTML = randomAlert;
}
export function sendFile(arg) {
    if (arg === 'close') {

        progress.style.display = 'none';

    } else if (arg === 'open') {

        progress.style.display = 'flex';
        
        setFlach();

        setInterval(() => {
            setFlach();
        }, 7000);
        
    }
};


function roots() {

    if (page === 'home') {
        openmain();
        return
    }

    else if (page === 'loader') {
        openLoader();
    }

    else if (page === 'upload') {
        openform(page);
        return
    }

    else if (page === 'send') {
        openform('upload');
        return
    }

    else if (page === 'success') {

        const ifisfile = urlParams.get('file');

        if (ifisfile == 1) {

            openLoader();

            const justlink = urlParams.get('link');
            const anid = urlParams.get('id');

            const Link = justlink + anid
            link.value = Link
            const qr = new QRious({
                element: document.getElementById('codeQR'),
                value: Link,
                size: 200
            });

            openform(page)

            history.pushState(null, "", `?page=success&link=${justlink}&id=${anid}&file=1`);

        } else {
            openmain();
        }

    }

    else {
        openmain();
    }
 
}


let selectedFile = null; 

async function loadApp() {

    btnsavoir.addEventListener('click', () => {
        window.open('https://core.silverdium.fr/#services', '_blank')
    });

    gobtn.addEventListener('click', async () => {
        openLoader();
        await closemain();
        await openform('upload');
        closeLoader();
    });

    const dropZone = document.getElementById('dropZone');
    const fileInfo = document.getElementById('p');
        // non fonctionel
    // dropZone.addEventListener('dragover', (event) => {
    //     event.preventDefault();
    //     dropZone.style.backgroundColor = '#f0f8ff';
    // });

    // dropZone.addEventListener('dragleave', () => {
    //     dropZone.style.backgroundColor = '';
    // }); 

    // dropZone.addEventListener('drop', (event) => {
    //     event.preventDefault();
    //     dropZone.style.backgroundColor = '';

    //     const sendBtn = document.querySelector('.send-btn');
    //     sendBtn.style.display = 'flex';
    //     setTimeout(() => {
    //         sendBtn.style.opacity = 1;
    //     }, 10);

    //     const files = event.dataTransfer.files;
    //     if (files.length > 0) {
    //         selectedFile = files[0]; 
    //         fileInfo.innerText = `Fichier sélectionné : ${selectedFile.name}`;
    //     }
    // });

    sendbtn.addEventListener('click', async () => {
        if (!selectedFile && !file.files.length) {
            salert('Aucun fichier sélectionné !', 'error');
            return;
        }

        await closemain();
        await closeform('upload');
        await sendFile('open');
        if (selectedFile) {
            await send([selectedFile]);
        } else {
            await send(file);
        }
        setTimeout(() => {
            
            if (progressbar.value < 2) {

                salert('Une erreur est survenue !', 'error')

            }

        }, 1000);
        
    });

}


roots();
loadApp();
closeLoader();
