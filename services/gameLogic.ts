
import { WINNING_COMBINATIONS } from '../constants';
import { SquareValue, Player, Difficulty } from '../types';

export const calculateWinner = (squares: SquareValue[]) => {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  if (!squares.includes(null)) {
    return { winner: 'Draw' as const, line: null };
  }
  return null;
};

const minimax = (board: SquareValue[], depth: number, isMaximizing: boolean): number => {
  const result = calculateWinner(board);
  if (result?.winner === 'O') return 10 - depth;
  if (result?.winner === 'X') return depth - 10;
  if (result?.winner === 'Draw') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

export const getBestMove = (board: SquareValue[], difficulty: Difficulty): number => {
  const availableMoves = board.map((v, i) => v === null ? i : null).filter((v): v is number => v !== null);

  if (difficulty === Difficulty.EASY) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (difficulty === Difficulty.MEDIUM) {
    // 50% chance of making the best move, 50% random
    if (Math.random() > 0.5) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  // Hard/Impossible - Minimax
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};
