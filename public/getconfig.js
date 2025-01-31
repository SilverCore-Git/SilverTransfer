/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

const config = 'https://corsproxy.io/https://api.silverdium.fr/SilverConfig/maintenance.json';

fetch(config)
    .then(response => {
        if (!response.ok) {
            console.error('Erreur lors du fetch de config :', response.status, ' - ', response.statusText);
        }
        return response.json();
    })
    .then(data => { 
        console.log('maintenance : ', data.mtn_transfer)
        if (data.mtn_transfer) {
            window.location.href = "https://api.silverdium.fr/maintenance";
        }
    })
    .catch(error => {
        console.error(`Une erreur est survenue : ${error}`);
    });

function tipeee() {
    document.getElementById('footer').style.display = 'none'
    window.location.href = 'https://tipeee.com/silverdium'
}
function silvercore() {
    document.getElementById('footer').style.display = 'none'
    window.location.href = 'https://core.silverdium.fr'
}