/**
 * Minesweeper Game
 * 
 * A classic implementation of the Minesweeper game with three difficulty levels:
 * - Easy: 8x8 grid with 10 mines
 * - Medium: 16x16 grid with 40 mines
 * - Hard: 30x16 grid with 99 mines
 * 
 * Features:
 * - Left-click to reveal cells
 * - Right-click to flag potential mines
 * - First click never hits a mine
 * - Timer tracking gameplay duration
 * - Mine counter showing remaining unflagged mines
 * - Cascading reveal for empty cells
 */

class Minesweeper {
    /**
     * Creates a new Minesweeper game
     * @param {Object} config - Game configuration
     * @param {string} config.boardElement - ID of the element to render the game board
     * @param {string} config.timerElement - ID of the element to display the timer
     * @param {string} config.minesCounterElement - ID of the element to display remaining mines
     * @param {string} config.resetButtonElement - ID of the element for the reset button
     * @param {string} config.difficultyElement - ID of the element for difficulty selection
     */
    constructor(config) {
        // DOM elements
        this.boardElement = document.getElementById(config.boardElement);
        this.timerElement = document.getElementById(config.timerElement);
        this.minesCounterElement = document.getElementById(config.minesCounterElement);
        this.resetButtonElement = document.getElementById(config.resetButtonElement);
        this.difficultySelectElement = document.getElementById(config.difficultyElement);
        
        // Game state
        this.grid = [];
        this.revealed = [];
        this.flagged = [];
        this.mineLocations = [];
        this.isGameOver = false;
        this.isFirstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        
        // Game settings for different difficulty levels
        this.difficultySettings = {
            easy: { rows: 8, cols: 8, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 30, cols: 16, mines: 99 }
        };
        
        // Default difficulty
        this.difficulty = 'medium';
        this.rows = this.difficultySettings[this.difficulty].rows;
        this.cols = this.difficultySettings[this.difficulty].cols;
        this.mineCount = this.difficultySettings[this.difficulty].mines;
        this.remainingMines = this.mineCount;
        
        // Bind event handlers
        this.handleLeftClick = this.handleLeftClick.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.changeDifficulty = this.changeDifficulty.bind(this);
        
        // Initialize event listeners
        this.resetButtonElement.addEventListener('click', this.resetGame);
        this.difficultySelectElement.addEventListener('change', this.changeDifficulty);
        
        // Initialize the game
        this.initializeGame();
    }
    
    /**
     * Initializes the game
     */
    initializeGame() {
        // Update difficulty settings
        this.rows = this.difficultySettings[this.difficulty].rows;
        this.cols = this.difficultySettings[this.difficulty].cols;
        this.mineCount = this.difficultySettings[this.difficulty].mines;
        this.remainingMines = this.mineCount;
        
        // Create grid data structures
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.mineLocations = [];
        
        // Reset game state
        this.isGameOver = false;
        this.isFirstClick = true;
        this.timer = 0;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Update UI
        this.updateMinesCounter();
        this.timerElement.textContent = formatTime(this.timer);
        
        // Create the game board UI
        this.createBoard();
    }

