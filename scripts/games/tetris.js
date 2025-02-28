/**
 * Tetris Game
 * 
 * A classic implementation of the Tetris game with standard rules:
 * - 10x20 grid game board
 * - 7 standard Tetrimino shapes (I, O, T, J, L, S, Z)
 * - Random sequence of falling Tetriminos
 * - Preview of next piece
 * - Arrow key controls for movement and rotation
 * - Spacebar for hard drop
 * - Scoring system for lines cleared
 * - Increasing difficulty over time
 * 
 * Features:
 * - Standard 10x20 grid
 * - Next piece preview
 * - Score tracking with bonuses for multiple lines
 * - Level progression with increasing speed
 * - Game over detection
 */

class Tetris {
    /**
     * Creates a new Tetris game
     * @param {Object} config - Game configuration
     * @param {string} config.boardElement - ID of the element to render the game board
     * @param {string} config.nextPieceElement - ID of the element to display the next piece
     * @param {string} config.scoreElement - ID of the element to display the score
     * @param {string} config.levelElement - ID of the element to display the level
     * @param {string} config.linesElement - ID of the element to display cleared lines
     * @param {string} config.resetButtonElement - ID of the element for the reset button
     */
    constructor(config) {
        // DOM elements
        this.boardElement = document.getElementById(config.boardElement);
        this.nextPieceElement = document.getElementById(config.nextPieceElement);
        this.scoreElement = document.getElementById(config.scoreElement);
        this.levelElement = document.getElementById(config.levelElement);
        this.linesElement = document.getElementById(config.linesElement);
        this.resetButtonElement = document.getElementById(config.resetButtonElement);
        
        // Game settings
        this.ROWS = 20;
        this.COLS = 10;
        this.BLOCK_SIZE = this.calculateBlockSize();
        
        // Game state
        this.board = [];
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.gameInterval = null;
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Tetrimino definitions
        this.tetriminos = {
            I: {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: '#00FFFF' // Cyan
            },
            O: {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#FFFF00' // Yellow
            },
            T: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#800080' // Purple
            },
            J: {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#0000FF' // Blue
            },
            L: {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#FF7F00' // Orange
            },
            S: {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: '#00FF00' // Green
            },
            Z: {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: '#FF0000' // Red
            }
        };
        
        // Bind event handlers
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.resetGame = this.resetGame.bind(this);
        
        // Add event listeners
        window.addEventListener('keydown', this.handleKeyPress);
        this.resetButtonElement.addEventListener('click', this.resetGame);
        
