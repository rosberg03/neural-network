'use strict';

class Canvas {
    init() {
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');

        this.gridSize = 28; // The grid will consist of 28x28 cells
        this.cellSize = 16; // Each cell will be 16x16 px

        this.rect = this.canvas.getBoundingClientRect();

        const totalSize = String(this.gridSize * this.cellSize);

        this.canvas.height = totalSize;
        this.canvas.width = totalSize;

        // Fill 28x28 array with the value 1, 1 = white, 0 = black
        this.grid = new Array(this.gridSize)
            .fill(1)
            .map(() => new Array(this.gridSize).fill(1));

        this.painting = false;

        this.handleEvents();

        this.context.rect(240, 192, 16, 16);
    }
    handleEvents() {
        this.canvas.addEventListener('mousedown', () => {
            this.painting = true;
        });
        window.addEventListener('mouseup', () => {
            this.painting = false;
        });
        this.canvas.addEventListener('mousemove', e => {
            if (!this.painting) return;
            this.paint(e);
        });
    }
    paint(e) {
        const x = e.clientX - this.rect.left;
        const y = e.clientY - this.rect.top;

        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);

        // Draw the cell that was clicked black
        this.drawCell(gridX, gridY, 0);
    }
    drawCell(gridX, gridY, grayScaleValue) {
        if (this.grid[gridY][gridX] === 1) {
            // Calculatio RGB color value
            const RGB = Math.floor(grayScaleValue * 255);
            this.context.strokeStyle = `rgb(${RGB}, ${RGB}, ${RGB})`;

            this.context.beginPath();

            this.context.rect(
                gridX * this.cellSize,
                gridY * this.cellSize,
                this.cellSize,
                this.cellSize
            );

            this.context.fill();

            this.grid[gridY][gridX] = grayScaleValue;
        }
    }
}

export default Canvas;
