/**
 * Snake Game
 * 
 * A classic implementation of the Snake game:
 * - Grid-based game with at least 20x20 grid
 * - Snake starts with 3 segments in center
 * - Arrow key controls for movement
 * - Food items appear randomly on the grid
 * - Snake grows when food is consumed
 * - Game over on wall collision or self-collision
 * - Increasing speed as score increases
 * - Score tracking and high score persistence
 * 
 * Features:
 * - Responsive grid-based board
 * - Score tracking with localStorage for high score
 * - Speed increases with score
 * - Clean visual distinction between snake, food, and background
 */

class Snake {
    /**
     * Creates a new Snake game
     * @param {Object} config - Game configuration
     * @param {string} config.boardElement - ID of the element to render the game board
     * @param {string} config.scoreElement - ID of the element to display the score
     * @param {string} config.highScoreElement - ID of the element to display the high score
     * @param {string} config.speedElement - ID of the element to display the speed level
     * @param {string} config.resetButtonElement - ID of the element for the reset button
     * @param {string} config.startButtonElement - ID of the element for the start button
     * @param {string} config.pauseButtonElement - ID of the element for the pause button
     */
    constructor(config) {
        // DOM elements
        this.boardElement = document.getElementById(config.boardElement);
        this.scoreElement = document.getElementById(config.scoreElement);
        this.highScoreElement = document.getElementById(config.highScoreElement);
        this.speedElement = document.getElementById(config.speedElement);
        this.resetButtonElement = document.getElementById(config.resetButtonElement);
        this.startButtonElement = document.getElementById(config.startButtonElement);
        this.pauseButtonElement = document.getElementById(config.pauseButtonElement);
        this.directionButtons = {
            up: document.getElementById(config.upButtonElement),
            down: document.getElementById(config.downButtonElement),
            left: document.getElementById(config.leftButtonElement),
            right: document.getElementById(config.rightButtonElement)
        };
        
        // Game settings
        this.GRID_SIZE = 20; // 20x20 grid
        this.cellSize = this.calculateCellSize();
        
        // Game state
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.speedLevel = 1;
        this.gameInterval = null;
        this.isGameOver = false;
        this.isPaused = false;
        
        // Bind event handlers
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.startGame = this.startGame.bind(this);
        this.pauseGame = this.pauseGame.bind(this);
        this.handleDirectionButton = this.handleDirectionButton.bind(this);
        
        // Initialize event listeners
        this.resetButtonElement.addEventListener('click', this.resetGame);
        this.startButtonElement.addEventListener('click', this.startGame);
        this.pauseButtonElement.addEventListener('click', this.pauseGame);
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Initialize direction button listeners
        for (const [direction, button] of Object.entries(this.directionButtons)) {
            if (button) {
                button.addEventListener('click', () => this.handleDirectionButton(direction));
            }
        }
        
        // Initialize the game board
        this.initializeBoard();
        this.resetGame();
        this.renderHighScore();
    }
    
    /**
     * Calculates the appropriate cell size based on board dimensions
     * @returns {number} Cell size in pixels
     */
    calculateCellSize() {
        const boardWidth = this.boardElement.clientWidth;
        return Math.floor(boardWidth / this.GRID_SIZE);
    }
    
