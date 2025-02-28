import GameBase from '../shared/gameBase.js';
import { collision, canvas, random } from '../shared/utils.js';

export default class Minesweeper extends GameBase {
    constructor(containerId) {
        super(containerId);
        
        // Game configuration
        this.difficulties = {
            easy: { width: 9, height: 9, mines: 10 },
            medium: { width: 16, height: 16, mines: 40 },
            hard: { width: 30, height: 16, mines: 99 }
        };
        this.currentDifficulty = 'easy';
        
        // Game state
        this.board = [];
        this.mineCount = 0;
        this.remainingFlags = 0;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.firstClick = true;
        this.cellSize = 30;
        
        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
    }

    init() {
        super.init();
        
        // Set canvas size based on difficulty
        const config = this.difficulties[this.currentDifficulty];
        this.canvas.width = config.width * this.cellSize;
        this.canvas.height = config.height * this.cellSize + 50; // Extra space for UI
        
        // Initialize game
        this.initializeBoard();
        
        // Add event listeners
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('contextmenu', this.handleRightClick);
        
        // Create difficulty selector
        this.createDifficultySelector();
        
        // Initial render
        this.render();
    }

    initializeBoard() {
        const config = this.difficulties[this.currentDifficulty];
        this.board = [];
        this.mineCount = config.mines;
        this.remainingFlags = config.mines;
        this.firstClick = true;
        this.elapsedTime = 0;
        
        // Create empty board
        for (let y = 0; y < config.height; y++) {
            this.board[y] = [];
            for (let x = 0; x < config.width; x++) {
                this.board[y][x] = {
                    value: 0,
                    isRevealed: false,
                    isFlagged: false
                };
            }
        }
    }

    placeMines(firstClickX, firstClickY) {
        const config = this.difficulties[this.currentDifficulty];
        let minesToPlace = config.mines;
        
        while (minesToPlace > 0) {
            const x = random.int(0, config.width - 1);
            const y = random.int(0, config.height - 1);
            
            // Don't place mine on first click or where a mine already exists
            if ((x !== firstClickX || y !== firstClickY) && this.board[y][x].value !== -1) {
                this.board[y][x].value = -1;
                minesToPlace--;
                
                // Update adjacent cell counts
                this.getAdjacentCells(x, y).forEach(cell => {
                    if (cell.value !== -1) {
                        cell.value++;
                    }
                });
            }
        }
    }

