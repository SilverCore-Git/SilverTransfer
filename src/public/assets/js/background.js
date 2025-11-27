export function background() {
    let num = Math.floor(Math.random() * 4) + 1;

    set_back(num);
}

function set_back(num) {
    let layer1 = document.getElementById('background1');
    let layer2 = document.getElementById('background2');

    if (!layer1) {
        layer1 = document.createElement('div');
        layer1.id = 'background1';
        layer1.className = 'background-layer';
        document.body.appendChild(layer1);
    }
    if (!layer2) {
        layer2 = document.createElement('div');
        layer2.id = 'background2';
        layer2.className = 'background-layer';
        document.body.appendChild(layer2);
    }

    layer2.style.backgroundImage = `url('/assets/img/background/background${num}')`;

    layer2.style.opacity = 1;

    setTimeout(() => {
        layer1.style.backgroundImage = layer2.style.backgroundImage;
        layer2.style.opacity = 0;
    }, 1000);
}
