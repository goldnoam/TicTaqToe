
import React from 'react';
import { GameMode, Difficulty } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  playerNames: { X: string; O: string };
  setPlayerNames: (names: { X: string; O: string }) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  mode,
  setMode,
  difficulty,
  setDifficulty,
  playerNames,
  setPlayerNames
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative glass w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-white/10 animate-[scaleIn_0.3s_ease-out] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-400"></div>
        
        <h2 className="text-3xl font-black mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-400">
          SYSTEM CONFIG
        </h2>

        <div className="space-y-6">
          {/* Name Inputs */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Player X Name</label>
              <input 
                type="text" 
                value={playerNames.X}
                onChange={(e) => setPlayerNames({ ...playerNames, X: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-white placeholder-slate-600"
                placeholder="Enter Name for X"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">
                {mode === GameMode.SINGLE ? 'AI Identity' : 'Player O Name'}
              </label>
              <input 
                type="text" 
                value={playerNames.O}
                onChange={(e) => setPlayerNames({ ...playerNames, O: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-white placeholder-slate-600"
                placeholder="Enter Name for O"
              />
            </div>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">
              Opponent Architecture
            </label>
            <div className="grid grid-cols-2 gap-3 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setMode(GameMode.SINGLE)}
                className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === GameMode.SINGLE ? 'bg-slate-700 text-white shadow-lg ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                vs Gemini
              </button>
              <button 
                onClick={() => setMode(GameMode.MULTI)}
                className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === GameMode.MULTI ? 'bg-slate-700 text-white shadow-lg ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Local PvP
              </button>
            </div>
          </div>

          {/* Difficulty - only if Solo */}
          {mode === GameMode.SINGLE && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">
                AI Logic Depth
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: Difficulty.EASY, label: 'Early Access', desc: 'Predictable and prone to errors.' },
                  { id: Difficulty.MEDIUM, label: 'Stable Release', desc: 'Calculated and competitive.' },
                  { id: Difficulty.HARD, label: 'Prime Unbeatable', desc: 'Optimal strategy processing.' }
                ].map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-4 rounded-2xl text-left transition-all border ${difficulty === diff.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-950/40 border-transparent hover:bg-slate-900/60'}`}
                  >
                    <div className={`text-xs font-black uppercase tracking-widest ${difficulty === diff.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {diff.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {diff.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-xl mt-4"
          >
            Deploy Changes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SettingsModal;
