
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameMode, Difficulty, Player, SquareValue } from './types';
import { calculateWinner, getBestMove } from './services/gameLogic';
import { getGameCommentary } from './services/geminiService';
import Square from './components/Square';
import SettingsModal from './components/SettingsModal';
import { XIcon, OIcon, SettingsIcon } from './constants';

const App: React.FC = () => {
  const [history, setHistory] = useState<SquareValue[][]>([Array(9).fill(null)]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [mode, setMode] = useState<GameMode>(GameMode.SINGLE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.HARD);
  const [commentary, setCommentary] = useState("Welcome to Gemini Tic-Tac-Toe. I challenge you!");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });

  const board = useMemo(() => history[currentStep], [history, currentStep]);
  const xIsNext = currentStep % 2 === 0;

  const result = calculateWinner(board);
  const winner = result?.winner ?? null;
  const winningLine = result?.line ?? null;
  const isGameOver = !!winner;

  const makeMove = useCallback(async (index: number) => {
    if (board[index] || winner || isAiThinking) return;

    const currentPlayer = xIsNext ? 'X' : 'O';
    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    const newHistory = history.slice(0, currentStep + 1);
    const updatedHistory = [...newHistory, newBoard];
    
    setHistory(updatedHistory);
    setCurrentStep(updatedHistory.length - 1);
    
    const currentResult = calculateWinner(newBoard);
    if (currentResult) {
      if (currentResult.winner === 'Draw') {
        setScores(s => ({ ...s, Draw: s.Draw + 1 }));
      } else if (currentResult.winner === 'X') {
        setScores(s => ({ ...s, X: s.X + 1 }));
      } else {
        setScores(s => ({ ...s, O: s.O + 1 }));
      }
    }

    const comment = await getGameCommentary(newBoard, index, currentPlayer, currentResult?.winner ?? null);
    setCommentary(comment);
  }, [board, winner, xIsNext, isAiThinking, history, currentStep]);

  useEffect(() => {
    const isAtLatestStep = currentStep === history.length - 1;
    if (mode === GameMode.SINGLE && !xIsNext && !winner && isAtLatestStep) {
      const timer = setTimeout(async () => {
        setIsAiThinking(true);
        const bestMoveIndex = getBestMove(board, difficulty);
        await makeMove(bestMoveIndex);
        setIsAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, board, mode, winner, difficulty, makeMove, currentStep, history.length]);

  const undo = () => {
    if (currentStep === 0) return;
    if (mode === GameMode.SINGLE && currentStep >= 2 && xIsNext) {
      setCurrentStep(currentStep - 2);
    } else {
      setCurrentStep(currentStep - 1);
    }
    setCommentary("Stepping back in time...");
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
      setCommentary("Looking into the future...");
    }
  };

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentStep(0);
    setCommentary("Fresh start. Don't let me down!");
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, Draw: 0 });
    setCommentary("The leaderboard is clean. Let's see who's really better.");
  };

  const updateSettings = (newMode: GameMode, newDifficulty: Difficulty) => {
    if (newMode !== mode || newDifficulty !== difficulty) {
      setMode(newMode);
      setDifficulty(newDifficulty);
      resetGame();
    }
  };

  // Determine who is leading for visual highlight
  const leader = useMemo(() => {
    if (scores.X > scores.O) return 'X';
    if (scores.O > scores.X) return 'O';
    return null;
  }, [scores]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-12 max-w-5xl mx-auto">
      {/* Header & Enhanced Stats */}
      <div className="w-full space-y-8 animate-fade-in">
        <h1 className="text-5xl sm:text-6xl font-black text-center tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-rose-400">
          GEMINI <span className="font-extralight italic">OS</span>
        </h1>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-3xl mx-auto">
          {/* Player X Card */}
          <div className={`relative flex-1 glass p-5 rounded-[2rem] border-t-2 transition-all duration-500 overflow-hidden ${leader === 'X' ? 'border-cyan-400 scale-105 shadow-[0_20px_40px_rgba(34,211,238,0.15)]' : 'border-white/5 opacity-80'}`}>
            {leader === 'X' && <div className="absolute top-2 right-4 text-[8px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">Leading</div>}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                <XIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">Player X</span>
                <span className="text-4xl font-black text-white tabular-nums">{scores.X}</span>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-400 transition-all duration-700" style={{ width: `${(scores.X / (scores.X + scores.O + scores.Draw || 1)) * 100}%` }}></div>
            </div>
          </div>

          {/* Draws Display */}
          <div className="flex flex-col items-center justify-center px-6 py-2 glass rounded-full border border-white/5 opacity-60">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Draws</span>
            <span className="text-xl font-black text-slate-300">{scores.Draw}</span>
          </div>

          {/* Gemini O Card */}
          <div className={`relative flex-1 glass p-5 rounded-[2rem] border-t-2 transition-all duration-500 overflow-hidden ${leader === 'O' ? 'border-rose-400 scale-105 shadow-[0_20px_40px_rgba(244,63,94,0.15)]' : 'border-white/5 opacity-80'}`}>
            {leader === 'O' && <div className="absolute top-2 left-4 text-[8px] font-black text-rose-400 uppercase tracking-widest animate-pulse">Leading</div>}
            <div className="flex items-center gap-4 justify-end md:justify-start">
              <div className="md:order-last w-12 h-12 rounded-xl bg-rose-400/10 flex items-center justify-center border border-rose-400/20">
                <OIcon className="w-8 h-8 text-rose-400" />
              </div>
              <div className="text-right md:text-left">
                <span className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">Gemini O</span>
                <span className="text-4xl font-black text-white tabular-nums">{scores.O}</span>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
               <div className="h-full bg-rose-400 transition-all duration-700 ml-auto" style={{ width: `${(scores.O / (scores.X + scores.O + scores.Draw || 1)) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-12 w-full">
        {/* Controls Panel */}
        <div className="glass p-8 rounded-[2.5rem] w-full max-w-xs space-y-8 order-2 lg:order-1 self-center lg:self-start">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Session Controls</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={undo}
                disabled={currentStep === 0 || isAiThinking}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border border-slate-700/50 ${currentStep === 0 || isAiThinking ? 'opacity-30 cursor-not-allowed bg-slate-800' : 'bg-slate-800/80 hover:bg-slate-700 text-white active:scale-95'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span className="text-[10px] uppercase">Back</span>
              </button>
              <button 
                onClick={redo}
                disabled={currentStep >= history.length - 1 || isAiThinking}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border border-slate-700/50 ${currentStep >= history.length - 1 || isAiThinking ? 'opacity-30 cursor-not-allowed bg-slate-800' : 'bg-slate-800/80 hover:bg-slate-700 text-white active:scale-95'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span className="text-[10px] uppercase">Next</span>
              </button>
            </div>

            <button 
              onClick={resetGame}
              className="w-full bg-slate-100 hover:bg-white text-slate-900 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
            >
              New Round
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/5"
              >
                <SettingsIcon className="w-4 h-4" />
                Config
              </button>
              
              <button 
                onClick={resetScores}
                className="w-full bg-transparent border border-rose-500/20 hover:bg-rose-500/10 text-rose-500/60 py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Reset Database
              </button>
          </div>
        </div>

        {/* Board Container */}
        <div className="relative order-1 lg:order-2 flex flex-col items-center">
          {/* Active Turn Badge */}
          <div className="mb-6 flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-full border border-white/5 animate-fade-in">
             <div className={`w-2 h-2 rounded-full animate-pulse ${xIsNext ? 'bg-cyan-400' : 'bg-rose-400'}`}></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               {isGameOver ? 'Session Ended' : `${xIsNext ? 'Player X' : 'Gemini O'}'s Turn`}
             </span>
          </div>

          <div className="relative">
            {isGameOver && (
              <div className="absolute -inset-6 bg-slate-950/80 backdrop-blur-xl rounded-[3rem] z-20 flex flex-col items-center justify-center p-8 text-center animate-fade-in border border-white/10 shadow-2xl">
                <div className="mb-8 p-6 rounded-full bg-white/5 ring-1 ring-white/10 animate-bounce">
                   {winner === 'X' ? <XIcon className="w-24 h-24 neon-x" /> : winner === 'O' ? <OIcon className="w-24 h-24 neon-o" /> : <div className="text-6xl">🤝</div>}
                </div>
                <h2 className="text-4xl font-black mb-2 tracking-tighter text-white">
                  {winner === 'Draw' ? "STALEMATE" : `${winner} DOMINANT`}
                </h2>
                <p className="text-slate-500 text-sm mb-8 font-medium">Tournament session result synchronized.</p>
                <button 
                  onClick={resetGame}
                  className="bg-white text-slate-950 px-12 py-5 rounded-[2rem] font-black hover:bg-cyan-400 hover:text-white transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-sm"
                >
                  Confirm Rematch
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 sm:gap-6 p-6 glass rounded-[3rem] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              {board.map((square, i) => (
                <Square
                  key={i}
                  value={square}
                  onClick={() => makeMove(i)}
                  isWinningSquare={winningLine?.includes(i) ?? false}
                  disabled={isGameOver || isAiThinking}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Commentary Box */}
      <div className="w-full max-w-3xl glass p-10 rounded-[3rem] border-t border-white/10 relative overflow-hidden animate-fade-in shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-cyan-400 via-indigo-600 to-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.4)] ring-4 ring-white/5">
            <span className="font-black text-white italic text-3xl">G</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
              <h4 className="text-xs font-black uppercase text-cyan-400 tracking-[0.4em]">Intelligence Core v3.0</h4>
              <div className="px-3 py-1 rounded-full bg-white/5 text-[9px] uppercase font-black text-slate-500 tracking-tighter border border-white/5">
                Latency: 12ms • Step: {currentStep}
              </div>
            </div>
            <p className="text-2xl font-light leading-snug italic text-white/90 min-h-[4rem]">
              "{commentary}"
            </p>
          </div>
        </div>
        {isAiThinking && (
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full animate-[scan_2s_infinite]"></div>
        )}
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        mode={mode}
        setMode={(m) => updateSettings(m, difficulty)}
        difficulty={difficulty}
        setDifficulty={(d) => updateSettings(mode, d)}
      />

      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
