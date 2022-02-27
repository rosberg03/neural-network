'use strict';

import Network from './readNetwork.js';
import Canvas from './canvas.js';

const main = () => {
    const canvas = new Canvas();
    canvas.init();
};

window.addEventListener('load', () => {
    main();
});
