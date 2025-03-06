/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

import { loader, file, sendbtn, btnsavoir, gobtn, main, upload, progressbar, progress, flach, done } from './assets/js/idclassloader.js';
import { salert } from './assets/js/salert.js';
import { send } from './assets/js/send.js';
import popups from './popups.js';



main.style.display = 'none';
upload.style.display = 'none';
progress.style.display = 'none';
done.style.display = 'none'; 

function openLoader() {
    loader.style.display = 'flex'
};

function closeLoader() {
    loader.style.display = 'none'
};

function openmain() {
    main.style.display = 'flex'
};
function closemain() {
    main.style.display = 'none'
};

function openform(page) {

    if (page === 'upload') {

        upload.style.display = 'flex'
    
    }
    else if (page === 'success') {
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
function sendFile(arg) {
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


let selectedFile = null; 

async function loadApp() {
    btnsavoir.addEventListener('click', () => {
        salert('Fonction en développement !', 'warning');
    });

    gobtn.addEventListener('click', async () => {
        openLoader();
        await closemain();
        await openform('upload');
        closeLoader();
    });

    const dropZone = document.getElementById('dropZone');
    const fileInfo = document.getElementById('p');

    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.style.backgroundColor = '#f0f8ff';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.backgroundColor = '';
    });

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.style.backgroundColor = '';

        const sendBtn = document.querySelector('.send-btn');
        sendBtn.style.display = 'flex';
        setTimeout(() => {
            sendBtn.style.opacity = 1;
        }, 10);

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            selectedFile = files[0]; 
            fileInfo.innerText = `Fichier sélectionné : ${selectedFile.name}`;
        }
    });

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
        await sendFile('close')
        await openform('success')
        
    });

    setTimeout(() => {
        openmain();
        closeLoader();
    }, 500);
}

openLoader();
loadApp();
