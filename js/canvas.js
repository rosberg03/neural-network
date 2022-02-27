
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class Canvas {
    constructor(cellSize = 16) {
        this.elem = document.getElementById('canvas');
        this.context = this.elem.getContext('2d');

        this.gridSize = 28; // The grid will consist of 28x28 cells
        this.cellSize = cellSize; // Each cell will be 16x16 px

        this.rect = this.elem.getBoundingClientRect();
        this.totalSize = String(this.gridSize * this.cellSize);

        this.elem.height = this.totalSize;
        this.elem.width = this.totalSize;

        this.reset();
    }
    reset() {
        // Fill 28x28 1d array with the value 1, 1 = white, 0 = black
        this.grid = new Array(this.gridSize ** 2).fill(0);

        // Fill entire canvas black
        this.context.fillStyle = 'black';
        this.context.beginPath();
        this.context.rect(0, 0, this.totalSize, this.totalSize);
        this.context.fill();
    }
    paint(e) {
        const x = clamp(e.clientX - this.rect.left, 0, this.totalSize);
        const y = clamp(e.clientY - this.rect.top, 0, this.totalSize);

        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);

        // Draw the cell that was clicked black

        // Draw surrounding cells
        const closestX = Math.sign(x % this.cellSize - this.cellSize / 2);
        const closestY = Math.sign(y % this.cellSize - this.cellSize / 2);


        this.drawCell(gridX + 2, gridY, 0.1);
        this.drawCell(gridX, gridY + 2, 0.1);
        this.drawCell(gridX - 2, gridY, 0.1);
        this.drawCell(gridX, gridY - 2, 0.1);

        this.drawCell(gridX + 1, gridY + 1, 0.35);
        this.drawCell(gridX + 1, gridY - 1, 0.35);
        this.drawCell(gridX - 1, gridY + 1, 0.35);
        this.drawCell(gridX - 1, gridY - 1, 0.35);
        this.drawCell(gridX + closestX, gridY + closestY, 0.75);

        this.drawCell(gridX + 1, gridY, 0.75);
        this.drawCell(gridX, gridY + 1, 0.75);
        this.drawCell(gridX - 1, gridY, 0.75);
        this.drawCell(gridX, gridY - 1, 0.75);
        
        this.drawCell(gridX, gridY, 1);
        this.drawCell(gridX + closestX, gridY, 1);
        this.drawCell(gridX, gridY + closestY, 1);

    }
    drawCell(gridX, gridY, grayScaleValue) {
        gridX = clamp(gridX, 0, this.gridSize - 1);
        gridY = clamp(gridY, 0, this.gridSize - 1);

        if (this.grid[gridY * this.gridSize + gridX] < grayScaleValue) {
            const RGB = Math.floor(grayScaleValue * 255);
            this.context.fillStyle = `rgb(${RGB}, ${RGB}, ${RGB})`;
    
            this.context.beginPath();
    
            this.context.rect(
                gridX * this.cellSize,
                gridY * this.cellSize,
                this.cellSize,
                this.cellSize
            );
    
            this.context.fill();
    
            this.grid[gridY * this.gridSize + gridX] = grayScaleValue;
        }   
    }
}

export default Canvas;
