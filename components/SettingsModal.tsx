
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
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      ></div>

      <div className="relative glass w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-white/10 animate-scale-in overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-400"></div>
        
        <h2 className="text-3xl font-black mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-400">
          GLOBAL CONFIG
        </h2>

        <div className="space-y-8">
          {/* Identity Config */}
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 pl-1">Identity X</label>
              <input 
                type="text" 
                value={playerNames.X}
                onChange={(e) => setPlayerNames({ ...playerNames, X: e.target.value })}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 pl-1">
                {mode === GameMode.SINGLE ? 'Logic Opponent' : 'Identity O'}
              </label>
              <input 
                type="text" 
                value={playerNames.O}
                onChange={(e) => setPlayerNames({ ...playerNames, O: e.target.value })}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50"
              />
            </div>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Mode Selection */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">
              Session Architecture
            </label>
            <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setMode(GameMode.SINGLE)}
                className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === GameMode.SINGLE ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Solo
              </button>
              <button 
                onClick={() => setMode(GameMode.MULTI)}
                className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === GameMode.MULTI ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Dual
              </button>
            </div>
          </div>

          {/* Logic Level - only if Solo */}
          {mode === GameMode.SINGLE && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">
                Logic Depth
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: Difficulty.EASY, label: 'Early Access', desc: 'Baseline heuristics.' },
                  { id: Difficulty.MEDIUM, label: 'Standard', desc: 'Balanced decision tree.' },
                  { id: Difficulty.HARD, label: 'Prime Unbeatable', desc: 'Recursive minimax optimization.' }
                ].map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-4 rounded-2xl text-left transition-all border ${difficulty === diff.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-950 border-transparent hover:bg-slate-900'}`}
                  >
                    <div className={`text-[10px] font-black uppercase tracking-widest ${difficulty === diff.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {diff.label}
                    </div>
                    <div className="text-[9px] text-slate-600 font-medium">
                      {diff.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 hover:text-white transition-all active:scale-95 shadow-2xl mt-4"
          >
            Confirm Deployment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
