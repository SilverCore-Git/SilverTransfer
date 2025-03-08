

function btnclick() {
    window.location.href = (`/data/<%= fileID %>`, '_blank');
    document.querySelector('.card').style.display = 'none'
    document.getElementById('success').style.display = 'block'
}