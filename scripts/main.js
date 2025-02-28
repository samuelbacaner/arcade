/**
 * Retro Arcade - Main JavaScript
 * Contains global site functionality and utilities
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Retro Arcade initialized');
    
    // Initialize navigation highlighting
    highlightCurrentPage();
    
    // Use actual game thumbnail images
    setupGameThumbnails();
    
    // Handle page visibility changes (pause games when switching tabs)
    setupVisibilityChangeHandler();
    
    // Setup help buttons
    setupHelpButtons();
});

/**
 * Highlights the current active page in navigation
 */
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        // Remove active class from all links
        link.classList.remove('active');
        
        // Get the href attribute
        const href = link.getAttribute('href');
        
        // Set active class on current page link
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') || 
            (currentPage === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/**
 * Sets up the game thumbnails on the index page
 */
function setupGameThumbnails() {
    const gameImages = document.querySelectorAll('.game-image');
    
    gameImages.forEach(image => {
        if (!image) return;
        
        // Clear any existing content
        image.innerHTML = '';
        
        // Create an image element for the thumbnail
        const img = document.createElement('img');
        img.classList.add('game-thumbnail');
        
        // Set the appropriate source based on the ID
        if (image.id === 'minesweeper-img') {
            img.src = 'assets/minesweeper-thumbnail.svg';
            img.alt = 'Minesweeper Game';
        } else if (image.id === 'tetris-img') {
            img.src = 'assets/tetris-thumbnail.svg';
            img.alt = 'Tetris Game';
        } else if (image.id === 'snake-img') {
            img.src = 'assets/snake-thumbnail.svg';
            img.alt = 'Snake Game';
        }
        
        // Append image to the container
        image.appendChild(img);
    });
}

/**
 * Draws a simple Minesweeper icon
 */
function drawMinesweeperIcon(ctx, width, height) {
    // Background
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    const gridSize = 5;
    const cellSize = Math.min(width, height) / (gridSize + 2);
    const offsetX = (width - (cellSize * gridSize)) / 2;
    const offsetY = (height - (cellSize * gridSize)) / 2;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    // Draw cells
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const x = offsetX + (i * cellSize);
            const y = offsetY + (j * cellSize);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeRect(x, y, cellSize, cellSize);
            
            // Add random numbers or mine
            if (Math.random() > 0.7) {
                ctx.fillStyle = '#2c3e50';
                ctx.font = `${cellSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                if (Math.random() > 0.8) {
                    // Draw mine
                    ctx.beginPath();
                    ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/4, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Draw number
                    const num = Math.floor(Math.random() * 8) + 1;
                    ctx.fillText(num.toString(), x + cellSize/2, y + cellSize/2);
                }
            }
        }
    }
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Minesweeper', width/2, height - 20);
}

/**
 * Draws a simple Tetris icon
 */
function drawTetrisIcon(ctx, width, height) {
    // Background
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, 0, width, height);
    
    const blockSize = Math.min(width, height) / 12;
    const offsetX = (width - (blockSize * 10)) / 2;
    const offsetY = (height - (blockSize * 10)) / 2;
    
    // Tetromino shapes and colors
    const shapes = [
        { blocks: [[0,0], [1,0], [2,0], [3,0]], color: '#e74c3c' }, // I
        { blocks: [[0,0], [1,0], [0,1], [1,1]], color: '#f1c40f' }, // O
        { blocks: [[0,0], [1,0], [2,0], [1,1]], color: '#9b59b6' }, // T
        { blocks: [[0,0], [0,1], [1,1], [2,1]], color: '#3498db' }, // J
        { blocks: [[2,0], [0,1], [1,1], [2,1]], color: '#e67e22' }  // L
    ];
    
    // Draw some random tetrominos
    for (let i = 0; i < 3; i++) {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const startX = offsetX + (Math.floor(Math.random() * 7) * blockSize);
        const startY = offsetY + (Math.floor(Math.random() * 7) * blockSize);
        
        shape.blocks.forEach(block => {
            const x = startX + (block[0] * blockSize);
            const y = startY + (block[1] * blockSize);
            
            ctx.fillStyle = shape.color;
            ctx.fillRect(x, y, blockSize, blockSize);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, blockSize, blockSize);
        });
    }
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tetris', width/2, height - 20);
}

/**
 * Draws a simple Snake icon
 */
function drawSnakeIcon(ctx, width, height) {
    // Background
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(0, 0, width, height);
    
    const gridSize = 15;
    const cellSize = Math.min(width, height) / (gridSize + 2);
    const offsetX = (width - (cellSize * gridSize)) / 2;
    const offsetY = (height - (cellSize * gridSize)) / 2;
    
    // Draw snake
    const snake = [
        [7, 7], [6, 7], [5, 7], [4, 7], [3, 7], 
        [3, 8], [3, 9], [4, 9], [5, 9], [6, 9], 
        [7, 9], [8, 9], [9, 9], [9, 8]
    ];
    
    // Snake body
    ctx.fillStyle = '#2ecc71';
    snake.forEach(segment => {
        const x = offsetX + (segment[0] * cellSize);
        const y = offsetY + (segment[1] * cellSize);
        
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // Segment border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
    });
    
    // Snake head
    const headX = offsetX + (snake[0][0] * cellSize);
    const headY = offsetY + (snake[0][1] * cellSize);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(headX, headY, cellSize, cellSize);
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(headX + cellSize * 0.3, headY + cellSize * 0.3, cellSize * 0.15, 0, Math.PI * 2);
    ctx.arc(headX + cellSize * 0.7, headY + cellSize * 0.3, cellSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Food
    ctx.fillStyle = '#e67e22';
    const foodX = offsetX + (11 * cellSize);
    const foodY = offsetY + (7 * cellSize);
    ctx.beginPath();
    ctx.arc(foodX + cellSize/2, foodY + cellSize/2, cellSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Snake', width/2, height - 20);
}

/**
 * Creates a modal popup
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {function} callback - Function to call when modal is closed
 */
function showModal(title, message, callback) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'game-message active';
    
    // Create modal content
    modal.innerHTML = `
        <h3 class="message-title">${title}</h3>
        <p class="message-text">${message}</p>
        <button class="message-btn">OK</button>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listener to close button
    const button = modal.querySelector('.message-btn');
    button.addEventListener('click', () => {
        modal.remove();
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

/**
 * Utility function to format time (seconds to MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Sets up the visibility change handler to pause games when switching tabs
 */
function setupVisibilityChangeHandler() {
    // This will trigger when the user changes tabs or minimizes the window
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden (user switched tabs or minimized window)
            console.log('Page hidden - pausing games');
            pauseActiveGame();
        } else {
            // Page is visible again - games remain paused until user explicitly resumes
            console.log('Page visible again');
            // We don't auto-resume, as that could be disruptive
        }
    });
}

/**
 * Pauses the active game if one is running
 */
function pauseActiveGame() {
    // Check which game page we're on and pause that game
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'minesweeper.html') {
        // Pause minesweeper if it's running
        if (window.minesweeperGame && !window.minesweeperGame.isGameOver) {
            if (window.minesweeperGame.timerInterval) {
                clearInterval(window.minesweeperGame.timerInterval);
                window.minesweeperGame.timerInterval = null;
            }
        }
    } else if (currentPage === 'tetris.html') {
        // Pause tetris if it's running
        if (window.tetrisGame && !window.tetrisGame.isGameOver && !window.tetrisGame.isPaused) {
            window.tetrisGame.pauseGame();
        }
    } else if (currentPage === 'snake.html') {
        // Pause snake if it's running
        if (window.snakeGame && !window.snakeGame.isGameOver && !window.snakeGame.isPaused) {
            window.snakeGame.pauseGame();
        }
    }
}

/**
 * Sets up help buttons functionality
 */
function setupHelpButtons() {
    const helpButtons = document.querySelectorAll('#help-btn');
    
    helpButtons.forEach(button => {
        if (!button) return;
        
        button.addEventListener('click', () => {
            // Find the instructions section on the current page
            const instructions = document.querySelector('.game-instructions');
            if (instructions) {
                // Scroll to the instructions with smooth animation
                instructions.scrollIntoView({ behavior: 'smooth' });
                
                // Highlight the instructions briefly
                instructions.classList.add('highlight');
                setTimeout(() => {
                    instructions.classList.remove('highlight');
                }, 1500);
            }
        });
    });
}

/**
 * Adds transition effects when navigating between pages
 * @param {string} targetUrl - The URL to navigate to
 */
function navigateWithTransition(targetUrl) {
    // Add a fade-out class to the main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('fade-out');
        
        // Pause any active game before navigation
        pauseActiveGame();
        
        // After a short delay, navigate to the new page
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 300); // Match this with the CSS transition duration
        
        return false; // Prevent default link behavior
    }
    
    // If we couldn't find the main content, just navigate normally
    window.location.href = targetUrl;
    return false;
}

