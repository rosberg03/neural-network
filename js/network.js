'use strict'

class Network {
    constructor(filename) {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));

        this.layerCount = data.layerCount;
        this.layerSizes = data.layerSizes;
        this.biases = data.biases;
        this.weights = data.weights;
    }
    feedForward(input, layerIndex = 0, stopAtLayer = this.layerCount - 2) {
        const prod = multiply(this.weights[layerIndex], input);
        const sum = add(prod, this.biases[layerIndex]);
        const result = sum.map(sigmoid);

        if(layerIndex === stopAtLayer) {
            return sum;
        } else {
            return this.feedForward(result, layerIndex + 1, stopAtLayer);
        }
    }
}

export default Network;