    /**
     * Initializes the game board by creating the grid
     */
    initializeBoard() {
        // Clear any existing content
        this.boardElement.innerHTML = '';
        
        // Create the game grid
        const gridContainer = document.createElement('div');
        gridContainer.className = 'snake-grid';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${this.GRID_SIZE}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${this.GRID_SIZE}, 1fr)`;
        gridContainer.style.width = '100%';
        gridContainer.style.height = '100%';
        gridContainer.style.backgroundColor = 'var(--light-color)';
        
        // Create grid cells
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.width = '100%';
                cell.style.height = '100%';
                cell.style.borderRadius = '2px';
                gridContainer.appendChild(cell);
            }
        }
        
        this.boardElement.appendChild(gridContainer);
        this.gridContainer = gridContainer;
    }
    
    /**
     * Resets the game to initial state
     */
    resetGame() {
        // Clear any existing game interval
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        
        // Reset game state
        this.snake = [
            { row: Math.floor(this.GRID_SIZE / 2), col: Math.floor(this.GRID_SIZE / 2) },
            { row: Math.floor(this.GRID_SIZE / 2), col: Math.floor(this.GRID_SIZE / 2) - 1 },
            { row: Math.floor(this.GRID_SIZE / 2), col: Math.floor(this.GRID_SIZE / 2) - 2 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.speedLevel = 1;
        this.isGameOver = false;
        this.isPaused = false;
        
        // Update UI
        this.updateScore();
        this.updateSpeedLevel();
        this.startButtonElement.disabled = false;
        this.pauseButtonElement.disabled = true;
        
        // Generate first food
        this.generateFood();
        
        // Render initial state
        this.render();
        
        // Display ready message
        this.displayMessage('Press Start to play!');
    }
    
    /**
     * Starts the game
     */
    startGame() {
        if (this.isGameOver) {
            this.resetGame();
        }
        
        if (!this.gameInterval && !this.isPaused) {
            // Calculate speed based on level
            const speed = Math.max(50, 200 - (this.speedLevel - 1) * 15);
            
            // Start game loop
            this.gameInterval = setInterval(() => {
                this.update();
            }, speed);
            
            // Update button states
            this.startButtonElement.disabled = true;
            this.pauseButtonElement.disabled = false;
            
            // Clear any messages
            this.clearMessage();
        } else if (this.isPaused) {
            // Resume from pause
            this.isPaused = false;
            
            // Calculate speed based on level
            const speed = Math.max(50, 200 - (this.speedLevel - 1) * 15);
            
            // Restart game loop
            this.gameInterval = setInterval(() => {
                this.update();
            }, speed);
            
            // Update button states
            this.startButtonElement.disabled = true;
            this.pauseButtonElement.disabled = false;
            
            // Clear any messages
            this.clearMessage();
        }
    }
    
    /**
     * Pauses the game
     */
    pauseGame() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
            this.isPaused = true;
            
            // Update button states
            this.startButtonElement.disabled = false;
            this.pauseButtonElement.disabled = true;
            
            // Display pause message
            this.displayMessage('Game Paused');
        }
    }
    
    /**
     * Updates the game state for each tick
     */
    update() {
        // Apply queued direction change
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const head = { ...this.snake[0] };
        
        // Move head based on direction
        switch (this.direction) {
            case 'up':
                head.row--;
                break;
            case 'down':
                head.row++;
                break;
            case 'left':
                head.col--;
                break;
            case 'right':
                head.col++;
                break;
        }
        
        // Check for collisions
        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }
        
        // Add new head to snake
        this.snake.unshift(head);
        
        // Check if snake ate food
        if (head.row === this.food.row && head.col === this.food.col) {
            // Increase score
            this.score++;
            this.updateScore();
            
            // Potentially increase speed
            if (this.score % 5 === 0) {
                this.increaseSpeed();
            }
            
            // Generate new food
            this.generateFood();
        } else {
            // Remove tail segment if no food was eaten
            this.snake.pop();
        }
        
        // Update visual representation
        this.render();
    }
    
    /**
     * Checks if a position collides with walls or snake body
     * @param {Object} position - Position to check
     * @returns {boolean} True if collision detected, false otherwise
     */
    checkCollision(position) {
        // Wall collision
        if (position.row < 0 || position.row >= this.GRID_SIZE ||
            position.col < 0 || position.col >= this.GRID_SIZE) {
            return true;
        }
        
        // Self collision (check if position exists in snake body)
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].row === position.row && this.snake[i].col === position.col) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Generates a new food item at a random empty position
     */
    generateFood() {
        // Create a list of all empty cells
        const emptyCells = [];
        
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                // Check if the cell is not occupied by the snake
                let isOccupied = false;
                for (const segment of this.snake) {
                    if (segment.row === row && segment.col === col) {
                        isOccupied = true;
                        break;
                    }
                }
                
                if (!isOccupied) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        // Pick a random empty cell
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            this.food = emptyCells[randomIndex];
        } else {
            // This should never happen unless the snake fills the entire grid
            // which would be a win condition, but we'll handle it anyway
            this.food = null;
            this.endGame();
        }
    }
    
    /**
     * Renders the current game state
     */
    render() {
        // Clear all cell styles
        const cells = this.gridContainer.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.style.backgroundColor = '';
            cell.style.boxShadow = '';
            cell.style.borderRadius = '2px';
        });
        
        // Render snake
        this.snake.forEach((segment, index) => {
            const cell = this.getCellElement(segment.row, segment.col);
            if (cell) {
                // Head is a slightly different color
                if (index === 0) {
                    cell.style.backgroundColor = 'var(--accent-color)';
                    cell.style.boxShadow = 'inset 0 0 5px rgba(0, 0, 0, 0.3)';
                } else {
                    cell.style.backgroundColor = 'var(--secondary-color)';
                }
            }
        });
        
        // Render food
        if (this.food) {
            const foodCell = this.getCellElement(this.food.row, this.food.col);
            if (foodCell) {
                foodCell.style.backgroundColor = 'var(--primary-color)';
                foodCell.style.borderRadius = '50%';
            }
        }
    }
    
    /**
     * Gets the DOM element for a specific grid cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {HTMLElement} The cell element
     */
    getCellElement(row, col) {
        return this.gridContainer.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
    }
    
    /**
     * Handles keyboard input for snake direction
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyPress(event) {
        // Only process input if game is running
        if (this.isGameOver || this.isPaused || !this.gameInterval) {
            return;
        }
        
        switch (event.key) {
            case 'ArrowUp':
                // Prevent going down if already moving up
                if (this.direction !== 'down') {
                    this.nextDirection = 'up';
                }
                event.preventDefault();
                break;
            case 'ArrowDown':
                // Prevent going up if already moving down
                if (this.direction !== 'up') {
                    this.nextDirection = 'down';
                }
                event.preventDefault();
                break;
            case 'ArrowLeft':
                // Prevent going right if already moving left
                if (this.direction !== 'right') {
                    this.nextDirection = 'left';
                }
                event.preventDefault();
                break;
            case 'ArrowRight':
                // Prevent going left if already moving right
                if (this.direction !== 'left') {
                    this.nextDirection = 'right';
                }
                event.preventDefault();
                break;
        }
    }
    
    /**
     * Handles direction button clicks
     * @param {string} direction - Direction to move ('up', 'down', 'left', 'right')
     */
    handleDirectionButton(direction) {
        // Only process input if game is running
        if (this.isGameOver || this.isPaused || !this.gameInterval) {
            return;
        }
        
        // Prevent moving in opposite direction
        if ((direction === 'up' && this.direction !== 'down') ||
            (direction === 'down' && this.direction !== 'up') ||
            (direction === 'left' && this.direction !== 'right') ||
            (direction === 'right' && this.direction !== 'left')) {
            this.nextDirection = direction;
        }
    }
    
    /**
     * Ends the game when a collision occurs
     */
    endGame() {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
        this.isGameOver = true;
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.renderHighScore();
        }
        
        // Update button states
        this.startButtonElement.disabled = false;
        this.pauseButtonElement.disabled = true;
        
        // Display game over message
        this.displayMessage('Game Over! Press Start to play again.');
    }
    
    /**
     * Increases the game speed
     */
    increaseSpeed() {
        // Increase speed level
        this.speedLevel++;
        this.updateSpeedLevel();
        
        // Update game interval with new speed if game is running
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            
            const speed = Math.max(50, 200 - (this.speedLevel - 1) * 15);
            this.gameInterval = setInterval(() => {
                this.update();
            }, speed);
        }
    }
    
    /**
     * Updates the score display
     */
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    /**
     * Updates the speed level display
     */
    updateSpeedLevel() {
        this.speedElement.textContent = this.speedLevel;
    }
    
    /**
     * Loads the high score from localStorage
     * @returns {number} The high score
     */
    loadHighScore() {
        const storedHighScore = localStorage.getItem('snakeHighScore');
        return storedHighScore ? parseInt(storedHighScore, 10) : 0;
    }
    
    /**
     * Saves the high score to localStorage
     */
    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
    
    /**
     * Updates the high score display
     */
    renderHighScore() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    /**
     * Displays a message on the game board
     * @param {string} message - Message to display
     */
    displayMessage(message) {
        // Remove any existing message
        this.clearMessage();
        
        // Create message overlay
        const messageOverlay = document.createElement('div');
        messageOverlay.className = 'message-overlay';
        messageOverlay.style.position = 'absolute';
        messageOverlay.style.top = '0';
        messageOverlay.style.left = '0';
        messageOverlay.style.width = '100%';
        messageOverlay.style.height = '100%';
        messageOverlay.style.display = 'flex';
        messageOverlay.style.justifyContent = 'center';
        messageOverlay.style.alignItems = 'center';
        messageOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageOverlay.style.color = 'white';
        messageOverlay.style.fontSize = '1.5rem';
        messageOverlay.style.textAlign = 'center';
        messageOverlay.style.zIndex = '10';
        messageOverlay.style.borderRadius = 'var(--border-radius-sm)';
        
        // Add message text
        const messageText = document.createElement('p');
        messageText.textContent = message;
        messageOverlay.appendChild(messageText);
        
        // Add to board
        this.boardElement.style.position = 'relative';
        this.boardElement.appendChild(messageOverlay);
    }
    
    /**
     * Clears any displayed message
     */
    clearMessage() {
        const existingMessage = this.boardElement.querySelector('.message-overlay');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
}


// Initialize the Snake game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the Snake page
    if (document.getElementById('snake-board')) {
        const snake = new Snake({
            boardElement: 'snake-board',
            scoreElement: 'current-score',
            highScoreElement: 'high-score',
            speedElement: 'speed-level',
            resetButtonElement: 'reset-game',
            startButtonElement: 'start-btn',
            pauseButtonElement: 'pause-btn',
            upButtonElement: 'up-btn',
            downButtonElement: 'down-btn',
            leftButtonElement: 'left-btn',
            rightButtonElement: 'right-btn'
        });
    }
});
