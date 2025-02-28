import GameBase from '../shared/gameBase.js';
import { collision, canvas, keyboard, random } from '../shared/utils.js';

export default class Snake extends GameBase {
    constructor(containerId) {
        super(containerId);
        
        // Set canvas size for snake game
        this.canvas.width = 600;
        this.canvas.height = 600;
        
        // Game configuration
        this.gridSize = 20; // 20x20 grid
        this.cellSize = this.canvas.width / this.gridSize;
        this.initialSpeed = 200; // ms per move
        this.speedIncrease = 0.95; // speed multiplier per food eaten
        this.minSpeed = 50; // minimum ms per move
        
        // Game state
        this.snake = [];
        this.food = null;
        this.specialFood = null;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.lastMoveTime = 0;
        this.currentSpeed = this.initialSpeed;
        this.wallWrapMode = false;
    }

    init() {
        super.init();
        this.reset();
    }

    reset() {
        super.reset();
        // Reset snake to center
        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.currentSpeed = this.initialSpeed;
        this.spawnFood();
        this.specialFood = null;
    }

    spawnFood() {
        let newFood;
        do {
            newFood = {
                x: random.int(0, this.gridSize - 1),
                y: random.int(0, this.gridSize - 1)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
        
        // 10% chance to spawn special food
        if (!this.specialFood && Math.random() < 0.1) {
            do {
                newFood = {
                    x: random.int(0, this.gridSize - 1),
                    y: random.int(0, this.gridSize - 1)
                };
            } while (
                (this.food.x === newFood.x && this.food.y === newFood.y) ||
                this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
            );
            this.specialFood = { ...newFood, points: 5 };
        }
    }

    update(timestamp) {
        if (!this.isRunning) return;

        // Handle input
        if (keyboard.isPressed('ArrowUp') && this.direction.y !== 1) {
            this.nextDirection = { x: 0, y: -1 };
        } else if (keyboard.isPressed('ArrowDown') && this.direction.y !== -1) {
            this.nextDirection = { x: 0, y: 1 };
        } else if (keyboard.isPressed('ArrowLeft') && this.direction.x !== 1) {
            this.nextDirection = { x: -1, y: 0 };
        } else if (keyboard.isPressed('ArrowRight') && this.direction.x !== -1) {
            this.nextDirection = { x: 1, y: 0 };
        }

        // Move snake based on timing
        if (!this.lastMoveTime || timestamp - this.lastMoveTime >= this.currentSpeed) {
            this.direction = this.nextDirection;
            
            // Calculate new head position
            const head = this.snake[0];
            let newHead = {
                x: head.x + this.direction.x,
                y: head.y + this.direction.y
            };

            // Handle wall wrap/collision
            if (this.wallWrapMode) {
                newHead.x = (newHead.x + this.gridSize) % this.gridSize;
                newHead.y = (newHead.y + this.gridSize) % this.gridSize;
            } else if (
                newHead.x < 0 || newHead.x >= this.gridSize ||
                newHead.y < 0 || newHead.y >= this.gridSize
            ) {
                this.gameOver();
                return;
            }

            // Check self collision
            if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                this.gameOver();
                return;
            }

            // Move snake
            this.snake.unshift(newHead);

            // Check food collision
            if (newHead.x === this.food.x && newHead.y === this.food.y) {
                this.score += 1;
                this.currentSpeed = Math.max(this.minSpeed, this.currentSpeed * this.speedIncrease);
                this.spawnFood();
            } else if (
                this.specialFood &&
                newHead.x === this.specialFood.x &&
                newHead.y === this.specialFood.y
            ) {
                this.score += this.specialFood.points;
                this.currentSpeed = Math.max(this.minSpeed, this.currentSpeed * this.speedIncrease);
                this.specialFood = null;
            } else {
                this.snake.pop();
            }

            this.lastMoveTime = timestamp;
        }
    }

    render() {
        canvas.clear(this.ctx);

        // Draw grid background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
            this.ctx.fillRect(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1
            );
        });

        // Draw regular food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.cellSize,
            this.food.y * this.cellSize,
            this.cellSize - 1,
            this.cellSize - 1
        );

        // Draw special food if it exists
        if (this.specialFood) {
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.fillRect(
                this.specialFood.x * this.cellSize,
                this.specialFood.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1
            );
        }

        // Draw score
        canvas.drawText(this.ctx, `Score: ${this.score}`, 10, 30, {
            font: '24px Arial',
            color: '#2c3e50',
            align: 'left',
            baseline: 'top'
        });
    }

    gameOver() {
        this.state = 'gameOver';
        this.isRunning = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            scoreManager.setHighScore(this.constructor.name, this.score);
        }
        this.showOverlay('Game Over', {
            buttons: [{
                text: 'Play Again',
                onClick: () => {
                    this.reset();
                    this.start();
                }
            }]
        });
    }
}
