const assert = require('assert');

// Mock DOM elements
class MockElement {
    constructor() {
        this.innerHTML = '';
        this.className = '';
        this.children = [];
        this.dataset = {};
        this.style = new Map();
        this.eventListeners = {};
    }

    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    appendChild(child) {
        this.children.push(child);
    }

    querySelector() {
        return new MockElement();
    }
}

global.document = {
    createElement: () => new MockElement(),
    addEventListener: () => {},
    querySelector: () => new MockElement()
};

// Import Minesweeper class code
const fs = require('fs');
const path = require('path');
const minesweeperCode = fs.readFileSync(path.join(__dirname, '../js/minesweeper.js'), 'utf8');
eval(minesweeperCode);

// Test suite
describe('Minesweeper', () => {
    let game;
    
    beforeEach(() => {
        game = new Minesweeper(new MockElement(), 'beginner');
    });

    it('should initialize with correct beginner settings', () => {
        assert.strictEqual(game.rows, 9);
        assert.strictEqual(game.cols, 9);
        assert.strictEqual(game.totalMines, 10);
    });

    it('should initialize board correctly', () => {
        assert.strictEqual(game.board.length, 9);
        assert.strictEqual(game.board[0].length, 9);
        
        // Check cell properties
        const cell = game.board[0][0];
        assert('isMine' in cell);
        assert('isRevealed' in cell);
        assert('isFlagged' in cell);
        assert('adjacentMines' in cell);
    });

    it('should place correct number of mines', () => {
        game.placeMines(0, 0);
        let mineCount = 0;
        
        for (let i = 0; i < game.rows; i++) {
            for (let j = 0; j < game.cols; j++) {
                if (game.board[i][j].isMine) mineCount++;
            }
        }
        
        assert.strictEqual(mineCount, 10);
        assert.strictEqual(game.board[0][0].isMine, false); // First click should never be a mine
    });

    it('should correctly count adjacent mines', () => {
        // Create a known board configuration
        game.board[0][1].isMine = true;
        game.board[1][1].isMine = true;
        
        assert.strictEqual(game.countAdjacentMines(0, 0), 2);
        assert.strictEqual(game.countAdjacentMines(1, 0), 2);
        assert.strictEqual(game.countAdjacentMines(2, 2), 0);
    });

    it('should handle win condition correctly', () => {
        // Reveal all non-mine cells
        for (let i = 0; i < game.rows; i++) {
            for (let j = 0; j < game.cols; j++) {
                if (!game.board[i][j].isMine) {
                    game.board[i][j].isRevealed = true;
                }
            }
        }
        
        assert.strictEqual(game.checkWin(), true);
    });
});

// Run tests
console.log('Running Minesweeper tests...');
try {
    describe.run();
    console.log('All tests passed!');
} catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
}
