# Minesweeper Game - Retro Arcade

This is a fully functional implementation of the classic Minesweeper game for the Retro Arcade website.

## Features

- Three difficulty levels:
  - Easy: 8x8 grid with 10 mines
  - Medium: 16x16 grid with 40 mines
  - Hard: 30x16 grid with 99 mines
- Left-click to reveal cells
- Right-click to flag potential mines
- Timer to track game duration
- Counter for remaining unflagged mines
- First click never reveals a mine
- Cascading reveal for empty cells
- Visual indicators for adjacent mine counts
- Win/lose detection with congratulatory messages

## How to Play

1. Start the server by running `./start-server.sh` in the terminal
2. Open your browser and navigate to http://localhost:8000/minesweeper.html
3. Select a difficulty level from the dropdown menu
4. Click on a cell to start the game
5. Use left-click to reveal cells and right-click to flag potential mines
6. The numbers indicate how many mines are adjacent to a cell
7. The game is won when all non-mine cells are revealed
8. The game is lost if you click on a mine

## Technical Implementation

The Minesweeper game is implemented using:
- Vanilla JavaScript with an object-oriented approach
- CSS Grid for the game board layout
- Responsive design that works on different screen sizes

## Verification Results

The implementation successfully meets all the required criteria:

1. ✅ Players can select from three different difficulty levels
2. ✅ The game correctly initializes with the proper grid size and mine count for each difficulty
3. ✅ Left-click reveals cells and right-click flags cells
4. ✅ The first click never reveals a mine
5. ✅ Numbers correctly indicate adjacent mines
6. ✅ Cascading reveal functionality works for empty cells
7. ✅ Timer starts on first click and stops when the game ends
8. ✅ Win condition works when all non-mine cells are revealed
9. ✅ Lose condition triggers when clicking on a mine
10. ✅ The game can be reset and restarted properly

The game is now ready for use in the Retro Arcade website.
