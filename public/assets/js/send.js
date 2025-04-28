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



export function send(FILE, passwd) {

    const fileInput = FILE
    const file = fileInput;

    if (!file) {
        return salert("Veuillez sélectionner un fichier avant d'envoyer !", 'error');
    }

    const maxSize = 10024 * 1024 * 1024; // 10Go
    if (file.size >= maxSize) { 
        return salert('Fichier trop volumineux !', 'error'); 
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Envoi d'un fichier...");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/upload/file?passwd=${passwd}`, true);

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const progressValue = Math.round((event.loaded / event.total) * 100);
            console.log(`Progression : ${progressValue}%`);
            updateProgressBar(progressValue);

            if (progressValue === 100) {
                
                setTimeout(() => {
                    document.getElementById('statusl').innerText = 'Envoie du fichier...';
                    progressbar.style.display = 'none';
                    valuetext.style.display = 'none';
                    loader_end.style.display = 'block';
                    
                }, 500);

            }

        }
    };

    xhr.onload = async () => { 
        
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log("Upload réussi :", data);

            document.getElementById('statusl').innerText = 'Vérification...';
            setTimeout(() => {
            }, 1000);


            const justLink = `https://www.silvertransfert.fr/t`;
            const id = data.id;
            const Link = justLink + '/' + id + '/' + passwd;

            link.value = Link
            const qr = new QRious({
                element: document.getElementById('codeQR'),
                value: Link,
                size: 200
            });

            updateProgressBar(100);

            sendFile('close')
            openform('success')

            return history.pushState(null, "", `?page=success&link=${justLink}&id=${data.id}&pass=${passwd}&file=1`);

        } else {
            salert('Une erreur est survenue...', 'error')
            console.error("Erreur :", xhr.statusText);
        }
    };


    xhr.onerror = function(event) {
        salert('Erreur de connexion', 'error')
        console.error("Erreur de connexion : ", event);
        console.error("Détails de la requête : ", event.target);    
    };

    xhr.send(formData);

}



