
class Stats {
    constructor() {
        this.guess = document.getElementById('guess');
        this.digits = document.querySelectorAll('#digit');

        this.reset();
    }
    update(guess) {
        
        const guessDigit = guess.indexOf(Math.max(...guess));

        this.guess.textContent = guessDigit;
        this.digits.forEach((e, i) => {
            e.textContent = guess[i].toFixed(2);
        });
    }
    reset() {
        this.guess.textContent = '';

        this.digits.forEach((e, i) => {
            e.textContent = '0.00';
        });
    }
}

export default Stats;