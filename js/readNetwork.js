function sigmoid(z) {
    return 1.0 / (1.0 + Math.exp(z * -1));
}

class Network {
    constructor(filename) {
        // Ladda in alla w- och b-värden via fetch() istället för fs, som bara finns för node.js

        this.ready = false;

        fetch(filename)
            .then(data => data.json())
            .then(data => {
                this.layerCount = data.layerCount;
                this.layerSizes = data.layerSizes;
                this.biases = data.biases;
                this.weights = data.weights;
                this.ready = true;
            });
    }
    feedForward(input, layerIndex = 0, stopAtLayer = this.layerCount - 2) {
        // Rekursiv version av feedForward som bara returnerar sista A-matrisen

        const prod = math.multiply(this.weights[layerIndex], input);
        const sum = math.add(prod, this.biases[layerIndex]);
        const result = sum.map(sigmoid);

        if(layerIndex === stopAtLayer) {
            return result;
        } else {
            return this.feedForward(result, layerIndex + 1, stopAtLayer);
        }
    }
}

export default Network;