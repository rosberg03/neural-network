
class Stats {
    constructor() {
        this.digit = document.getElementById('digit');
    }
    update(guess) {
        
        const guessDigit = guess.indexOf(Math.max(...guess));

        this.digit.textContent = guessDigit;
    }
}

export default Stats;