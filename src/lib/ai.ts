// Computer opponent. Everything is built on "windows": every run of five cells in a row on
// the board. A window holding only my stones is a line I can still complete; one holding only
// the rival's stones is a line I may need to break.

import { CELLS, SIZE, findWin, other, type Board, type Stone } from "@/lib/game";

export type Level = "easy" | "medium" | "hard";

const WINDOWS: number[][] = [];
const WINDOWS_AT: number[][] = Array.from({ length: CELLS }, () => []);

for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]) {
      const endRow = row + dr * 4;
      const endCol = col + dc * 4;
      if (endRow < 0 || endRow >= SIZE || endCol < 0 || endCol >= SIZE) continue;
      const cells = [0, 1, 2, 3, 4].map((k) => (row + dr * k) * SIZE + (col + dc * k));
      const id = WINDOWS.length;
      WINDOWS.push(cells);
      cells.forEach((cell) => WINDOWS_AT[cell].push(id));
    }
  }
}

// Value of putting one more stone into a window that already holds N of the same colour.
const GAIN = [1, 12, 150, 2500, 1_000_000];
// Value of a window as it stands, by how many stones of one colour it holds.
const HELD = [0, 1, 10, 100, 1200, 100_000];

function count(board: Board, cells: number[], stone: Stone) {
  let mine = 0;
  let theirs = 0;
  for (const cell of cells) {
    const value = board[cell];
    if (value === stone) mine++;
    else if (value !== null) theirs++;
  }
  return { mine, theirs };
}

// How good is this empty cell for `stone`: what it builds, plus what it denies the rival.
function cellScore(board: Board, index: number, stone: Stone, defence: number) {
  let attack = 0;
  let block = 0;
  for (const id of WINDOWS_AT[index]) {
    const { mine, theirs } = count(board, WINDOWS[id], stone);
    if (theirs === 0) attack += GAIN[mine];
    if (mine === 0) block += GAIN[theirs];
  }
  return attack + block * defence;
}

function evaluate(board: Board, stone: Stone) {
  let total = 0;
  for (const cells of WINDOWS) {
    const { mine, theirs } = count(board, cells, stone);
    if (theirs === 0) total += HELD[mine];
    else if (mine === 0) total -= HELD[theirs] * 1.2;
  }
  return total;
}

// Only cells near existing stones are worth considering.
function candidates(board: Board): number[] {
  const near = new Set<number>();
  for (let index = 0; index < CELLS; index++) {
    if (board[index] === null) continue;
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) continue;
        const cell = r * SIZE + c;
        if (board[cell] === null) near.add(cell);
      }
    }
  }
  return [...near];
}

function ranked(board: Board, stone: Stone, defence: number, keep: number) {
  return candidates(board)
    .map((index) => ({ index, score: cellScore(board, index, stone, defence) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, keep);
}

const WIN = 100_000_000;

function negamax(
  board: Board,
  toMove: Stone,
  depth: number,
  alpha: number,
  beta: number,
  lastIndex: number,
): number {
  // The player who just moved completed a line: that is a loss for the side to move.
  // Adding depth prefers quicker wins and slower losses.
  if (findWin(board, lastIndex)) return -(WIN + depth);
  if (depth === 0) return evaluate(board, toMove);

  const moves = ranked(board, toMove, 0.9, 7);
  if (moves.length === 0) return 0;

  let best = -Infinity;
  for (const { index } of moves) {
    board[index] = toMove;
    const score = -negamax(board, other(toMove), depth - 1, -beta, -alpha, index);
    board[index] = null;
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function winningCell(board: Board, stone: Stone, cells: number[]): number | null {
  for (const index of cells) {
    board[index] = stone;
    const wins = findWin(board, index) !== null;
    board[index] = null;
    if (wins) return index;
  }
  return null;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function chooseMove(source: Board, stone: Stone, level: Level): number {
  const board = [...source];
  const open = candidates(board);

  if (open.length === 0) {
    // Empty board: open in the middle (easy wanders a little).
    const centre = Math.floor(SIZE / 2);
    const drift = level === "easy" ? pick([-1, 0, 1]) : 0;
    return (centre + drift) * SIZE + centre + (level === "easy" ? pick([-1, 0, 1]) : 0);
  }

  // Every level takes a win that is on the board.
  const win = winningCell(board, stone, open);
  if (win !== null) return win;

  if (level === "easy") {
    // Plays reasonable shapes but is careless about defence, and not always the best cell.
    return pick(ranked(board, stone, 0.5, 4)).index;
  }

  // Medium and hard never miss a one-move block.
  const block = winningCell(board, other(stone), open);
  if (block !== null) return block;

  if (level === "medium") {
    const moves = ranked(board, stone, 0.9, 6);
    const top = moves.filter((move) => move.score >= moves[0].score * 0.97);
    return pick(top).index;
  }

  // Hard: look four moves ahead over the most promising cells.
  let bestIndex = open[0];
  let bestScore = -Infinity;
  for (const { index } of ranked(board, stone, 0.9, 9)) {
    board[index] = stone;
    const score = -negamax(board, other(stone), 3, -Infinity, -bestScore, index);
    board[index] = null;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  return bestIndex;
}
