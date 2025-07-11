/**
 * @author SilverCore
 * @author SilverPopups
 * @author MisterPapaye
 */

import popups from './popups.js'

function salert(text) {
    Swal.fire({
        title: 'Le savais-tu ?!',
        html: text,
        icon: 'info',
        confirmButtonText: 'Mais non !',
        background: '#f0f0f0',
        color: '#333',
        confirmButtonColor: '#ff4090',
        timer: 10000,
        showClass: {
            popup: 'animate__animated animate__fadeIn'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut'
        }
    });
}

const chanceToShowAlert = 0.2; 

const randomChance = Math.random();

if (randomChance < chanceToShowAlert) {
    const randomAlert = popups[Math.floor(Math.random() * popups.length)];
    salert(randomAlert)
}

