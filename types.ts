
export type Player = 'X' | 'O';
export type SquareValue = Player | null;

export enum GameMode {
  SINGLE = 'SINGLE',
  MULTI = 'MULTI'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface GameState {
  board: SquareValue[];
  xIsNext: boolean;
  winner: Player | 'Draw' | null;
  winningLine: number[] | null;
  mode: GameMode;
  difficulty: Difficulty;
  scores: { X: number; O: number; Draw: number };
}