        // Initialize the game
        this.initializeGame();
    }
    
    /**
     * Calculates the block size based on the board element size
     * @returns {number} The size in pixels for each block
     */
    calculateBlockSize() {
        // Get the width of the board element
        const boardWidth = this.boardElement.clientWidth;
        // Calculate block size (board width / number of columns)
        return Math.floor(boardWidth / this.COLS);
    }
    
    /**
     * Initializes the game
     */
    initializeGame() {
        this.createBoard();
        this.createNextPieceDisplay();
        this.resetGame();
    }
    
    /**
     * Creates the game board elements
     */
    createBoard() {
        // Clear existing board
        this.boardElement.innerHTML = '';
        this.boardElement.style.width = `${this.COLS * this.BLOCK_SIZE}px`;
        this.boardElement.style.height = `${this.ROWS * this.BLOCK_SIZE}px`;
        this.boardElement.style.position = 'relative';
        this.boardElement.style.backgroundColor = '#f0f0f0';
        this.boardElement.style.border = '2px solid #333';
        
        // Initialize the board array
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
    }
    
    /**
     * Creates the next piece display
     */
    createNextPieceDisplay() {
        // Clear existing display
        this.nextPieceElement.innerHTML = '';
        this.nextPieceElement.style.position = 'relative';
        this.nextPieceElement.style.backgroundColor = '#f0f0f0';
        this.nextPieceElement.style.border = '2px solid #333';
        this.nextPieceElement.style.display = 'flex';
        this.nextPieceElement.style.justifyContent = 'center';
        this.nextPieceElement.style.alignItems = 'center';
    }
    
    /**
     * Resets the game to its initial state
     */
    resetGame() {
        // Clear game state
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameOver = false;
        this.isPaused = false;
        
        // Clear any existing game interval
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        // Generate the first and next pieces
        this.currentPiece = this.generateRandomPiece();
        this.nextPiece = this.generateRandomPiece();
        
        // Update UI
        this.updateScore();
        this.updateLevel();
        this.updateLines();
        this.renderBoard();
        this.renderNextPiece();
        
        // Start the game loop
        this.startGameLoop();
    }
    
    /**
     * Starts the game loop with appropriate speed based on level
     */
    startGameLoop() {
        const speed = this.calculateSpeed();
        this.gameInterval = setInterval(() => {
            this.moveDown();
        }, speed);
    }
    
    /**
     * Calculates the game speed based on the current level
     * @returns {number} The interval in milliseconds between piece movements
     */
    calculateSpeed() {
        // Base speed at level 1 is 1000ms (1 second)
        // Each level reduces the speed by 100ms down to a minimum of 100ms
        return Math.max(1000 - ((this.level - 1) * 100), 100);
    }
    
    /**
     * Updates the score display
     */
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    /**
     * Updates the level display
     */
    updateLevel() {
        this.levelElement.textContent = this.level;
    }
    
    /**
     * Updates the lines display
     */
    updateLines() {
        this.linesElement.textContent = this.lines;
    }
    
    /**
     * Generates a random tetrimino piece
     * @returns {Object} A piece object with type, shape, color, and position
     */
    generateRandomPiece() {
        // Get all tetrimino types
        const types = Object.keys(this.tetriminos);
        // Select a random type
        const type = types[Math.floor(Math.random() * types.length)];
        // Get the tetrimino data
        const tetrimino = this.tetriminos[type];
        
        // Create a new piece object
        return {
            type: type,
            shape: JSON.parse(JSON.stringify(tetrimino.shape)), // Deep copy of the shape
            color: tetrimino.color,
            x: Math.floor(this.COLS / 2) - Math.floor(tetrimino.shape[0].length / 2),
            y: 0
        };
    }
    
    /**
     * Generates a new current piece and updates the next piece
     */
    generateNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generateRandomPiece();
        
        // Check if the new piece can be placed
        if (this.isCollision()) {
            this.gameOver();
        } else {
            this.renderBoard();
            this.renderNextPiece();
        }
    }
    
    /**
     * Handles keypress events for game controls
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyPress(event) {
        if (this.isGameOver || this.isPaused) return;
        
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.moveLeft();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.moveRight();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.moveDown();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.rotate();
                break;
            case ' ':
                event.preventDefault();
                this.hardDrop();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
        }
    }
    
    /**
     * Toggles the game pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            clearInterval(this.gameInterval);
            this.displayPauseMessage();
        } else {
            this.startGameLoop();
            this.renderBoard();
        }
    }
    
    /**
     * Displays a pause message on the board
     */
    displayPauseMessage() {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10';
        overlay.style.color = 'white';
        overlay.style.fontSize = '24px';
        overlay.style.fontWeight = 'bold';
        overlay.textContent = 'PAUSED';
        overlay.id = 'pause-overlay';
        
        // Remove any existing pause overlay
        const existing = document.getElementById('pause-overlay');
        if (existing) existing.remove();
        
        this.boardElement.appendChild(overlay);
    }
    
    /**
     * Moves the current piece to the left if possible
     */
    moveLeft() {
        this.currentPiece.x--;
        if (this.isCollision()) {
            this.currentPiece.x++;
        } else {
            this.renderBoard();
        }
    }
    
    /**
     * Moves the current piece to the right if possible
     */
    moveRight() {
        this.currentPiece.x++;
        if (this.isCollision()) {
            this.currentPiece.x--;
        } else {
            this.renderBoard();
        }
    }
    
    /**
     * Moves the current piece down one cell
     * If collision detected, places the piece and generates a new one
     */
    moveDown() {
        if (this.isGameOver || this.isPaused) return;
        
        this.currentPiece.y++;
        
        if (this.isCollision()) {
            this.currentPiece.y--;
            this.placePiece();
            this.clearLines();
            this.generateNewPiece();
        } else {
            this.renderBoard();
        }
    }
    
    /**
     * Performs a hard drop - moves the piece all the way down instantly
     */
    hardDrop() {
        while (!this.isCollision()) {
            this.currentPiece.y++;
        }
        
        // Move back up one as we've detected a collision
        this.currentPiece.y--;
        this.placePiece();
        this.clearLines();
        this.generateNewPiece();
    }
    
    /**
     * Rotates the current piece clockwise if possible
     */
    rotate() {
        const originalShape = JSON.parse(JSON.stringify(this.currentPiece.shape));
        const originalX = this.currentPiece.x;
        
        // Perform the rotation
        this.rotatePieceMatrix();
        
        // Check if the rotated piece collides
        if (this.isCollision()) {
            // Wall kick: try to move the piece left or right to make rotation work
            // Try moving right
            this.currentPiece.x++;
            if (this.isCollision()) {
                // Try moving left
                this.currentPiece.x -= 2;
                if (this.isCollision()) {
                    // If still colliding, restore the original position and shape
                    this.currentPiece.x = originalX;
                    this.currentPiece.shape = originalShape;
                    return;
                }
            }
        }
        
        this.renderBoard();
    }
    
    /**
     * Rotates a matrix 90 degrees clockwise
     * Used for rotating the current tetrimino
     */
    rotatePieceMatrix() {
        const shape = this.currentPiece.shape;
        const n = shape.length;
        
        // Create a new rotated matrix
        const rotated = Array(n).fill().map(() => Array(n).fill(0));
        
        // Perform the rotation
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                rotated[j][n - 1 - i] = shape[i][j];
            }
        }
        
        this.currentPiece.shape = rotated;
    }
    
    /**
     * Checks if the current piece collides with the board boundaries or existing pieces
     * @returns {boolean} True if collision detected, false otherwise
     */
    isCollision() {
        const { shape, x, y } = this.currentPiece;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    // Check if out of bounds or colliding with a placed piece
                    if (
                        boardX < 0 || 
                        boardX >= this.COLS || 
                        boardY >= this.ROWS ||
                        (boardY >= 0 && this.board[boardY][boardX] !== 0)
                    ) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Places the current piece on the board
     */
    placePiece() {
        const { shape, x, y, color } = this.currentPiece;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = color;
                    }
                }
            }
        }
    }
    
    /**
     * Checks for and clears completed lines
     */
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.ROWS - 1; row >= 0; row--) {
            let isLineComplete = true;
            
            // Check if the row is complete
            for (let col = 0; col < this.COLS; col++) {
                if (this.board[row][col] === 0) {
                    isLineComplete = false;
                    break;
                }
            }
            
            if (isLineComplete) {
                linesCleared++;
                
                // Remove the line and add an empty one at the top
                this.board.splice(row, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                
                // Since we removed a line, we need to check the same row again
                row++;
            }
        }
        
        if (linesCleared > 0) {
            // Update score based on lines cleared
            this.updateScoreWithLines(linesCleared);
            
            // Update total lines cleared
            this.lines += linesCleared;
            this.updateLines();
            
            // Check for level increase (every 10 lines)
            if (Math.floor(this.lines / 10) > Math.floor((this.lines - linesCleared) / 10)) {
                this.level++;
                this.updateLevel();
                
                // Reset the game interval with the new speed
                clearInterval(this.gameInterval);
                this.startGameLoop();
            }
        }
    }
    
    /**
     * Updates the score based on the number of lines cleared
     * @param {number} linesCleared - Number of lines cleared
     */
    updateScoreWithLines(linesCleared) {
        let points;
        
        // Standard Tetris scoring system
        switch (linesCleared) {
            case 1:
                points = 100;
                break;
            case 2:
                points = 300;
                break;
            case 3:
                points = 500;
                break;
            case 4:
                points = 800; // Tetris!
                break;
            default:
                points = 0;
        }
        
        // Multiply by level for increasing difficulty reward
        this.score += points * this.level;
        this.updateScore();
    }
    
    /**
     * Handles game over state
     */
    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        this.displayGameOverMessage();
    }
    
    /**
     * Displays the game over message
     */
    displayGameOverMessage() {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10';
        overlay.style.color = 'white';
        overlay.style.padding = '20px';
        overlay.id = 'game-over-overlay';
        
        const gameOverText = document.createElement('div');
        gameOverText.textContent = 'GAME OVER';
        gameOverText.style.fontSize = '28px';
        gameOverText.style.fontWeight = 'bold';
        gameOverText.style.marginBottom = '10px';
        
        const scoreText = document.createElement('div');
        scoreText.textContent = `Final Score: ${this.score}`;
        scoreText.style.fontSize = '20px';
        scoreText.style.marginBottom = '20px';
        
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Play Again';
        resetButton.className = 'game-btn reset';
        resetButton.style.fontSize = '16px';
        resetButton.style.padding = '8px 16px';
        resetButton.addEventListener('click', this.resetGame);
        
        overlay.appendChild(gameOverText);
        overlay.appendChild(scoreText);
        overlay.appendChild(resetButton);
        
        // Remove any existing game over overlay
        const existing = document.getElementById('game-over-overlay');
        if (existing) existing.remove();
        
        this.boardElement.appendChild(overlay);
    }
    
    /**
     * Renders the game board with the current state
     */
    renderBoard() {
        // Clear existing board elements
        this.boardElement.innerHTML = '';
        
        // Render placed blocks
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                const cellValue = this.board[row][col];
                if (cellValue !== 0) {
                    this.drawBlock(col, row, cellValue);
                }
            }
        }
        
        // Render the current piece
        this.renderCurrentPiece();
    }
    
    /**
     * Renders the current active piece
     */
    renderCurrentPiece() {
        if (!this.currentPiece) return;
        
        const { shape, x, y, color } = this.currentPiece;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    // Only render if within board boundaries
                    if (boardY >= 0 && boardY < this.ROWS && boardX >= 0 && boardX < this.COLS) {
                        this.drawBlock(boardX, boardY, color);
                    }
                }
            }
        }
    }
    
    /**
     * Renders the next piece preview
     */
    renderNextPiece() {
        if (!this.nextPiece) return;
        
        // Clear the next piece display
        this.nextPieceElement.innerHTML = '';
        
        const { shape, color } = this.nextPiece;
        
        // Calculate block size for the preview (smaller than main board)
        const previewSize = Math.min(
            this.nextPieceElement.clientWidth / 4, 
            this.nextPieceElement.clientHeight / 4
        );
        
        // Create a centered container for the preview
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = `${shape[0].length * previewSize}px`;
        container.style.height = `${shape.length * previewSize}px`;
        container.style.margin = 'auto';
        
        // Add blocks for the piece
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const block = document.createElement('div');
                    
                    block.style.position = 'absolute';
                    block.style.left = `${col * previewSize}px`;
                    block.style.top = `${row * previewSize}px`;
                    block.style.width = `${previewSize - 2}px`;
                    block.style.height = `${previewSize - 2}px`;
                    block.style.backgroundColor = color;
                    block.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                    
                    container.appendChild(block);
                }
            }
        }
        
        this.nextPieceElement.appendChild(container);
    }
    
    /**
     * Draws a single block at the specified coordinates
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {string} color - The block color
     */
    drawBlock(x, y, color) {
        const block = document.createElement('div');
        
        block.style.position = 'absolute';
        block.style.left = `${x * this.BLOCK_SIZE}px`;
        block.style.top = `${y * this.BLOCK_SIZE}px`;
        block.style.width = `${this.BLOCK_SIZE - 2}px`;
        block.style.height = `${this.BLOCK_SIZE - 2}px`;
        block.style.backgroundColor = color;
        block.style.border = '1px solid rgba(0, 0, 0, 0.3)';
        
        this.boardElement.appendChild(block);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Tetris({
        boardElement: 'tetris-board',
        nextPieceElement: 'next-piece',
        scoreElement: 'score',
        levelElement: 'level',
        linesElement: 'lines',
        resetButtonElement: 'reset-game'
    });
    
    // Add help button functionality
    const helpButton = document.getElementById('help-btn');
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            alert(`Tetris Controls:
- Arrow Left/Right: Move piece
- Arrow Down: Move down
- Arrow Up: Rotate piece
- Spacebar: Hard drop
- P: Pause/Resume game`);
        });
    }
});
