class Tetris {
    constructor(container) {
        this.container = container;
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.REFRESH_RATE = 1000; // Base speed in ms
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;

        // Tetromino definitions (rotation states included)
        this.TETROMINOES = {
            'I': {
                shapes: [
                    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
                    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]]
                ],
                color: 'piece-I'
            },
            'O': {
                shapes: [[[1,1], [1,1]]],
                color: 'piece-O'
            },
            'T': {
                shapes: [
                    [[0,1,0], [1,1,1], [0,0,0]],
                    [[0,1,0], [0,1,1], [0,1,0]],
                    [[0,0,0], [1,1,1], [0,1,0]],
                    [[0,1,0], [1,1,0], [0,1,0]]
                ],
                color: 'piece-T'
            },
            'S': {
                shapes: [
                    [[0,1,1], [1,1,0], [0,0,0]],
                    [[0,1,0], [0,1,1], [0,0,1]]
                ],
                color: 'piece-S'
            },
            'Z': {
                shapes: [
                    [[1,1,0], [0,1,1], [0,0,0]],
                    [[0,0,1], [0,1,1], [0,1,0]]
                ],
                color: 'piece-Z'
            },
            'J': {
                shapes: [
                    [[1,0,0], [1,1,1], [0,0,0]],
                    [[0,1,1], [0,1,0], [0,1,0]],
                    [[0,0,0], [1,1,1], [0,0,1]],
                    [[0,1,0], [0,1,0], [1,1,0]]
                ],
                color: 'piece-J'
            },
            'L': {
                shapes: [
                    [[0,0,1], [1,1,1], [0,0,0]],
                    [[0,1,0], [0,1,0], [0,1,1]],
                    [[0,0,0], [1,1,1], [1,0,0]],
                    [[1,1,0], [0,1,0], [0,1,0]]
                ],
                color: 'piece-L'
            }
        };

        this.init();
    }

    init() {
        this.createBoard();
        this.createUI();
        this.initGame();
        this.setupControls();
    }

    createBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() =>
            Array(this.BOARD_WIDTH).fill(null)
        );
    }

    createUI() {
        this.container.innerHTML = '';
        
        const gameContainer = document.createElement('div');
        gameContainer.className = 'tetris-container';

        // Create main board
        this.boardElement = document.createElement('div');
        this.boardElement.className = 'tetris-board';

        // Create info panel
        const infoPanel = document.createElement('div');
        infoPanel.className = 'tetris-info';

        // Preview box
        this.previewElement = document.createElement('div');
        this.previewElement.className = 'tetris-preview';

        // Score and level display
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.className = 'score-display';
        this.levelDisplay = document.createElement('div');
        this.levelDisplay.className = 'level-display';

        // Controls info
        const controlsInfo = document.createElement('div');
        controlsInfo.className = 'controls-info';
        controlsInfo.innerHTML = `
            <p>← → : Move</p>
            <p>↑ : Rotate</p>
            <p>↓ : Soft Drop</p>
            <p>Space : Hard Drop</p>
        `;

        infoPanel.append(
            this.previewElement,
            this.scoreDisplay,
            this.levelDisplay,
            controlsInfo
        );

        gameContainer.append(this.boardElement, infoPanel);
        this.container.appendChild(gameContainer);

        // Create all cells
        for (let i = 0; i < this.BOARD_HEIGHT; i++) {
            for (let j = 0; j < this.BOARD_WIDTH; j++) {
                const cell = document.createElement('div');
                cell.className = 'tetris-cell';
                this.boardElement.appendChild(cell);
            }
        }
    }

    initGame() {
        this.createBoard();
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.updateScore();
        this.updateLevel();
        this.currentPiece = this.createNewPiece();
        this.nextPiece = this.createNewPiece();
        this.drawBoard();
        this.startGameLoop();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.isPaused) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
            }
        });
    }

    createNewPiece() {
        const pieces = Object.keys(this.TETROMINOES);
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        return {
            type,
            shape: [...this.TETROMINOES[type].shapes[0]], // Clone the shape
            color: this.TETROMINOES[type].color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.TETROMINOES[type].shapes[0][0].length / 2),
            y: 0,
            rotation: 0
        };
    }

    startGameLoop() {
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.gameStep(), this.REFRESH_RATE / this.level);
    }

    gameStep() {
        if (this.gameOver || this.isPaused) return;
        
        if (!this.movePiece(0, 1)) {
            this.placePiece();
            this.clearLines();
            if (!this.spawnNewPiece()) {
                this.endGame();
            }
        }
        this.drawBoard();
    }

    movePiece(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidMove(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.drawBoard();
            return true;
        }
        return false;
    }

    rotatePiece() {
        const piece = this.TETROMINOES[this.currentPiece.type];
        const newRotation = (this.currentPiece.rotation + 1) % piece.shapes.length;
        const newShape = piece.shapes[newRotation];
        
        if (this.isValidMove(newShape, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = newShape;
            this.currentPiece.rotation = newRotation;
            this.drawBoard();
        }
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {}
        this.placePiece();
        this.clearLines();
        if (!this.spawnNewPiece()) {
            this.endGame();
        }
    }

    isValidMove(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX] !== null)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row;
                    const boardX = this.currentPiece.x + col;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createNewPiece();
        return this.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y);
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== null)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(null));
                linesCleared++;
                row++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
    }

    updateScore(linesCleared) {
        const points = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
        this.score += points[linesCleared] * this.level;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        
        // Level up every 10 lines
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.updateLevel();
            clearInterval(this.gameInterval);
            this.startGameLoop();
        }
    }

    updateLevel() {
        this.levelDisplay.textContent = `Level: ${this.level}`;
    }

    drawBoard() {
        // Clear board
        const cells = this.boardElement.children;
        for (let i = 0; i < this.BOARD_HEIGHT; i++) {
            for (let j = 0; j < this.BOARD_WIDTH; j++) {
                const cell = cells[i * this.BOARD_WIDTH + j];
                cell.className = 'tetris-cell';
                if (this.board[i][j]) {
                    cell.classList.add(this.board[i][j]);
                }
            }
        }
        
        // Draw current piece
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row;
                    const boardX = this.currentPiece.x + col;
                    if (boardY >= 0) {
                        const cell = cells[boardY * this.BOARD_WIDTH + boardX];
                        cell.classList.add(this.currentPiece.color);
                    }
                }
            }
        }
        
        // Draw preview
        this.previewElement.innerHTML = '';
        for (let row = 0; row < this.nextPiece.shape.length; row++) {
            for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
                const cell = document.createElement('div');
                cell.className = 'tetris-cell';
                if (this.nextPiece.shape[row][col]) {
                    cell.classList.add(this.nextPiece.color);
                }
                this.previewElement.appendChild(cell);
            }
        }
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.gameInterval);
        
        const overlay = document.createElement('div');
        overlay.className = 'game-over active';
        overlay.innerHTML = `
            <h2>Game Over</h2>
            <p>Score: ${this.score}</p>
            <button onclick="this.closest('.game-frame').tetris.initGame()">Play Again</button>
        `;
        this.boardElement.appendChild(overlay);
    }
}

// Initialize Tetris when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tetrisFrames = document.querySelectorAll('#tetris .game-frame');
    tetrisFrames.forEach(frame => {
        frame.tetris = new Tetris(frame);
    });
});
