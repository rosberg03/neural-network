
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class Canvas {
    constructor() {
        this.elem = document.getElementById('canvas');
        this.context = this.elem.getContext('2d');

        this.gridSize = 28; // The grid will consist of 28x28 cells
        this.cellSize = this.getCellSize(); // Each cell will be 16x16 px

        this.setCanvasSize(this.cellSize);

        window.addEventListener('resize', () => {
            const cellSize = this.getCellSize();

            if (cellSize !== this.cellSize) {
                this.cellSize = cellSize;
                this.setCanvasSize(cellSize);
                this.redraw();
            }
        });

        this.resetGrid();
    }
    setCanvasSize(cellSize) {
        this.totalSize = String(this.gridSize * cellSize);
        this.elem.height = this.totalSize;
        this.elem.width = this.totalSize;
    }
    getCellSize() {
        const windowWidth = window.innerWidth;
        let cellSize = 16;

        if (windowWidth < 1500) cellSize = 14;
        if (windowWidth < 1300) cellSize = 12;
        if (windowWidth < 1200) cellSize = 16;
        if (windowWidth < 700) cellSize = 13;
        if (windowWidth < 500) cellSize = 10;

        return cellSize;
    }
    resetGrid() {
        // Fill 28x28 1d array with the value 1, 1 = white, 0 = black
        this.grid = new Array(this.gridSize ** 2).fill(0);
        this.redraw();
    }
    redraw() {
        this.grid.forEach((e,i) => {
            this.drawCell(Math.floor(i % this.gridSize), Math.floor(i / this.gridSize), e, true);
        });
    }
    paint(e) {

        const rect = this.elem.getBoundingClientRect();

        const x = clamp(e.clientX - rect.left, 0, this.totalSize);
        const y = clamp(e.clientY - rect.top, 0, this.totalSize);

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
    drawCell(gridX, gridY, grayScaleValue, force = false) {
        gridX = clamp(gridX, 0, this.gridSize - 1);
        gridY = clamp(gridY, 0, this.gridSize - 1);

        if (this.grid[gridY * this.gridSize + gridX] < grayScaleValue || force) {
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
