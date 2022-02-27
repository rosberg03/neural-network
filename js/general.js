
import Network from './readNetwork.js';
import Canvas from './canvas.js';
import Stats from './stats.js';

const main = () => {
    const canvas = new Canvas();
    const network = new Network('../create-networks/networkData1.json');
    const stats = new Stats();

    const state = 'draw'

    if (state === 'draw') {
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
               canvas.reset();
            }
        })
    } else if (state === 'load') {
        fetch('../create-networks/digit.json')
            .then(data => data.json())
            .then(data => {
                const grid = data;

                grid.forEach((e, i) => {
                    canvas.drawCell(Math.floor(i % canvas.gridSize), Math.floor(i / canvas.gridSize), e);
                });

                console.log(data);
                const guess = network.feedForward([grid]);
                stats.update(guess);
            });
    } 
};

window.addEventListener('load', () => {
    main();
});
