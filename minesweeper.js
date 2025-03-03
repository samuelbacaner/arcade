// Game configuration
const gameConfig = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

// Game state
let board = [];
let minesCount = 0;
let flagsPlaced = 0;
let gameOver = false;
let currentDifficulty = 'beginner';

// DOM elements
const gameBoard = document.getElementById('game-board');
const difficultySelect = document.getElementById('difficulty');
const newGameBtn = document.getElementById('new-game-btn');
const minesCountDisplay = document.getElementById('mines-count');
const gameMessage = document.getElementById('game-message');

// Event listeners
difficultySelect.addEventListener('change', handleDifficultyChange);
newGameBtn.addEventListener('click', initGame);

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Handle difficulty change
function handleDifficultyChange() {
    currentDifficulty = difficultySelect.value;
    initGame();
}

// Initialize the game
function initGame() {
    // Reset game state
    gameOver = false;
    flagsPlaced = 0;
    gameMessage.textContent = '';
    
    // Get current config
    const config = gameConfig[currentDifficulty];
    minesCount = config.mines;
    minesCountDisplay.textContent = minesCount;
    
    // Create game board
    board = createBoard(config.rows, config.cols);
    renderBoard();
    placeMines(config.mines);
    calculateAdjacentMines();
}

// Create the game board
function createBoard(rows, cols) {
    const board = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push({
                row: i,
                col: j,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            });
        }
        board.push(row);
    }
    return board;
}

// Render the game board in the DOM
function renderBoard() {
    // Clear the game board
    gameBoard.innerHTML = '';
    
    // Set grid columns based on current difficulty
    const config = gameConfig[currentDifficulty];
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    
    // Create cells
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // Add event listeners
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleCellRightClick);
            
            gameBoard.appendChild(cell);
        }
    }
}

// Place mines randomly on the board
function placeMines(count) {
    const rows = board.length;
    const cols = board[0].length;
    let minesPlaced = 0;
    
    while (minesPlaced < count) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            minesPlaced++;
        }
    }
}

// Calculate adjacent mines for each cell
function calculateAdjacentMines() {
    const rows = board.length;
    const cols = board[0].length;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].isMine) continue;
            
            let count = 0;
            
            // Check all 8 adjacent cells
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    
                    const ni = i + di;
                    const nj = j + dj;
                    
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && board[ni][nj].isMine) {
                        count++;
                    }
                }
            }
            
            board[i][j].adjacentMines = count;
        }
    }
}

// Handle cell click event
function handleCellClick(event) {
    if (gameOver) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];
    
    // Ignore if cell is flagged or already revealed
    if (cell.isFlagged || cell.isRevealed) return;
    
    // Reveal the cell
    revealCell(row, col);
    
    // Check if game is won
    checkWinCondition();
}

// Handle right-click (flag placement)
function handleCellRightClick(event) {
    event.preventDefault();
    
    if (gameOver) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];
    
    // Ignore if cell is already revealed
    if (cell.isRevealed) return;
    
    // Toggle flag
    if (cell.isFlagged) {
        cell.isFlagged = false;
        flagsPlaced--;
    } else {
        // Don't allow more flags than mines
        if (flagsPlaced >= minesCount) return;
        
        cell.isFlagged = true;
        flagsPlaced++;
    }
    
    // Update the display
    updateCellDisplay(row, col);
    minesCountDisplay.textContent = minesCount - flagsPlaced;
    
    // Check if game is won
    checkWinCondition();
}

// Reveal a cell
function revealCell(row, col) {
    const cell = board[row][col];
    
    // Ignore if cell is already revealed or flagged
    if (cell.isRevealed || cell.isFlagged) return;
    
    // Mark as revealed
    cell.isRevealed = true;
    
    // Update the display
    updateCellDisplay(row, col);
    
    // If it's a mine, game over
    if (cell.isMine) {
        gameOver = true;
        revealAllMines();
        gameMessage.textContent = 'Game Over! You hit a mine.';
        return;
    }
    
    // If it's a cell with no adjacent mines, reveal all adjacent cells
    if (cell.adjacentMines === 0) {
        const rows = board.length;
        const cols = board[0].length;
        
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                
                const ni = row + di;
                const nj = col + dj;
                
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    revealCell(ni, nj);
                }
            }
        }
    }
}

// Update the display of a cell
function updateCellDisplay(row, col) {
    const cell = board[row][col];
    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    
    // Update classes
    cellElement.classList.remove('revealed', 'mine', 'flagged');
    
    if (cell.isRevealed) {
        cellElement.classList.add('revealed');
        
        if (cell.isMine) {
            cellElement.classList.add('mine');
            cellElement.textContent = '💣';
        } else if (cell.adjacentMines > 0) {
            cellElement.textContent = cell.adjacentMines;
            cellElement.dataset.value = cell.adjacentMines;
        } else {
            cellElement.textContent = '';
        }
    } else if (cell.isFlagged) {
        cellElement.classList.add('flagged');
        cellElement.textContent = '🚩';
    } else {
        cellElement.textContent = '';
        delete cellElement.dataset.value;
    }
}

// Reveal all mines
function revealAllMines() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isRevealed = true;
                updateCellDisplay(i, j);
            }
        }
    }
}

// Check if the game is won
function checkWinCondition() {
    // Count revealed cells
    let revealedCount = 0;
    let totalCells = 0;
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            totalCells++;
            if (board[i][j].isRevealed) {
                revealedCount++;
            }
        }
    }
    
    // Check if all non-mine cells are revealed
    const config = gameConfig[currentDifficulty];
    if (revealedCount === totalCells - config.mines) {
        gameOver = true;
        gameMessage.textContent = 'Congratulations! You won!';
        
        // Flag all remaining mines
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].isMine && !board[i][j].isFlagged) {
                    board[i][j].isFlagged = true;
                    updateCellDisplay(i, j);
                }
            }
        }
        
        // Update mines count
        minesCountDisplay.textContent = 0;
    }
}