/**
 * Shows a modal dialog with game instructions
 * @param {string} gameType - The type of game ('minesweeper', 'tetris', or 'snake')
 */
function showGameInstructions(gameType) {
    // Find or create the modal container
    let modal = document.getElementById('instructions-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'instructions-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Set the appropriate content based on game type
    let content = '';
    
    if (gameType === 'minesweeper') {
        content = `
            <h3>How to Play Minesweeper</h3>
            <ul>
                <li><strong>Goal:</strong> Uncover all cells that don't contain mines.</li>
                <li><strong>Left Click:</strong> Reveal a cell.</li>
                <li><strong>Right Click:</strong> Flag a cell as a potential mine.</li>
                <li>Numbers indicate how many mines are adjacent to that cell.</li>
                <li>The timer starts on your first click.</li>
                <li>You win by revealing all non-mine cells.</li>
                <li>You lose if you click on a cell containing a mine.</li>
            </ul>
            <p><strong>Tip:</strong> The first cell you click will never be a mine.</p>
        `;
    } else if (gameType === 'tetris') {
        content = `
            <h3>How to Play Tetris</h3>
            <ul>
                <li><strong>Goal:</strong> Arrange falling blocks to create and clear complete horizontal lines.</li>
                <li><strong>Controls:</strong>
                    <ul>
                        <li>Left/Right Arrows: Move piece horizontally</li>
                        <li>Down Arrow: Soft drop (move piece down faster)</li>
                        <li>Up Arrow: Rotate piece</li>
                        <li>Spacebar: Hard drop (instantly place the piece)</li>
                    </ul>
                </li>
                <li>Clearing multiple lines at once awards more points.</li>
                <li>The game gets faster as you level up.</li>
                <li>Game ends when new pieces can't be placed.</li>
            </ul>
            <p><strong>Tip:</strong> Plan ahead using the next piece preview!</p>
        `;
    } else if (gameType === 'snake') {
        content = `
            <h3>How to Play Snake</h3>
            <ul>
                <li><strong>Goal:</strong> Eat as much food as possible without collisions.</li>
                <li><strong>Controls:</strong> Use arrow keys to change the snake's direction.</li>
                <li>The snake grows longer each time it eats food.</li>
                <li>The snake moves faster as your score increases.</li>
                <li>Game ends when the snake hits a wall or itself.</li>
            </ul>
            <p><strong>Tip:</strong> Plan your path carefully and avoid getting trapped!</p>
        `;
    }
    
    // Set the modal content
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="game-btn">Close</button>
            </div>
        </div>
    `;
    
    // Show the modal
    modal.style.display = 'flex';
    
    // Add event listeners to close the modal
    const closeButton = modal.querySelector('.close-modal');
    const footerButton = modal.querySelector('.modal-footer button');
    const closeModal = () => {
        modal.style.display = 'none';
    };
    
    closeButton.addEventListener('click', closeModal);
    footerButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}
