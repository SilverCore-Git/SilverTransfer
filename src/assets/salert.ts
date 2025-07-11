/**
 * @author SilverCore
 * @author SilverTransfer
 * @author MisterPapaye
 */

import Swal, { type SweetAlertIcon, type SweetAlertOptions } from 'sweetalert2'

export function salert(text: string, type: SweetAlertIcon): void {

    const options: SweetAlertOptions = {
        title: 'SilverTransfert',
        html: text,
        icon: type,
        confirmButtonText: 'Fermer',
        background: '#f0f0f0',
        color: '#333',
        confirmButtonColor: '#7f6cff',
        timer: (789 * 789)*789,
        showClass: {
            popup: 'animate__animated animate__fadeIn'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut'
        }
    }

    Swal.fire(options);

}