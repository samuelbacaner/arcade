# Arcade Games Collection

A collection of classic arcade games including Minesweeper, Tetris, and Snake.

## Getting Started

Due to browser security restrictions with ES6 modules, you need to run the games through a local web server.

### Quick Start

1. Start the server:
   ```bash
   # On macOS/Linux:
   chmod +x start-server.sh
   ./start-server.sh

   # Alternatively, you can run directly:
   python3 -m http.server 8000
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

3. Enjoy the games!

## Games Available

- Minesweeper: Classic puzzle game - clear the minefield without hitting any bombs!
- Tetris: The iconic block-stacking puzzle game
- Snake: Guide the snake to eat food and grow while avoiding collisions

## Troubleshooting

If you see only the title "Arcade Games Collection" without any games listed, make sure you're accessing the site through the web server (http://localhost:8000) and not directly opening the HTML file in your browser.
