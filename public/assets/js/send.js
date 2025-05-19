/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

import { link, progressbar, valuetext, loader_end } from "./idclassloader.js";
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



export function send(FILE, passwd, id, ifpremium = false) {

    const fileInput = FILE
    const file = fileInput;

    if (!file) {
        return salert("Veuillez sélectionner un fichier avant d'envoyer !", 'error');
    }

    let maxSize;
    if (ifpremium) { maxSize = 16 * 1024 * 1024 * 1024; } // 16Go
    else { maxSize = 11 * 1024 * 1024 * 1024; } // 11Go

    if (file.size >= maxSize) { 
        return salert('Fichier trop volumineux !', 'error'); 
    }

    console.log("Envoi d'un fichier...");

    let startTime = null; // Variable pour stocker le temps de début
    const xhr = new XMLHttpRequest(); 
    xhr.responseType = 'json';

    let ifprmium = ifpremium ? 1 : 0;

    if (ifpremium = 1) {
        const expire_date = document?.getElementById('expire_date_input')?.value;
        xhr.open("POST", `/upload/file?passwd=${passwd}&id=${id}&premium=${ifprmium}&premium_expire_date=${expire_date}&user=ip`, true);
    } else {
        xhr.open("POST", `/upload/file?passwd=${passwd}&id=${id}&user=ip`, true);
    }
    

    xhr.upload.onprogress = (event) => {

        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)

            if (startTime) {
                const currentTime = Date.now()
                const elapsedTime = (currentTime - startTime) / 1000 // en secondes
                const speed = event.loaded / elapsedTime // octets par seconde
                const remainingBytes = event.total - event.loaded
                const estimatedTime = remainingBytes / speed // secondes restantes
                const minutes = Math.floor(estimatedTime / 60)
                const seconds = Math.floor(estimatedTime % 60)
                const timeString = `${minutes}m ${seconds}s`

                document.getElementById('statusl').innerText = `Envoi du fichier...`;
                document.getElementById('statusl2').innerText = `${timeString} restants`;
            } else {
                startTime = new Date();
                document.getElementById('statusl').innerText = `Envoi du fichier...`;
            }

            updateProgressBar(percent)
            console.log(`Progression : ${percent}%`);

            if (percent == 100) {
                
                setTimeout(() => {
                    document.getElementById('statusl').innerText = `Finalisation...`;
                    progressbar.style.display = 'none';
                    valuetext.style.display = 'none';
                    loader_end.style.display = 'block';
                }, 1000);

                setTimeout(() => {
                    const justLink = `https://www.silvertransfert.fr/t`;
                    const Link = justLink + '/' + id + '/' + passwd;
        
                    link.value = Link
                    const qr = new QRious({
                        element: document.getElementById('codeQR'),
                        value: Link,
                        size: 200
                    });
        
                    setTimeout(() => {
                        sendFile('close')
                        openform('success')
                        history.pushState(null, "", `?page=success&link=${justLink}&id=${id}&pass=${passwd}&file=1`);
                    }, 1000);
        
                }, 5000);

            }

        }
    };

    xhr.onload = async () => { 
        
        if (xhr.status === 200) {

            const data = xhr.response;
            console.log("Upload réussi :", data);

        } else {
            salert('Une erreur est survenue...', 'error')
            console.error("Erreur :", xhr.statusText);
        }
    };


    xhr.onerror = function(event) {
        salert('Erreur de connexion', 'error');
        console.error("Erreur de connexion : ", event);
        console.error("Détails de la requête : ", event.target);
        console.error("URL de la requête : ", xhr.responseURL);
        console.error("Status de la requête : ", xhr.status);
    };
    
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);

}



