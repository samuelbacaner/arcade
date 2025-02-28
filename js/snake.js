// Snake Game Implementation
class SnakeGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}]; // Start in middle
        this.direction = 'right';
        this.food = null;
        this.score = 0;
        this.gameLoop = null;
        this.speed = 200; // Starting speed in ms
        this.isGameOver = false;
        this.setupGame();
    }

    setupGame() {
        // Create game board
        this.createGameBoard();
        // Create score display
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.className = 'snake-score';
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.container.insertBefore(this.scoreDisplay, this.board);

        // Create controls
        this.createControls();
        // Create game over screen
        this.createGameOverScreen();
        // Initialize event listeners
        this.setupEventListeners();
        // Place initial food
        this.placeFood();
    }

    createGameBoard() {
        this.board = document.createElement('div');
        this.board.className = 'snake-game-board';
        this.cells = [];
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'snake-cell';
            this.board.appendChild(cell);
            this.cells.push(cell);
        }
        
        this.container.appendChild(this.board);
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'snake-controls';
        
        const startBtn = document.createElement('button');
        startBtn.className = 'game-btn';
        startBtn.textContent = 'Start Game';
        startBtn.onclick = () => this.startGame();
        
        controls.appendChild(startBtn);
        this.container.appendChild(controls);
    }

    createGameOverScreen() {
        this.gameOverScreen = document.createElement('div');
        this.gameOverScreen.className = 'snake-game-over';
        
        const gameOverText = document.createElement('h3');
        gameOverText.textContent = 'Game Over!';
        
        const finalScore = document.createElement('p');
        finalScore.id = 'final-score';
        
        const restartBtn = document.createElement('button');
        restartBtn.className = 'game-btn';
        restartBtn.textContent = 'Play Again';
        restartBtn.onclick = () => this.resetGame();
        
        this.gameOverScreen.appendChild(gameOverText);
        this.gameOverScreen.appendChild(finalScore);
        this.gameOverScreen.appendChild(restartBtn);
        this.container.appendChild(this.gameOverScreen);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            
            const key = e.key.toLowerCase();
            const newDirection = {
                'arrowup': 'up',
                'w': 'up',
                'arrowdown': 'down',
                's': 'down',
                'arrowleft': 'left',
                'a': 'left',
                'arrowright': 'right',
                'd': 'right'
            }[key];

            if (newDirection && this.isValidDirection(newDirection)) {
                this.direction = newDirection;
            }
        });
    }

    isValidDirection(newDirection) {
        if (this.direction === 'up' && newDirection === 'down') return false;
        if (this.direction === 'down' && newDirection === 'up') return false;
        if (this.direction === 'left' && newDirection === 'right') return false;
        if (this.direction === 'right' && newDirection === 'left') return false;
        return true;
    }

    startGame() {
        if (this.gameLoop) return;
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    update() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision with walls
        if (head.x < 0 || head.x >= this.gridSize || 
            head.y < 0 || head.y >= this.gridSize) {
            this.gameOver();
            return;
        }

        // Check collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreDisplay.textContent = `Score: ${this.score}`;
            this.placeFood();
            // Increase speed every 50 points
            if (this.score % 50 === 0) {
                this.speed = Math.max(50, this.speed - 20);
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            this.snake.pop();
        }

        this.render();
    }

    placeFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => 
            segment.x === this.food.x && segment.y === this.food.y));
    }

    render() {
        // Clear all cells
        this.cells.forEach(cell => cell.className = 'snake-cell');
        
        // Render snake
        this.snake.forEach(segment => {
            const index = segment.y * this.gridSize + segment.x;
            if (this.cells[index]) {
                this.cells[index].classList.add('snake');
            }
        });
        
        // Render food
        const foodIndex = this.food.y * this.gridSize + this.food.x;
        if (this.cells[foodIndex]) {
            this.cells[foodIndex].classList.add('food');
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.isGameOver = true;
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        this.gameOverScreen.style.display = 'block';
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.score = 0;
        this.speed = 200;
        this.isGameOver = false;
        this.gameOverScreen.style.display = 'none';
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.placeFood();
        this.render();
        this.startGame();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame('snake');
});
