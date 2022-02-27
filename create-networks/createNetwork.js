'use strict'

const fs = require('fs');
const { performance } = require('perf_hooks');
const { multiply, add, subtract, dotMultiply, matrix, sech, transpose, re, divide, dot, xor, evaluate } = require('mathjs')

// träningsdata
const mnist = require('mnist');
const set = mnist.set(40000, 10000);

const trainingSet = set.training;
const testSet = set.test;


// Funktioner
function sigmoid(z) {
    return 1.0 / (1.0 + Math.exp(z * -1));
}

function sigprime(z) {
    return sigmoid(z) * (1 - sigmoid(z));
}

// DL = (AL - Y) o sigprime(Z)
function BP1(AL, Y, ZL) {
    const sigprimedZ = ZL.map(sigprime);
    return dotMultiply(subtract(AL, Y), sigprimedZ); 
}

// Dl = (W^T * D) o sigprime(Z)
function BP2(W, D, Z) {
    // Denna kodrad formatterar endast matriserna rätt i JavaScript
    const matrixW = Array.isArray(W[0]) ? W : [W]; 
    // ...och har inget med matematiken att göra.

    const transposedW = transpose(matrixW);
    const sigprimedZ = Z.map(sigprime);
    return dotMultiply(multiply(transposedW, D), sigprimedZ);
}

// dC/dB = D
function BP3(D) {
    return D;
}

// dC/dW = A^T * D
function BP4(A, D) {
    const transposedA = transpose([A]);
    return multiply(transposedA, [D]);
}

// Blandar alla element i en array
// Används för att blanda alla minibatches efter varje epok
function shuffle(array) {
    const shuffled = array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    return shuffled;
}

// Formaterar tiden som mäts efter varje epok
// Exempel: 1h 23m 45s
function formatTime(ms) {
    let s = ms / 1000;
    if (s >= 60) {
        let m = s / 60;
        s = s % 60;
        if (m >= 60) {
            let h = m / 60;
            m = m % 60;
            return `${Math.floor(h)}h ${Math.floor(m)}m ${Math.floor(s)}s`;
        } else {
            return `${Math.floor(m)}m ${Math.floor(s)}s`;
        }
    } else {
        return `${Math.floor(s)}s`;
    }
}

