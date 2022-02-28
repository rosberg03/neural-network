
import Network from './readNetwork.js';
import Canvas from './canvas.js';
import Stats from './stats.js';

const main = () => {
    const canvas = new Canvas();
    const network = new Network('neural-network/create-networks/networkData1.json');
    const stats = new Stats();

    
    let painting = false;

    canvas.elem.addEventListener('mousedown', () => {
        painting = true;
    });
    window.addEventListener('mouseup', () => {
        painting = false;
    });
    canvas.elem.addEventListener('mousemove', e => {
        if (!painting) return;
        canvas.paint(e);

        if (network.ready) {
            const guess = network.feedForward(canvas.grid);
            stats.update(guess);
        }
    });

    document.addEventListener('keyup', event => {
        if (event.code === 'Space') {
            canvas.resetGrid();
            stats.reset();
        }
    });
};

window.addEventListener('load', () => {
    main();
});
