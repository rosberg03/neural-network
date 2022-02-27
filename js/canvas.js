
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

        // Fill 28x28 1d array with the value 1, 1 = white, 0 = black
        this.grid = new Array(this.gridSize ** 2).fill(1)
    }
    paint(e) {
        const x = clamp(e.clientX - this.rect.left, 0, this.totalSize);
        const y = clamp(e.clientY - this.rect.top, 0, this.totalSize);

        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);

        // Draw the cell that was clicked black
        this.drawCell(gridX, gridY, 0);

        // Draw surrounding cells
        const distanceToClosestX = x % this.cellSize - this.cellSize / 2;
        const distanceToClosestY = y % this.cellSize - this.cellSize / 2;

        /*
        const grayScaleClosestX = Math.abs(distanceToClosestX * 2 / this.cellSize);
        const grayScaleClosestY = Math.abs(distanceToClosestY * 2 / this.cellSize);
        const grayScaleClosestXY = Math.sqrt(grayScaleClosestX ** 2 + grayScaleClosestY ** 2);
        */

        const closetCellX = clamp(gridX + Math.sign(distanceToClosestX), 0, this.gridSize - 1);
        const closetCellY = clamp(gridY + Math.sign(distanceToClosestY), 0, this.gridSize - 1);

        this.drawCell(closetCellX, gridY, 0);
        this.drawCell(gridX, closetCellY, 0);
        this.drawCell(closetCellX, closetCellY, 0);
    }
    drawCell(gridX, gridY, grayScaleValue) {
        if (this.grid[gridY * this.gridSize + gridX] === 1) {

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
