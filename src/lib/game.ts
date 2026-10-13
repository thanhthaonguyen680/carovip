// Core rules of caro (Vietnamese gomoku). Pure functions only — no React, no browser APIs —
// so the same module can later run on a server to validate online moves.

export const SIZE = 15;
export const CELLS = SIZE * SIZE;

export type Stone = "X" | "O";
export type Cell = Stone | null;
export type Board = Cell[];

// X always moves first, so whose turn it is follows from how many moves were played.
export function stoneForMove(moveNumber: number): Stone {
  return moveNumber % 2 === 0 ? "X" : "O";
}

export function other(stone: Stone): Stone {
  return stone === "X" ? "O" : "X";
}

export function emptyBoard(): Board {
  return new Array<Cell>(CELLS).fill(null);
}

export function boardFromMoves(moves: number[]): Board {
  const board = emptyBoard();
  moves.forEach((index, n) => {
    board[index] = stoneForMove(n);
  });
  return board;
}

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function inside(row: number, col: number) {
  return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
}

// Returns the winning line through the stone at `index`, or null. Vietnamese rule: five or
// more in a row wins UNLESS both ends are capped by the opponent's stones ("chặn hai đầu").
// The edge of the board does not count as a cap.
export function findWin(board: Board, index: number): number[] | null {
  const stone = board[index];
  if (!stone) return null;
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const rival = other(stone);

  for (const [dr, dc] of DIRECTIONS) {
    const line = [index];

    let r = row + dr;
    let c = col + dc;
    while (inside(r, c) && board[r * SIZE + c] === stone) {
      line.push(r * SIZE + c);
      r += dr;
      c += dc;
    }
    const cappedAhead = inside(r, c) && board[r * SIZE + c] === rival;

    r = row - dr;
    c = col - dc;
    while (inside(r, c) && board[r * SIZE + c] === stone) {
      line.unshift(r * SIZE + c);
      r -= dr;
      c -= dc;
    }
    const cappedBehind = inside(r, c) && board[r * SIZE + c] === rival;

    if (line.length >= 5 && !(cappedAhead && cappedBehind)) return line;
  }
  return null;
}

export function isFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}