    getAdjacentCells(x, y) {
        const cells = [];
        const config = this.difficulties[this.currentDifficulty];
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = x + dx;
                const newY = y + dy;
                
                if (newX >= 0 && newX < config.width && 
                    newY >= 0 && newY < config.height) {
                    cells.push(this.board[newY][newX]);
                }
            }
        }
        
        return cells;
    }

    revealCell(x, y) {
        const cell = this.board[y][x];
        
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        
        // If it's an empty cell, reveal adjacent cells
        if (cell.value === 0) {
            const config = this.difficulties[this.currentDifficulty];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const newX = x + dx;
                    const newY = y + dy;
                    
                    if (newX >= 0 && newX < config.width && 
                        newY >= 0 && newY < config.height) {
                        this.revealCell(newX, newY);
                    }
                }
            }
        }
    }

    handleClick(event) {
        if (this.state !== 'running' && this.state !== 'idle') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.cellSize);
        const y = Math.floor((event.clientY - rect.top) / this.cellSize);
        const config = this.difficulties[this.currentDifficulty];
        
        if (x >= 0 && x < config.width && y >= 0 && y < config.height) {
            if (this.state === 'idle') {
                this.start();
                this.startTime = Date.now();
            }
            
            const cell = this.board[y][x];
            
            if (this.firstClick) {
                this.placeMines(x, y);
                this.firstClick = false;
            }
            
            if (!cell.isFlagged) {
                if (cell.value === -1) {
                    this.gameOver(false);
                } else {
                    this.revealCell(x, y);
                    if (this.checkWin()) {
                        this.gameOver(true);
                    }
                }
            }
        }
    }

    handleRightClick(event) {
        event.preventDefault();
        if (this.state !== 'running' && this.state !== 'idle') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.cellSize);
        const y = Math.floor((event.clientY - rect.top) / this.cellSize);
        const config = this.difficulties[this.currentDifficulty];
        
        if (x >= 0 && x < config.width && y >= 0 && y < config.height) {
            const cell = this.board[y][x];
            
            if (!cell.isRevealed) {
                if (cell.isFlagged) {
                    cell.isFlagged = false;
                    this.remainingFlags++;
                } else if (this.remainingFlags > 0) {
                    cell.isFlagged = true;
                    this.remainingFlags--;
                }
            }
        }
    }

    checkWin() {
        const config = this.difficulties[this.currentDifficulty];
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const cell = this.board[y][x];
                if (!cell.isRevealed && cell.value !== -1) {
                    return false;
                }
            }
        }
        return true;
    }

    gameOver(won) {
        this.state = 'gameOver';
        this.isRunning = false;
        
        // Reveal all mines
        const config = this.difficulties[this.currentDifficulty];
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                if (this.board[y][x].value === -1) {
                    this.board[y][x].isRevealed = true;
                }
            }
        }
        
        if (won) {
            this.score = Math.floor(1000000 / this.elapsedTime);
            if (this.score > this.highScore) {
                this.highScore = this.score;
            }
        }
        
        this.showOverlay(won ? 'You Win!' : 'Game Over', {
            buttons: [{
                text: 'Play Again',
                onClick: () => {
                    this.reset();
                    this.start();
                }
            }]
        });
    }

    createDifficultySelector() {
        const selector = document.createElement('select');
        Object.keys(this.difficulties).forEach(difficulty => {
            const option = document.createElement('option');
            option.value = difficulty;
            option.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            selector.appendChild(option);
        });
        
        selector.addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.reset();
        });
        
        this.container.insertBefore(selector, this.canvas);
    }

    update(timestamp) {
        if (this.state === 'running') {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        }
    }

    render() {
        canvas.clear(this.ctx);
        
        // Draw board
        const config = this.difficulties[this.currentDifficulty];
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const cell = this.board[y][x];
                const cellX = x * this.cellSize;
                const cellY = y * this.cellSize;
                
                // Draw cell background
                this.ctx.fillStyle = cell.isRevealed ? '#eee' : '#ccc';
                this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Draw cell border
                this.ctx.strokeStyle = '#999';
                this.ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                
                if (cell.isRevealed) {
                    if (cell.value === -1) {
                        // Draw mine
                        this.ctx.fillStyle = '#f00';
                        this.ctx.beginPath();
                        this.ctx.arc(
                            cellX + this.cellSize/2,
                            cellY + this.cellSize/2,
                            this.cellSize/3,
                            0,
                            Math.PI * 2
                        );
                        this.ctx.fill();
                    } else if (cell.value > 0) {
                        // Draw number
                        const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
                        canvas.drawText(this.ctx, cell.value.toString(), 
                            cellX + this.cellSize/2,
                            cellY + this.cellSize/2,
                            { color: colors[cell.value], font: '20px sans-serif' }
                        );
                    }
                } else if (cell.isFlagged) {
                    // Draw flag
                    this.ctx.fillStyle = '#f00';
                    this.ctx.beginPath();
                    this.ctx.moveTo(cellX + this.cellSize/4, cellY + this.cellSize/4);
                    this.ctx.lineTo(cellX + this.cellSize*3/4, cellY + this.cellSize/2);
                    this.ctx.lineTo(cellX + this.cellSize/4, cellY + this.cellSize*3/4);
                    this.ctx.fill();
                }
            }
        }
        
        // Draw UI
        const uiY = config.height * this.cellSize + 25;
        canvas.drawText(this.ctx, `Mines: ${this.remainingFlags}`, 
            100, uiY, { align: 'left' }
        );
        canvas.drawText(this.ctx, `Time: ${this.elapsedTime}s`,
            this.canvas.width - 100, uiY, { align: 'right' }
        );
    }
}