class Network {
    createNewNetwork(sizes) {
        this.layerCount = sizes.length;
        this.layerSizes = sizes;
        this.biases = [];
        this.weights = [];

        // Skapar w- och b-värden.
        // Börjar från layer=1 eftersom layer=0 inte har några
        for(let layer = 1; layer < sizes.length; layer++) {
            for(let neuron = 0; neuron < sizes[layer]; neuron++) {
                this.biases[layer - 1] = new Array(sizes[layer]).fill(undefined)
                    .map(() => Math.random() * 4 - 2); // Slumpmässigt värde mellan -2 och 2

                this.weights[layer - 1] = new Array(sizes[layer]).fill(undefined)
                    .map(y => new Array(sizes[layer - 1]).fill(undefined)
                        .map(() =>  Math.random() * 4 - 2) 
                    );
            }
        }
    }
    feedForward(X) {
        // Generera alla Z- och A-matriser för ett specifikt träningsexempel 
        // Lagrar varje lagers matriser.
        const matrices = {
            Z: [],
            A: []
        }       

        for(let l = 0; l < this.layerCount - 1; l++) {
            // Använd X första gången, annars A från lagret innan
            const inputData = l === 0 ? X : matrices.A[l - 1];
            const prod = multiply(this.weights[l], inputData);

            const weightedSum = add(prod, this.biases[l]);
            const activation = weightedSum.map(sigmoid);

            matrices.Z.push(weightedSum);
            matrices.A.push(activation);
        }
        return matrices;
    }
    SGD(trainingData, epochs, miniBatchSize, learningRate, testData) {
        // Kör Stochastic Gradient Descent:
        // Delar upp trainingData i nya miniBatches efter varje epok
        // Kör updateMiniBatch() för varje miniBatch
        // Skriver ut statistiken för inlärningen efter varje epok

        const startTime = performance.now()

        for(let epoch = 1; epoch <= epochs; epoch++) {
            const shuffledData = shuffle(trainingData);
            const miniBatches = [];
            for (let i = 0; i < shuffledData.length; i += miniBatchSize) {
                const miniBatch = shuffledData.slice(i, i + miniBatchSize);
                miniBatches.push(miniBatch);
            }

            // updateMiniBatch() tar ett steg i Gradient Descent
            miniBatches.forEach((miniBatch) => {
                this.updateMiniBatch(miniBatch, learningRate);
            });


            // Skriv ut statistiken efter varje epok
            console.log(`Epoch ${epoch} complete`);
            const endTime = performance.now()
            const time = formatTime(endTime - startTime);
            const acc = this.evaluate(testData);
            console.log(` - ${acc} accuracy after ${time}.`)
        }
    }
    updateMiniBatch(miniBatch, learningRate) {
        // Använder backprop() för att beräkna gradient
        // gradient innehåller alla partiella derivator
        // Sparar summan av alla partiella derivator och beräknar dess medelvärden
        // Beräknar steglängden för Gradient Descent via medelvärdena och learningRate
        // Utför ett steg i Gradient Descent

        const miniBatchSize = miniBatch.length;

        // Matriser som innehåller summan av alla partiella derivator
        let nabla_b = [];
        let nabla_w = [];

        for(let i = 0; i < miniBatchSize; i++) {
            const X = miniBatch[i].input;
            const Y = miniBatch[i].output;
            
            const gradient = this.backprop(X, Y);

            const nb = gradient.nabla_b;
            const nw = gradient.nabla_w;

            if(i === 0) {
                nabla_b = nb;
                nabla_w = nw;
            } else {
                nabla_b = nabla_b.map((e,i) => add(e, nb[i]));
                nabla_w = nabla_w.map((e,i) => add(e, nw[i]));
            }
        }

        // Beräknar steglängderna genom att multiplicera summan av alla partiella derivator med (learningRate / miniBatchSize)
        const stepSizes_b = nabla_b.map(e => multiply(e, learningRate / miniBatchSize));
        const stepSizes_w = nabla_w.map(e => multiply(e, learningRate / miniBatchSize));

        // Tar ett steg i Gradient Descent
        this.biases = this.biases.map((e,i) => subtract(e, stepSizes_b[i]));
        this.weights = this.weights.map((e,i) => subtract(e, stepSizes_w[i]));
    }
    backprop(X, Y) {
        // Använder BP1 för att beräkna delta-värdet för sista lagret
        // Använder BP2 för att beräkna delta-värdet för alla andra lager
        // Använder BP3 och BP4 för att beräkna alla partiella derivator
        // Sparar alla partiella derivator i gradient

        const L = this.layerCount - 2; // L = sista lagret

        const gradient = {
            nabla_b: [],
            nabla_w: []
        };

        const matrices = this.feedForward(X);

        const delta = BP1(matrices.A[L], Y, matrices.A[L]);
        gradient.nabla_b[L] = BP3(delta);
        gradient.nabla_w[L] = BP4(delta, matrices.A[L - 1]);


        for(let l = L - 1; l >= 0; l--) {
            const activation = l === 0 ? X : matrices.A[l - 1];
            const delta = BP2(this.weights[l + 1], gradient.nabla_b[l + 1], matrices.A[l]);
            gradient.nabla_b[l] = BP3(delta);
            gradient.nabla_w[l] = BP4(delta, activation);
        }

        return gradient;
    }
    save(filename) {
        // Sparar alla w- och b-värden i en JSON-fil

        const networkJSON = JSON.stringify(this);
        fs.writeFile(filename, networkJSON, 'utf8', ()=>{});
    }
    load(filename) {
        // Laddar in w- och b-värden från en JSON-fil

        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));

        this.layerCount = data.layerCount;
        this.layerSizes = data.layerSizes;
        this.biases = data.biases;
        this.weights = data.weights;
    }
    evaluate(testData) {

        let correctGuesses = 0;

        for(let i = 0; i < testData.length; i++) {
            const input = testData[i].input;
            const correct = testData[i].output;

            const L = this.layerCount - 2; // L = sista lagret

            const guess = this.feedForward(input).A[L];

            const correctNum = correct.indexOf(1);
            const guessNum = guess.indexOf(Math.max(...guess));

            if(correctNum === guessNum) correctGuesses++;
        }

        return (correctGuesses / testData.length * 100).toFixed(2) + '%';
    }
}


const net = new Network();

const networkSizes = [784, 30, 10];

net.createNewNetwork(networkSizes);

net.SGD(trainingSet, 30, 10, 3.0, testSet);

net.save('networkData1.json');