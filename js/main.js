// Main application entry point
import GameBase from './shared/gameBase.js';
import * as utils from './shared/utils.js';
import Minesweeper from './games/minesweeper.js';
import Tetris from './games/tetris.js';
import Snake from './games/snake.js';

// Game configuration
const GAMES_CONFIG = {
    minesweeper: {
        title: 'Minesweeper',
        description: 'Classic puzzle game - clear the minefield without hitting any bombs!',
        thumbnail: 'assets/minesweeper-preview.png',
        GameClass: Minesweeper
    },
    tetris: {
        title: 'Tetris',
        description: 'The iconic block-stacking puzzle game',
        thumbnail: 'assets/tetris-preview.png',
        GameClass: Tetris
    },
    snake: {
        title: 'Snake',
        description: 'Guide the snake to eat food and grow while avoiding collisions',
        thumbnail: 'assets/snake-preview.png',
        GameClass: Snake
    }
};

let currentGame = null;
let gameContainer, gameSelection, activeGame, gameNav, currentGameTitle;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    createGameCards();
    setupEventListeners();
});

function initializeDOMElements() {
    gameContainer = document.getElementById('gameContainer');
    gameSelection = document.getElementById('gameSelection');
    activeGame = document.getElementById('activeGame');
    gameNav = document.getElementById('gameNav');
    currentGameTitle = document.getElementById('currentGameTitle');
}

function createGameCards() {
    Object.entries(GAMES_CONFIG).forEach(([gameId, config]) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-preview">
                <img src=".${config.thumbnail}" alt="${config.title}" />
            </div>
            <div class="game-info">
                <h3 class="game-title">${config.title}</h3>
                <p>${config.description}</p>
                <div class="high-score">High Score: ${utils.scoreManager.getHighScore(gameId)}</div>
            </div>
            <div class="game-actions">
                <button class="play-button" data-game="${gameId}">Play Now</button>
            </div>
        `;
        gameSelection.appendChild(card);
    });
}

function setupEventListeners() {
    // Game selection handlers
    gameSelection.addEventListener('click', (e) => {
        const playButton = e.target.closest('.play-button');
        if (playButton) {
            const gameId = playButton.dataset.game;
            startGame(gameId);
        }
    });

    // Navigation handlers
    document.getElementById('backToMenu').addEventListener('click', showGameSelection);
    document.getElementById('restartGame').addEventListener('click', () => {
        if (currentGame) {
            currentGame.reset();
        }
    });
}

function startGame(gameId) {
    const config = GAMES_CONFIG[gameId];
    if (!config) return;

    // Clean up previous game if exists
    if (currentGame) {
        currentGame.pause();
        activeGame.innerHTML = '';
    }

    // Update UI
    gameSelection.classList.add('hidden');
    activeGame.classList.remove('hidden');
    gameNav.classList.remove('hidden');
    currentGameTitle.textContent = config.title;

    // Initialize new game
    currentGame = new config.GameClass('activeGame');
    currentGame.init();
    currentGame.start();
}

function showGameSelection() {
    if (currentGame) {
        currentGame.pause();
    }
    
    activeGame.classList.add('hidden');
    gameNav.classList.add('hidden');
    gameSelection.classList.remove('hidden');
}

// Export game management functions for use in other modules
export const gameManager = {
    getCurrentGame: () => currentGame,
    startGame,
    pauseGame: () => currentGame?.pause(),
    resumeGame: () => currentGame?.resume(),
    showGameSelection
};
