/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

const htostname = "https://t.silverdium.fr";

function updateProgressBar(value) {
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");

    // S'assurer que la valeur est entre 1 et 100
    value = Math.min(100, Math.max(1, value));

    progressBar.style.width = value + "%";
    progressText.textContent = value + "%";

    // Changer le dégradé de couleur dynamiquement
    progressBar.style.background = `linear-gradient(90deg, hsl(${value * 1.2}, 100%, 50%), #00ff88)`;

    // Ajout d'un effet lumineux à 100%
    if (value === 100) {
        progressBar.style.boxShadow = "0 0 30px rgba(255, 255, 0, 1)";
    } else {
        progressBar.style.boxShadow = "0 0 15px rgba(0, 255, 255, 0.8)";
    }
}

function sendFile() {
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Veuillez sélectionner un fichier avant d'envoyer !");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Envoi d'un fichier...");
    document.querySelector('.upload').style.display = "none";
    document.querySelector('.loader').style.display = "block";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${htostname}:84/upload/yourmother`, true);

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const progressValue = Math.round((event.loaded / event.total) * 100);
            console.log(`Progression : ${progressValue}%`);
            updateProgressBar(progressValue);
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log("Upload réussi :", data);
            document.getElementById('confirmbox').innerHTML = `<strong><h2 style="color: rgb(35, 209, 151)">${data.message}</h2></strong>`;
            document.getElementById('urlInput').value = `${htostname}:84/t/${data.id}`;

            document.querySelector('.loader').style.display = "none";
            document.querySelector('.download').style.display = "flex";

            // Forcer la barre de progression à 100% à la fin
            updateProgressBar(100);
        } else {
            console.error("Erreur :", xhr.statusText);
            document.getElementById('confirmbox').innerHTML = `<strong><h2 style="color: rgb(192, 21, 21);">${xhr.statusText}</h2></strong>`;
        }
    };

    xhr.onerror = () => {
        console.error("Erreur de connexion");
        document.getElementById('confirmbox').innerHTML = `<h2 style="color: red">Erreur de connexion</h2>`;
    };

    xhr.send(formData);
}

document.getElementById("send").addEventListener('click', sendFile);


// Fonction pour copier l'URL dans le presse-papier
document.getElementById('copyButton').addEventListener('click', () => {
    const urlInput = document.getElementById('urlInput');

    if (urlInput.value) {
        urlInput.select();
        urlInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
    } else {
        alert("ERREUR : Aucune URL à copier.");
    }
});
