// Base game class that all arcade games will extend
import { scoreManager } from './utils.js';

export default class GameBase {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.score = 0;
        this.highScore = scoreManager.getHighScore(this.constructor.name);
        
        // Default canvas size - can be overridden by specific games
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Game state management
        this.state = 'idle'; // idle, running, paused, gameOver
        
        // Create UI elements
        this.uiElements = {
            scoreDisplay: null,
            overlay: null,
            controls: null
        };

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    // Initialize game state
    init() {
        // Setup canvas
        this.container.appendChild(this.canvas);
        
        // Create UI
        this.createUI();
        
        // Setup input handlers
        keyboard.init();
        this.setupEventListeners();
        
        // Initial render
        this.render();
    }

    // Start game loop
    start() {
        if (this.state !== 'running') {
            this.state = 'running';
            this.isRunning = true;
            this.gameLoop();
            this.updateUI();
        }
    }

    // Pause game
    pause() {
        if (this.state === 'running') {
            this.state = 'paused';
            this.isRunning = false;
            this.showOverlay('Paused', {
                buttons: [{
                    text: 'Resume',
                    onClick: () => this.resume(),
                    className: 'resume-button'
                }]
            });
        }
    }

    // Resume game
    resume() {
        if (this.state === 'paused') {
            this.state = 'running';
            this.isRunning = true;
            this.hideOverlay();
            this.gameLoop();
        }
    }

    // Reset game state
    reset() {
        this.score = 0;
        this.state = 'idle';
        this.isRunning = false;
        keyboard.reset();
        this.hideOverlay();
        this.updateUI();
        // Specific reset logic to be implemented by each game
    }

    // Game loop using requestAnimationFrame
    gameLoop(timestamp) {
        if (!this.isRunning) return;

        this.update(timestamp);
        this.render();
        this.updateUI();

        requestAnimationFrame(this.gameLoop);
    }

    // Update game state - to be implemented by specific games
    update(timestamp) {
        // Game-specific update logic
    }

    // Render game state - to be implemented by specific games
    render() {
        // Game-specific render logic
    }

    // Score management
    setScore(points) {
        this.score = points;
        if (scoreManager.updateHighScore(this.constructor.name, this.score)) {
            this.highScore = this.score;
        }
        this.updateUI();
    }

    // UI Management
    createUI() {
        // Create score display
        this.uiElements.scoreDisplay = ui.createScoreDisplay(this.score, this.highScore);
        this.container.appendChild(this.uiElements.scoreDisplay);

        // Create control buttons
        this.uiElements.controls = document.createElement('div');
        this.uiElements.controls.className = 'game-controls';
        
        const startBtn = ui.createButton('Start', () => this.start(), 'start-button');
        const resetBtn = ui.createButton('Reset', () => this.reset(), 'reset-button');
        const pauseBtn = ui.createButton('Pause', () => this.pause(), 'pause-button');
        
        this.uiElements.controls.appendChild(startBtn);
        this.uiElements.controls.appendChild(pauseBtn);
        this.uiElements.controls.appendChild(resetBtn);
        
        this.container.appendChild(this.uiElements.controls);
    }

    updateUI() {
        // Update score display
        if (this.uiElements.scoreDisplay) {
            this.uiElements.scoreDisplay.innerHTML = `
                <div class="current-score">Score: ${scoreManager.formatScore(this.score)}</div>
                <div class="high-score">High Score: ${scoreManager.formatScore(this.highScore)}</div>
            `;
        }
    }

    showOverlay(text, options = {}) {
        if (this.uiElements.overlay) {
            this.hideOverlay();
        }
        this.uiElements.overlay = ui.createOverlay(text, options);
        this.container.appendChild(this.uiElements.overlay);
    }

    hideOverlay() {
        if (this.uiElements.overlay) {
            this.uiElements.overlay.remove();
            this.uiElements.overlay = null;
        }
    }

    gameOver() {
        this.state = 'gameOver';
        this.isRunning = false;
        this.showOverlay('Game Over', {
            message: `Final Score: ${this.score}`,
            buttons: [{
                text: 'Play Again',
                onClick: () => {
                    this.reset();
                    this.start();
                },
                className: 'play-again-button'
            }]
        });
    }

    // Basic event listener setup
    setupEventListeners() {
        // To be extended by specific games
    }

    // Cleanup resources
    destroy() {
        this.pause();
        this.canvas.remove();
        // Additional cleanup to be implemented by specific games
    }
}
