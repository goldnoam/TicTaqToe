
import React from 'react';
import { GameMode, Difficulty } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  mode,
  setMode,
  difficulty,
  setDifficulty
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative glass w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-white/10 animate-[scaleIn_0.3s_ease-out] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-rose-400"></div>
        
        <h2 className="text-2xl font-black mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-400">
          GAME SETTINGS
        </h2>

        <div className="space-y-8">
          {/* Mode Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-black uppercase text-slate-500 tracking-widest text-center">
              Opponent
            </label>
            <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setMode(GameMode.SINGLE)}
                className={`py-3 text-sm font-bold rounded-xl transition-all ${mode === GameMode.SINGLE ? 'bg-slate-700 text-white shadow-lg ring-1 ring-white/10' : 'text-slate-400 hover:text-slate-200'}`}
              >
                vs Gemini
              </button>
              <button 
                onClick={() => setMode(GameMode.MULTI)}
                className={`py-3 text-sm font-bold rounded-xl transition-all ${mode === GameMode.MULTI ? 'bg-slate-700 text-white shadow-lg ring-1 ring-white/10' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Local PvP
              </button>
            </div>
          </div>

          {/* Difficulty - only if Solo */}
          {mode === GameMode.SINGLE && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-xs font-black uppercase text-slate-500 tracking-widest text-center">
                AI Difficulty
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: Difficulty.EASY, label: 'Early Access (Easy)', desc: 'I might "accidentally" lose.' },
                  { id: Difficulty.MEDIUM, label: 'Beta (Medium)', desc: 'Testing your logic.' },
                  { id: Difficulty.HARD, label: 'Prime (Impossible)', desc: 'Unbeatable logic engine.' }
                ].map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-4 rounded-2xl text-left transition-all border ${difficulty === diff.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-900/40 border-transparent hover:bg-slate-800/40'}`}
                  >
                    <div className={`font-bold ${difficulty === diff.id ? 'text-cyan-400' : 'text-slate-200'}`}>
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
            className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
          >
            Apply & Close
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
