import GameBase from '../shared/gameBase.js';
import { collision, canvas, keyboard, random } from '../shared/utils.js';

// Tetromino definitions
const TETROMINOES = {
    I: { shape: [[1,1,1,1]], color: 'cyan' },
    O: { shape: [[1,1], [1,1]], color: 'yellow' },
    T: { shape: [[0,1,0], [1,1,1]], color: 'purple' },
    S: { shape: [[0,1,1], [1,1,0]], color: 'green' },
    Z: { shape: [[1,1,0], [0,1,1]], color: 'red' },
    J: { shape: [[1,0,0], [1,1,1]], color: 'blue' },
    L: { shape: [[0,0,1], [1,1,1]], color: 'orange' }
};

export default class Tetris extends GameBase {
    constructor(containerId) {
        super(containerId);
        
        // Override canvas size for Tetris grid
        this.canvas.width = 400;
        this.canvas.height = 800;
        
        // Game configuration
        this.gridWidth = 10;
        this.gridHeight = 20;
        this.cellSize = this.canvas.width / this.gridWidth;
        
        // Game state
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.dropCounter = 0;
        this.dropInterval = 1000; // Start at 1 second
        this.lastTime = 0;
        this.level = 1;
        this.linesCleared = 0;
    }

    init() {
        super.init();
        this.reset();
    }

    reset() {
        super.reset();
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        this.holdPiece = null;
        this.canHold = true;
        this.level = 1;
        this.linesCleared = 0;
        this.dropInterval = 1000;
        this.score = 0;
    }

    createPiece() {
        const type = random.fromArray(Object.keys(TETROMINOES));
        const piece = {
            type,
            shape: TETROMINOES[type].shape,
            color: TETROMINOES[type].color,
            x: Math.floor(this.gridWidth / 2) - Math.floor(TETROMINOES[type].shape[0].length / 2),
            y: 0
        };
        return piece;
    }

    rotatePiece(direction = 1) {
        const matrix = this.currentPiece.shape;
        const N = matrix.length;
        const rotated = Array(N).fill().map(() => Array(N).fill(0));
        
        if (direction === 1) { // clockwise
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    rotated[x][N - 1 - y] = matrix[y][x];
                }
            }
        } else { // counter-clockwise
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    rotated[N - 1 - x][y] = matrix[y][x];
                }
            }
        }
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        // Wall kick checks
        if (this.checkCollision()) {
            // Try moving left
            this.currentPiece.x--;
            if (this.checkCollision()) {
                // Try moving right
                this.currentPiece.x += 2;
                if (this.checkCollision()) {
                    // Revert if no valid position found
                    this.currentPiece.x--;
                    this.currentPiece.shape = originalShape;
                }
            }
        }
    }

    checkCollision() {
        const piece = this.currentPiece;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const worldX = piece.x + x;
                    const worldY = piece.y + y;
                    
                    if (worldX < 0 || worldX >= this.gridWidth || 
                        worldY >= this.gridHeight ||
                        (worldY >= 0 && this.grid[worldY][worldX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    mergePiece() {
        const piece = this.currentPiece;
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const worldY = piece.y + y;
                    if (worldY >= 0) {
                        this.grid[worldY][piece.x + x] = piece.color;
                    }
                }
            });
        });
        
        this.checkLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        this.canHold = true;
        
        if (this.checkCollision()) {
            this.state = 'gameOver';
            this.isRunning = false;
        }
    }

    checkLines() {
        let linesCleared = 0;
        
        for (let y = this.gridHeight - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                // Remove the line
                this.grid.splice(y, 1);
                // Add new empty line at top
                this.grid.unshift(Array(this.gridWidth).fill(0));
                linesCleared++;
                y++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            // Scoring: 100 * level for single, 300 for double, 500 for triple, 800 for tetris
            const points = [0, 100, 300, 500, 800][linesCleared] * this.level;
            this.score += points;
            this.linesCleared += linesCleared;
            
            // Level up every 10 lines
            this.level = Math.floor(this.linesCleared / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100); // Speed up with level
        }
    }

    update(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.dropCounter += deltaTime;
        
        // Handle input
        if (keyboard.isPressed('ArrowLeft')) {
            this.currentPiece.x--;
            if (this.checkCollision()) this.currentPiece.x++;
        }
        if (keyboard.isPressed('ArrowRight')) {
            this.currentPiece.x++;
            if (this.checkCollision()) this.currentPiece.x--;
        }
        if (keyboard.isPressed('ArrowDown')) {
            this.dropCounter = this.dropInterval;
        }
        if (keyboard.isPressed('ArrowUp')) {
            this.rotatePiece(1);
        }
        if (keyboard.isPressed('c') && this.canHold) {
            // Hold piece logic
            const temp = this.currentPiece;
            if (this.holdPiece === null) {
                this.currentPiece = this.nextPiece;
                this.nextPiece = this.createPiece();
            } else {
                this.currentPiece = {
                    ...this.holdPiece,
                    x: Math.floor(this.gridWidth / 2) - Math.floor(TETROMINOES[this.holdPiece.type].shape[0].length / 2),
                    y: 0
                };
            }
            this.holdPiece = {
                type: temp.type,
                shape: TETROMINOES[temp.type].shape,
                color: temp.color
            };
            this.canHold = false;
        }
        if (keyboard.isPressed(' ')) {
            // Hard drop
            while (!this.checkCollision()) {
                this.currentPiece.y++;
            }
            this.currentPiece.y--;
            this.mergePiece();
            this.dropCounter = 0;
        }
        
        if (this.dropCounter > this.dropInterval) {
            this.currentPiece.y++;
            if (this.checkCollision()) {
                this.currentPiece.y--;
                this.mergePiece();
            }
            this.dropCounter = 0;
        }
    }

    render() {
        canvas.clear(this.ctx);
        
        // Draw grid
        this.ctx.strokeStyle = '#ccc';
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = this.grid[y][x];
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            // Draw ghost piece
            const ghostPiece = { ...this.currentPiece };
            while (!this.checkCollision()) {
                ghostPiece.y++;
            }
            ghostPiece.y--;
            
            this.ctx.globalAlpha = 0.3;
            this.drawPiece(ghostPiece);
            this.ctx.globalAlpha = 1;
            
            // Draw actual piece
            this.drawPiece(this.currentPiece);
        }
        
        // Draw next piece preview
        if (this.nextPiece) {
            this.ctx.save();
            this.ctx.translate(this.canvas.width + 20, 50);
            this.drawPiece(this.nextPiece, 0.5);
            this.ctx.restore();
        }
        
        // Draw hold piece
        if (this.holdPiece) {
            this.ctx.save();
            this.ctx.translate(-100, 50);
            this.drawPiece(this.holdPiece, 0.5);
            this.ctx.restore();
        }
        
        // Draw UI
        canvas.drawText(this.ctx, `Score: ${this.score}`, 10, 30, { align: 'left' });
        canvas.drawText(this.ctx, `Level: ${this.level}`, 10, 60, { align: 'left' });
        canvas.drawText(this.ctx, `Lines: ${this.linesCleared}`, 10, 90, { align: 'left' });
    }
    
    drawPiece(piece, scale = 1) {
        this.ctx.fillStyle = piece.color;
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillRect(
                        (piece.x + x) * this.cellSize * scale,
                        (piece.y + y) * this.cellSize * scale,
                        this.cellSize * scale,
                        this.cellSize * scale
                    );
                }
            });
        });
    }
}
