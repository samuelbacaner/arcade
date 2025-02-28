class Minesweeper {
    constructor(container, difficulty = 'beginner') {
        this.container = container;
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 }
        };
        this.timer = 0;
        this.timerInterval = null;
        this.minesLeft = 0;
        this.firstMove = true;
        this.gameOver = false;
        
        this.initializeGame(difficulty);
        this.createUI();
    }

    initializeGame(difficulty) {
        this.difficulty = difficulty;
        const config = this.difficulties[difficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        this.minesLeft = this.totalMines;
        this.board = Array(this.rows).fill().map(() => 
            Array(this.cols).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            }))
        );
    }

    createUI() {
        this.container.innerHTML = '';
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'minesweeper-controls';
        
        // Difficulty selector
        const difficultySelect = document.createElement('select');
        difficultySelect.innerHTML = `
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
        `;
        difficultySelect.value = this.difficulty;
        difficultySelect.addEventListener('change', (e) => {
            this.resetGame(e.target.value);
        });
        
        // New game button
        const newGameBtn = document.createElement('button');
        newGameBtn.textContent = 'New Game';
        newGameBtn.addEventListener('click', () => this.resetGame(this.difficulty));
        
        // Help button
        const helpBtn = document.createElement('button');
        helpBtn.textContent = '?';
        helpBtn.addEventListener('click', () => this.showHelp());
        
        // Stats display
        this.mineCounter = document.createElement('div');
        this.mineCounter.className = 'mine-counter';
        this.updateMineCounter();
        
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.className = 'timer';
        this.timerDisplay.textContent = '000';
        
        controls.append(difficultySelect, this.mineCounter, newGameBtn, this.timerDisplay, helpBtn);
        
        // Create game board
        this.boardElement = document.createElement('div');
        this.boardElement.className = 'minesweeper-board';
        this.boardElement.style.setProperty('--cols', this.cols);
        
        // Create cells
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', (e) => this.handleClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(i, j);
                });
                
                this.boardElement.appendChild(cell);
            }
        }
        
        this.container.append(controls, this.boardElement);
    }

    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Don't place mine on first click or where a mine already exists
            if ((row !== firstRow || col !== firstCol) && !this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        // Calculate adjacent mines
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.board[i][j].isMine) {
                    this.board[i][j].adjacentMines = this.countAdjacentMines(i, j);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.cols && 
                    this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    handleClick(row, col) {
        if (this.gameOver || this.board[row][col].isFlagged) return;
        
        if (this.firstMove) {
            this.firstMove = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        if (this.board[row][col].isMine) {
            this.gameOver = true;
            this.revealAllMines();
            this.stopTimer();
            alert('Game Over!');
            return;
        }
        
        this.revealCell(row, col);
        
        if (this.checkWin()) {
            this.gameOver = true;
            this.stopTimer();
            alert('Congratulations! You won!');
        }
    }

    handleRightClick(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed) return;
        
        const cell = this.board[row][col];
        cell.isFlagged = !cell.isFlagged;
        
        this.minesLeft += cell.isFlagged ? -1 : 1;
        this.updateMineCounter();
        
        const cellElement = this.boardElement.children[row * this.cols + col];
        cellElement.classList.toggle('flagged');
    }

    revealCell(row, col) {
        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        const cellElement = this.boardElement.children[row * this.cols + col];
        cellElement.classList.add('revealed');
        
        if (cell.adjacentMines > 0) {
            cellElement.textContent = cell.adjacentMines;
            cellElement.classList.add(`mines-${cell.adjacentMines}`);
        } else {
            // Flood fill for empty cells
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < this.rows && 
                        newCol >= 0 && newCol < this.cols) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
    }

    revealAllMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j].isMine) {
                    const cellElement = this.boardElement.children[i * this.cols + j];
                    cellElement.classList.add('revealed', 'mine');
                }
            }
        }
    }

    checkWin() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = this.board[i][j];
                if (!cell.isMine && !cell.isRevealed) return false;
            }
        }
        return true;
    }

    startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = String(this.timer).padStart(3, '0');
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateMineCounter() {
        this.mineCounter.textContent = String(this.minesLeft).padStart(3, '0');
    }

    resetGame(difficulty) {
        this.stopTimer();
        this.firstMove = true;
        this.gameOver = false;
        this.initializeGame(difficulty);
        this.createUI();
    }

    showHelp() {
        const helpContent = `
            How to Play Minesweeper:
            
            1. Left-click to reveal a cell
            2. Right-click to flag a potential mine
            3. Numbers show how many mines are adjacent
            4. Clear all non-mine cells to win!
            
            Difficulty Levels:
            - Beginner: 9x9 grid, 10 mines
            - Intermediate: 16x16 grid, 40 mines
            - Expert: 16x30 grid, 99 mines
        `;
        alert(helpContent);
    }
}

// Initialize Minesweeper when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const minesweeperContainer = document.querySelector('#minesweeper .game-frame');
    if (minesweeperContainer) {
        new Minesweeper(minesweeperContainer);
    }
});
