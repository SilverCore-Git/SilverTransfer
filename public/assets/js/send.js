/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

import { link, progressbar, valuetext } from "./idclassloader.js";
import { sendFile, openform } from "../../index.js";
import { salert } from "./salert.js";


function updateProgressBar(value) {
    const progressBar = progressbar;
    const progressText = valuetext;

    value = Math.min(100, Math.max(0, value)); 
    progressBar.value = value;
    progressText.innerText = value + "%";

    if (value === 100) {
        progressBar.style.boxShadow = "0 0 30px rgba(255, 255, 0, 1)";
    } else {
        progressBar.style.boxShadow = "0 0 15px rgba(0, 255, 255, 0.8)";
    }
}



export function send(FILE) {

    const fileInput = FILE
    const file = fileInput.files[0];

    if (!file) {
        salert("Veuillez sélectionner un fichier avant d'envoyer !", 'error');
        return;
    }

    const maxSize = 10024 * 1024 * 1024; // 1024Mo
    if (file.size >= maxSize) { 
        salert('Fichier trop volumineux !', 'error'); 
        return; 
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Envoi d'un fichier...");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/upload/yourmother`, true);

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const progressValue = Math.round((event.loaded / event.total) * 100);
            console.log(`Progression : ${progressValue}%`);
            updateProgressBar(progressValue);
        }
    };

    xhr.onload = async () => { 
        
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log("Upload réussi :", data);

            let delay;
            if (file.size < 1024 * 1024 * 1024) {
                delay = 1000;
            } else if (file.size > 1024 * 1024 * 1024) {
                delay = 3000;
            } else if (file.size > 5024 * 1024 * 1024) {
                delay = 6000;
            }

            setTimeout(() => {
                document.getElementById('statusl').innerText = 'Vérification...';
            }, delay);


            const Link = `https://t.silverdium.fr/t/${data.id}`
            link.value = Link
            const qr = new QRious({
                element: document.getElementById('codeQR'),
                value: Link,
                size: 200
            });

            updateProgressBar(100);

            sendFile('close')
            openform('success')

        } else {
            console.error("Erreur :", xhr.statusText);
            salert('Une erreur est survenue...', 'error')
        }
    };


    xhr.onerror = function(event) {
        console.error("Erreur de connexion : ", event);
        console.error("Détails de la requête : ", event.target);    
        salert('Erreur de connexion', 'error')
    };

    xhr.send(formData);

}



