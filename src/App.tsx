// App.tsx
import { useState, useEffect, FC } from 'react';
import './App.css';

const ROWS = 20;
const COLS = 10;
const EMPTY_BOARD: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const SHAPES = [
  // I shape
  [
    [1, 1, 1, 1]
  ],
  // O shape
  [
    [1, 1],
    [1, 1]
  ],
  // T shape
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  // S shape
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  // Z shape
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  // J shape
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  // L shape
  [
    [0, 0, 1],
    [1, 1, 1]
  ],
];

const getRandomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];

const App: FC = () => {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [currentShape, setCurrentShape] = useState<number[][]>(getRandomShape());
  const [position, setPosition] = useState({ x: 4, y: 0 }); // Start position at top middle
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameOver) return;
      switch (event.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowUp':
          rotateShape();
          break;
        case 'ArrowDown':
          moveDown();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [position, currentShape, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const timeout = setTimeout(() => {
      moveDown();
    }, 300);

    return () => clearTimeout(timeout);
  }, [position, currentShape, gameOver]);

  const isValidMove = (shape: number[][], pos: { x: number, y: number }): boolean => {
    return shape.every((row, dy) => {
      return row.every((cell, dx) => {
        const x = pos.x + dx;
        const y = pos.y + dy;
        return (
          cell === 0 ||
          (y >= 0 && y < ROWS && x >= 0 && x < COLS && board[y][x] === 0)
        );
      });
    });
  };

  const mergeShapeToBoard = () => {
    const newBoard = board.map(row => row.slice());
    currentShape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          newBoard[position.y + y][position.x + x] = cell;
        }
      });
    });
    setBoard(newBoard);
    clearLines(newBoard);
  };

  const clearLines = (board: number[][]) => {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const clearedLines = ROWS - newBoard.length;
    const emptyRows = Array.from({ length: clearedLines }, () => Array(COLS).fill(0));
    setBoard([...emptyRows, ...newBoard]);
  };

  const resetShape = () => {
    const newShape = getRandomShape();
    const newPos = { x: 4, y: 0 }; // Start position at top middle
    if (!isValidMove(newShape, newPos)) {
      setGameOver(true);
    } else {
      setCurrentShape(newShape);
      setPosition(newPos);
    }
  };

  const moveDown = () => {
    const newPosition = { x: position.x, y: position.y + 1 };
    if (isValidMove(currentShape, newPosition)) {
      setPosition(newPosition);
    } else {
      mergeShapeToBoard();
      resetShape();
    }
  };

  const moveLeft = () => {
    const newPosition = { x: position.x - 1, y: position.y };
    if (isValidMove(currentShape, newPosition)) {
      setPosition(newPosition);
    }
  };

  const moveRight = () => {
    const newPosition = { x: position.x + 1, y: position.y };
    if (isValidMove(currentShape, newPosition)) {
      setPosition(newPosition);
    }
  };

  const rotateShape = () => {
    const rotatedShape = currentShape[0].map((_, index) =>
      currentShape.map(row => row[index])
    ).reverse();
    if (isValidMove(rotatedShape, position)) {
      setCurrentShape(rotatedShape);
    }
  };

  const renderBoard = () => {
    const tempBoard = board.map(row => row.slice());
    currentShape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          tempBoard[position.y + y][position.x + x] = cell;
        }
      });
    });

    return tempBoard.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, colIndex) => (
          <div key={colIndex} className={`cell ${cell ? 'filled' : ''}`}></div>
        ))}
      </div>
    ));
  };

  return (
    <div className="App">
      {gameOver ? (
        <div className="game-over">Game Over</div>
      ) : (
        <div className="board">{renderBoard()}</div>
      )}
    </div>
  );
};

export default App;
