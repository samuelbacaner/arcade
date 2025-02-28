# Retro Arcade

A browser-based arcade featuring classic games built with vanilla HTML, CSS, and JavaScript.

## Project Overview

Retro Arcade is a web-based platform that allows users to play classic arcade games in their browser. The project is built with a focus on clean, modern design and responsive layout.

### Features

- Modern flat design aesthetic
- Responsive layout for desktop devices
- Easy navigation between games
- Three classic games:
  - Minesweeper: Test your logic and memory
  - Tetris: Arrange falling blocks to create and clear lines
  - Snake: Guide the snake to eat food while avoiding collisions

## Project Structure

```
/
├── index.html          # Main landing page with game selection
├── minesweeper.html    # Minesweeper game page
├── tetris.html         # Tetris game page
├── snake.html          # Snake game page
├── styles/
│   ├── main.css        # Global styles and design system
│   └── games.css       # Game-specific styles
├── scripts/
│   ├── main.js         # Global functionality
│   └── games/          # Game-specific scripts folder
└── assets/             # Images, icons, and other media assets
    └── favicon.svg     # Site favicon
```

## Design System

The project uses a consistent design system with the following components:

- **Color Palette**:
  - Primary: #3498db (Blue)
  - Secondary: #2ecc71 (Green)
  - Accent: #e74c3c (Red)
  - Dark: #2c3e50 (Navy)
  - Light: #ecf0f1 (Off-white)

- **Typography**:
  - Headings: Poppins, sans-serif
  - Body: Open Sans, sans-serif

- **Components**:
  - Cards: For game selection
  - Buttons: For game controls
  - Navigation: For moving between pages
  - Game boards: For displaying games

## Implementation Details

The project is implemented using vanilla:
- HTML5 for structure
- CSS3 for styling (with CSS variables for theming)
- JavaScript (ES6+) for interactivity

No frameworks or libraries are used, making this a pure front-end implementation leveraging modern web standards.

## Game Pages

Each game has its own dedicated page with:
- Game board/canvas
- Controls
- Score/status displays
- Instructions
- Responsive layout

## Future Enhancements

Potential future enhancements include:
- User accounts and high scores
- Additional games
- Customizable themes
- Sound effects and music
- Mobile-optimized controls

## License

This project is open source and available under the MIT License.
