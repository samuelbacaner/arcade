/**
 * Common utility functions for arcade games
 */

// Collision detection utilities
export const collision = {
    // Check if two rectangles overlap
    rectIntersect: (rect1, rect2) => {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // Check if a point is inside a rectangle
    pointInRect: (point, rect) => {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }
};

// Keyboard input management
export const keyboard = {
    pressed: new Set(),
    
    init() {
        window.addEventListener('keydown', (e) => this.pressed.add(e.key));
        window.addEventListener('keyup', (e) => this.pressed.delete(e.key));
    },
    
    isPressed(key) {
        return this.pressed.has(key);
    },
    
    reset() {
        this.pressed.clear();
    }
};

// Canvas helper functions
export const canvas = {
    // Clear the entire canvas
    clear: (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    
    // Draw text with optional configuration
    drawText: (ctx, text, x, y, config = {}) => {
        const { 
            font = '20px sans-serif',
            color = 'black',
            align = 'center',
            baseline = 'middle'
        } = config;
        
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
};

// Random number utilities
export const random = {
    // Get random integer between min and max (inclusive)
    int: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Get random element from array
    fromArray: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    }
};

// Score management
export const scoreManager = {
    formatScore: (score) => {
        return score.toString().padStart(6, '0');
    },

    getHighScore: (gameId) => {
        return parseInt(localStorage.getItem(`${gameId}_highScore`)) || 0;
    },

    setHighScore: (gameId, score) => {
        localStorage.setItem(`${gameId}_highScore`, score.toString());
    },

    updateHighScore: (gameId, currentScore) => {
        const highScore = scoreManager.getHighScore(gameId);
        if (currentScore > highScore) {
            scoreManager.setHighScore(gameId, currentScore);
            return true;
        }
        return false;
    }
};

// UI Components
export const ui = {
    createButton: (text, onClick, className = '') => {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `game-button ${className}`;
        button.addEventListener('click', onClick);
        return button;
    },

    createScoreDisplay: (score, highScore) => {
        const container = document.createElement('div');
        container.className = 'score-display';
        container.innerHTML = `
            <div class="current-score">Score: ${scoreManager.formatScore(score)}</div>
            <div class="high-score">High Score: ${scoreManager.formatScore(highScore)}</div>
        `;
        return container;
    },

    createOverlay: (text, options = {}) => {
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <h2>${text}</h2>
                ${options.message ? `<p>${options.message}</p>` : ''}
            </div>
        `;
        
        if (options.buttons) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'overlay-buttons';
            options.buttons.forEach(btn => {
                buttonContainer.appendChild(ui.createButton(btn.text, btn.onClick, btn.className));
            });
            overlay.querySelector('.overlay-content').appendChild(buttonContainer);
        }
        
        return overlay;
    }
};
// Request Animation Frame with timing control
export const createGameLoop = (callback, fps = 60) => {
    const frameInterval = 1000 / fps;
    let lastTime = 0;
    
    const loop = (timestamp) => {
        const deltaTime = timestamp - lastTime;
        
        if (deltaTime >= frameInterval) {
            lastTime = timestamp - (deltaTime % frameInterval);
            callback(deltaTime);
        }
        
        requestAnimationFrame(loop);
    };
    
    return loop;
};
