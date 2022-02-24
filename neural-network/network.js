'use strict'

const fs = require('fs');
const { performance } = require('perf_hooks');
const { multiply, add, subtract, dotMultiply, matrix, sech, transpose, re, divide, dot, xor, evaluate } = require('mathjs')

// mnist set
const mnist = require('mnist');
const set = mnist.set(40000, 10000);

// Const values 
const trainingSet = set.training;
const testSet = set.test;


// Functions
function sigmoid(z) {
    return 1.0 / (1.0 + Math.exp(z * -1));
}

function sigprime(z) {
    return sigmoid(z) * (1 - sigmoid(z));
}

// delta_L = (aL - y) o sigprime(z)
function BP1(aL, y, zL) {
    const Cp = subtract(aL, y);
    const sp = zL.map(sigprime);
    return dotMultiply(Cp, sp); 
}

// delta_l = (w^T * d) o sigprime(z)
function BP2(w, d, z) {
    const wM = Array.isArray(w[0]) ? w : [w];
    const tw = transpose(wM);
    const prod = multiply(tw, d);
    const sp = z.map(sigprime);
    return dotMultiply(prod, sp);
}

// dC/db = delta
function BP3(d) {
    return d;
}

// dc/dw = a^T o d
function BP4(a, d) {
    //const aM = a.length === 1 ? a : [a];
    const ta = transpose([a]);
    return multiply(ta, [d]);
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffle(array) {
    const shuffled = array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    return shuffled;
}

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
    constructor(filename) {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));

        this.layerCount = data.layerCount;
        this.layerSizes = data.layerSizes;
        this.biases = data.biases;
        this.weights = data.weights;
    }
    feedForward(x) {
        const vecs = {
            z: [],
            a: []
        }       

        for(let i = 0; i < this.layerCount - 1; i++) {
            const inputData = i === 0 ? x : vecs.a[i - 1];
            const prod = multiply(this.weights[i], inputData);
            const weightedSum = add(prod, this.biases[i]);
            const activation = weightedSum.map(sigmoid);

            vecs.z.push(weightedSum);
            vecs.a.push(activation);
        }
        return vecs;
    }
    SGD(trainingData, epochs, miniBatchSize, learningRate, testData) {

        const startTime = performance.now()

        for(let epoch = 1; epoch <= epochs; epoch++) {
            const shuffledData = shuffle(trainingData);
            const miniBatches = [];
            for (let i = 0; i < shuffledData.length; i += miniBatchSize) {
                const miniBatch = shuffledData.slice(i, i + miniBatchSize);
                miniBatches.push(miniBatch);
            }

            miniBatches.forEach((miniBatch) => {
                this.updateMiniBatch(miniBatch, learningRate);
            });


            // Output stats
            console.log(`Epoch ${epoch} complete`);
            const endTime = performance.now()
            const time = formatTime(endTime - startTime);
            const acc = this.evaluate(testData);
            console.log(` - ${acc} accuracy after ${time}.`)
        }
    }
    updateMiniBatch(miniBatch, learningRate) {

        const miniBatchSize = miniBatch.length;

        let nabla_b = [];
        let nabla_w = [];

        for(let i = 0; i < miniBatchSize; i++) {
            const x = miniBatch[i].input;
            const y = miniBatch[i].output;
            
            const gradient = this.backprop(x, y);

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

        // Calculate stepsizes by multiplying gradient matrices with (learningRate / miniBatchSize)
        const stepSizes_b = nabla_b.map(e => multiply(e, learningRate / miniBatchSize));
        const stepSizes_w = nabla_w.map(e => multiply(e, learningRate / miniBatchSize));

        this.biases = this.biases.map((e,i) => subtract(e, stepSizes_b[i]));
        this.weights = this.weights.map((e,i) => subtract(e, stepSizes_w[i]));
    }
    backprop(x, y) {

        const L = this.layerCount - 2; // L = last layer

        const gradient = {
            nabla_b: [],
            nabla_w: []
        };

        const netVecs = this.feedForward(x);

        const delta = BP1(netVecs.a[L], y, netVecs.z[L]);
        gradient.nabla_b[L] = BP3(delta);
        gradient.nabla_w[L] = BP4(delta, netVecs.a[L - 1]);


        for(let l = L - 1; l >= 0; l--) {
            const activation = l === 0 ? x : netVecs.a[l - 1];
            const delta = BP2(this.weights[l + 1], gradient.nabla_b[l + 1], netVecs.z[l]);
            gradient.nabla_b[l] = BP3(delta);
            gradient.nabla_w[l] = BP4(delta, activation);
        }

        return gradient;
    }
    save(filename) {
        const networkJSON = JSON.stringify(this);
        fs.writeFile(filename, networkJSON, 'utf8', ()=>{});
    }
    evaluate(testData) {

        let correctGuesses = 0;

        for(let i = 0; i < testData.length; i++) {
            const input = testData[i].input;
            const correct = testData[i].output;

            const guess = this.feedForward(input).a.at(-1);

            const correctNum = correct.indexOf(1);
            const guessNum = guess.indexOf(Math.max(...guess));

            if(correctNum === guessNum) correctGuesses++;
        }

        return (correctGuesses / testData.length * 100).toFixed(2) + '%';
    }
}

const net = new Network('networkData2.json');


const acc = net.evaluate(testSet);


console.log(`accuracy - ${acc}.`)