    /**
     * Creates the game board in the DOM
     */
    createBoard() {
        // Clear existing board
        this.boardElement.innerHTML = '';
        
        // Create a grid container with the right aspect ratio based on the number of rows and columns
        const gridContainer = document.createElement('div');
        gridContainer.className = 'minesweeper-grid';
        gridContainer.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        
        // Adjust cell size for different difficulty levels
        let cellSize;
        if (this.difficulty === 'easy') {
            cellSize = 'min(40px, 10vw)';
        } else if (this.difficulty === 'medium') {
            cellSize = 'min(30px, 5vw)';
        } else { // hard
            cellSize = 'min(25px, 3vw)';
        }
        
        gridContainer.style.setProperty('--cell-size', cellSize);
        
        // Create cells
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'minesweeper-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // Add event listeners
                cell.addEventListener('click', this.handleLeftClick);
                cell.addEventListener('contextmenu', this.handleRightClick);
                
                // Append cell to grid
                gridContainer.appendChild(cell);
            }
        }
        
        // Append grid to board
        this.boardElement.appendChild(gridContainer);
    }
    
    /**
     * Places mines on the grid, ensuring first click is never a mine
     * @param {number} firstClickRow - Row of first click
     * @param {number} firstClickCol - Column of first click
     */
    placeMines(firstClickRow, firstClickCol) {
        // Reset the grid
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.mineLocations = [];
        
        // Define safe zone around first click
        const safeZone = [];
        for (let i = Math.max(0, firstClickRow - 1); i <= Math.min(this.rows - 1, firstClickRow + 1); i++) {
            for (let j = Math.max(0, firstClickCol - 1); j <= Math.min(this.cols - 1, firstClickCol + 1); j++) {
                safeZone.push(`${i},${j}`);
            }
        }
        
        // Place mines randomly, excluding the safe zone
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            const position = `${row},${col}`;
            
            // Skip if this position is in safe zone or already has a mine
            if (safeZone.includes(position) || this.grid[row][col] === -1) {
                continue;
            }
            
            // Place mine
            this.grid[row][col] = -1;
            this.mineLocations.push([row, col]);
            minesPlaced++;
        }
        
        // Calculate numbers for cells adjacent to mines
        this.calculateNumbers();
    }
    
    /**
     * Calculates the number of adjacent mines for each cell
     */
    calculateNumbers() {
        // Loop through all cells
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                // Skip cells with mines
                if (this.grid[i][j] === -1) continue;
                
                // Count adjacent mines
                let count = 0;
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        // Skip the current cell
                        if (di === 0 && dj === 0) continue;
                        
                        const ni = i + di;
                        const nj = j + dj;
                        
                        // Check if neighbor is within bounds
                        if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                            // Increment count if neighbor has mine
                            if (this.grid[ni][nj] === -1) {
                                count++;
                            }
                        }
                    }
                }
                
                // Set count in grid
                this.grid[i][j] = count;
            }
        }
    }
    
    /**
     * Handles left click on a cell (reveal)
     * @param {Event} event - Click event
     */
    handleLeftClick(event) {
        // Don't process clicks if game is over
        if (this.isGameOver) return;
        
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Ignore click if cell is flagged or already revealed
        if (this.flagged[row][col] || this.revealed[row][col]) return;
        
        // First click setup
        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        // Reveal the clicked cell
        this.revealCell(row, col);
    }
    
    /**
     * Handles right click on a cell (flag)
     * @param {Event} event - Click event
     */
    handleRightClick(event) {
        // Prevent context menu
        event.preventDefault();
        
        // Don't process clicks if game is over
        if (this.isGameOver) return;
        
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Ignore if cell is already revealed
        if (this.revealed[row][col]) return;
        
        // Toggle flag
        this.flagged[row][col] = !this.flagged[row][col];
        
        // Update UI
        this.updateCellUI(row, col);
        this.updateMinesCounter();
        
        // Check if player has won after flagging
        this.checkWinCondition();
    }
    
    /**
     * Reveals a cell and updates the game state
     * @param {number} row - Row of the cell to reveal
     * @param {number} col - Column of the cell to reveal
     */
    revealCell(row, col) {
        // Return if cell is out of bounds, already revealed, or flagged
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols || 
            this.revealed[row][col] || this.flagged[row][col]) {
            return;
        }
        
        // Mark as revealed
        this.revealed[row][col] = true;
        
        // Update UI
        this.updateCellUI(row, col);
        
        // Check if it's a mine
        if (this.grid[row][col] === -1) {
            this.gameOver(false);
            return;
        }
        
        // If empty cell (no adjacent mines), reveal neighbors recursively
        if (this.grid[row][col] === 0) {
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    // Skip the current cell
                    if (di === 0 && dj === 0) continue;
                    
                    const ni = row + di;
                    const nj = col + dj;
                    
                    this.revealCell(ni, nj);
                }
            }
        }
        
        // Check win condition
        this.checkWinCondition();
    }
    
    /**
     * Updates the UI of a specific cell
     * @param {number} row - Row of the cell
     * @param {number} col - Column of the cell
     */
    updateCellUI(row, col) {
        // Find the cell element
        const cell = document.querySelector(`.minesweeper-cell[data-row="${row}"][data-col="${col}"]`);
        
        // Update class and content based on state
        if (this.flagged[row][col]) {
            cell.className = 'minesweeper-cell flagged';
            cell.innerHTML = '🚩';
        } else if (!this.revealed[row][col]) {
            cell.className = 'minesweeper-cell';
            cell.innerHTML = '';
        } else {
            cell.className = 'minesweeper-cell revealed';
            
            // Show mine if clicked on one
            if (this.grid[row][col] === -1) {
                cell.className += ' mine';
                cell.innerHTML = '💣';
            } 
            // Show number if there are adjacent mines
            else if (this.grid[row][col] > 0) {
                cell.className += ` number-${this.grid[row][col]}`;
                cell.innerHTML = this.grid[row][col];
            }
            // Empty cell
            else {
                cell.innerHTML = '';
            }
        }
    }
    
    /**
     * Updates the mines counter display
     */
    updateMinesCounter() {
        // Count flagged cells
        let flaggedCount = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.flagged[i][j]) {
                    flaggedCount++;
                }
            }
        }
        
        // Update remaining mines
        this.remainingMines = this.mineCount - flaggedCount;
        this.minesCounterElement.textContent = this.remainingMines;
    }
    
    /**
     * Starts the game timer
     */
    startTimer() {
        this.timer = 0;
        this.timerElement.textContent = formatTime(this.timer);
        
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerElement.textContent = formatTime(this.timer);
        }, 1000);
    }
    
    /**
     * Stops the game timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    /**
     * Checks if the player has won
     */
    checkWinCondition() {
        // Count unrevealed cells
        let unrevealedCount = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.revealed[i][j]) {
                    unrevealedCount++;
                }
            }
        }
        
        // Win if number of unrevealed cells equals number of mines
        if (unrevealedCount === this.mineCount) {
            this.gameOver(true);
        }
    }
    
    /**
     * Ends the game (win or lose)
     * @param {boolean} isWin - Whether the player won
     */
    gameOver(isWin) {
        this.isGameOver = true;
        this.stopTimer();
        
        // Reveal all mines if player lost
        if (!isWin) {
            this.revealAllMines();
        } else {
            // Flag all mines if player won
            this.flagAllMines();
        }
        
        // Show win/lose message
        const title = isWin ? 'You Win!' : 'Game Over';
        const message = isWin 
            ? `Congratulations! You found all the mines in ${formatTime(this.timer)}.` 
            : 'You hit a mine! Better luck next time.';
        
        // Show modal after a short delay
        setTimeout(() => {
            showModal(title, message, () => {
                this.resetGame();
            });
        }, 500);
    }
    
    /**
     * Reveals all mines on the board
     */
    revealAllMines() {
        for (const [row, col] of this.mineLocations) {
            // If not flagged, reveal it
            if (!this.flagged[row][col]) {
                this.revealed[row][col] = true;
                this.updateCellUI(row, col);
            }
        }
    }
    
    /**
     * Flags all mines on the board
     */
    flagAllMines() {
        for (const [row, col] of this.mineLocations) {
            if (!this.flagged[row][col]) {
                this.flagged[row][col] = true;
                this.updateCellUI(row, col);
            }
        }
        this.updateMinesCounter();
    }
    
    /**
     * Changes the game difficulty
     */
    changeDifficulty() {
        this.difficulty = this.difficultySelectElement.value;
        this.resetGame();
    }
    
    /**
     * Resets the game
     */
    resetGame() {
        this.initializeGame();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a new Minesweeper game instance
    const minesweeperGame = new Minesweeper({
        boardElement: 'minesweeper-board',
        timerElement: 'timer',
        minesCounterElement: 'mines-counter',
        resetButtonElement: 'reset-game',
        difficultyElement: 'difficulty'
    });
});
