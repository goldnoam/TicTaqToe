
import React from 'react';
import { SquareValue, Player } from '../types';
import { XIcon, OIcon } from '../constants';

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare, disabled }) => {
  const winningClass = isWinningSquare 
    ? (value === 'X' ? 'animate-win-x z-10 bg-slate-700/90' : 'animate-win-o z-10 bg-slate-700/90') 
    : 'bg-slate-800/40 border-slate-700/50';

  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        relative h-24 w-24 sm:h-32 sm:w-32 flex items-center justify-center text-4xl sm:text-6xl font-bold rounded-2xl transition-all duration-300 border
        ${!value && !disabled ? 'hover:bg-slate-700/50 cursor-pointer shadow-lg' : 'cursor-default'}
        ${winningClass}
      `}
    >
      {value === 'X' && (
        <XIcon className="w-12 h-12 sm:w-16 sm:h-16 neon-x animate-fade-in" />
      )}
      {value === 'O' && (
        <OIcon className="w-12 h-12 sm:w-16 sm:h-16 neon-o animate-fade-in" />
      )}
    </button>
  );
};

export default Square;
