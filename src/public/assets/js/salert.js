/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */


export function salert(text, type) {
    Swal.fire({
        title: 'SilverTransfer',
        html: text,
        icon: type,
        confirmButtonText: 'Ok !',
        background: '#f0f0f0',
        color: '#333',
        confirmButtonColor: '#ff4090',
        timer: (789 * 789)*789,
        showClass: {
            popup: 'animate__animated animate__fadeIn'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut'
        }
    });
}