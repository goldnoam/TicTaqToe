
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
  const [moveLog, setMoveLog] = useState<{player: string, pos: number}[]>([]);
  
  const [playerNames, setPlayerNames] = useState({ X: 'Player X', O: 'Gemini O' });
  const [mode, setMode] = useState<GameMode>(GameMode.SINGLE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.HARD);
  const [commentary, setCommentary] = useState("Welcome to the arena. May the best logic win.");
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

    const currentPlayerSymbol = xIsNext ? 'X' : 'O';
    const currentPlayerName = xIsNext ? playerNames.X : playerNames.O;
    const newBoard = [...board];
    newBoard[index] = currentPlayerSymbol;

    const newHistory = history.slice(0, currentStep + 1);
    const updatedHistory = [...newHistory, newBoard];
    
    // Update move log
    const newMoveLog = moveLog.slice(0, currentStep);
    setMoveLog([...newMoveLog, { player: currentPlayerName, pos: index + 1 }]);

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

    const comment = await getGameCommentary(newBoard, index, currentPlayerSymbol, currentResult?.winner ?? null);
    setCommentary(comment);
  }, [board, winner, xIsNext, isAiThinking, history, currentStep, playerNames, moveLog]);

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
    setCommentary("Temporal shift successful.");
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
      setCommentary("Future state restoration in progress.");
    }
  };

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentStep(0);
    setMoveLog([]);
    setCommentary("Memory cleared. Initializing new session.");
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, Draw: 0 });
    setCommentary("Score registers zeroed out.");
  };

  const updateSettings = (newMode: GameMode, newDifficulty: Difficulty) => {
    if (newMode !== mode || newDifficulty !== difficulty) {
      setMode(newMode);
      setDifficulty(newDifficulty);
      resetGame();
    }
  };

  const leader = useMemo(() => {
    if (scores.X > scores.O) return 'X';
    if (scores.O > scores.X) return 'O';
    return null;
  }, [scores]);

  return (
    <div className="min-h-screen flex flex-col p-4 space-y-12 max-w-6xl mx-auto">
      {/* Header & Enhanced Stats */}
      <div className="w-full space-y-8 animate-fade-in mt-8">
        <h1 className="text-5xl sm:text-7xl font-black text-center tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400">
          TIc Tac Toe Game
        </h1>
        
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full max-w-4xl mx-auto">
          {/* Player X Card */}
          <div className={`relative flex-1 glass p-6 rounded-[2.5rem] border-t-2 transition-all duration-500 overflow-hidden ${leader === 'X' ? 'border-cyan-400 scale-105 shadow-[0_20px_50px_rgba(34,211,238,0.2)]' : 'border-white/5 opacity-80'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                <XIcon className="w-9 h-9 text-cyan-400" />
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block text-[10px] uppercase font-black text-slate-500 tracking-widest truncate">{playerNames.X}</span>
                <span className="text-4xl font-black text-white tabular-nums">{scores.X}</span>
              </div>
            </div>
            {leader === 'X' && <div className="absolute top-2 right-4 text-[8px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">Dominating</div>}
          </div>

          {/* Draws Display */}
          <div className="flex flex-col items-center justify-center px-8 py-4 glass rounded-[2rem] border border-white/5 opacity-60">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Stalemates</span>
            <span className="text-2xl font-black text-slate-300">{scores.Draw}</span>
          </div>

          {/* Player O Card */}
          <div className={`relative flex-1 glass p-6 rounded-[2.5rem] border-t-2 transition-all duration-500 overflow-hidden ${leader === 'O' ? 'border-rose-400 scale-105 shadow-[0_20px_50px_rgba(244,63,94,0.2)]' : 'border-white/5 opacity-80'}`}>
            <div className="flex items-center gap-4 justify-end">
              <div className="flex-1 text-right overflow-hidden">
                <span className="block text-[10px] uppercase font-black text-slate-500 tracking-widest truncate">{playerNames.O}</span>
                <span className="text-4xl font-black text-white tabular-nums">{scores.O}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-400/10 flex items-center justify-center border border-rose-400/20">
                <OIcon className="w-9 h-9 text-rose-400" />
              </div>
            </div>
            {leader === 'O' && <div className="absolute top-2 left-4 text-[8px] font-black text-rose-400 uppercase tracking-widest animate-pulse">Dominating</div>}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col xl:flex-row items-start justify-center gap-8 w-full">
        
        {/* Left: Controls */}
        <div className="glass p-8 rounded-[3rem] w-full xl:max-w-[280px] space-y-8 animate-fade-in order-2 xl:order-1">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Protocol Interface</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={undo}
                disabled={currentStep === 0 || isAiThinking}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border border-white/5 ${currentStep === 0 || isAiThinking ? 'opacity-30 cursor-not-allowed bg-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span className="text-[10px] uppercase">Rewind</span>
              </button>
              <button 
                onClick={redo}
                disabled={currentStep >= history.length - 1 || isAiThinking}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border border-white/5 ${currentStep >= history.length - 1 || isAiThinking ? 'opacity-30 cursor-not-allowed bg-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span className="text-[10px] uppercase">Fast-Fwd</span>
              </button>
            </div>
            <button onClick={resetGame} className="w-full bg-slate-100 hover:bg-white text-slate-950 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest">
              Reset Session
            </button>
          </div>
          <div className="pt-6 border-t border-white/5 space-y-3">
             <button onClick={() => setIsSettingsOpen(true)} className="w-full bg-slate-900/50 hover:bg-slate-900 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-3">
                <SettingsIcon className="w-4 h-4" />
                Configure
              </button>
              <button onClick={resetScores} className="w-full text-rose-500/40 hover:text-rose-400 py-2 text-[8px] font-black uppercase tracking-widest transition-all">
                Wipe Global Data
              </button>
          </div>
        </div>

        {/* Center: Board */}
        <div className="relative order-1 xl:order-2 flex flex-col items-center">
          <div className="mb-6 flex items-center gap-3 bg-slate-900/60 px-6 py-2 rounded-full border border-white/5 animate-fade-in">
             <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${xIsNext ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-rose-400 shadow-[0_0_10px_#f43f5e]'}`}></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
               {isGameOver ? 'Session Concluded' : `Waiting for ${xIsNext ? playerNames.X : playerNames.O}...`}
             </span>
          </div>

          <div className="relative">
            {isGameOver && (
              <div className="absolute -inset-8 bg-slate-950/90 backdrop-blur-2xl rounded-[4rem] z-20 flex flex-col items-center justify-center p-12 text-center animate-fade-in border border-white/10 shadow-2xl">
                <div className="mb-10 p-8 rounded-full bg-white/5 ring-1 ring-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                   {winner === 'X' ? <XIcon className="w-28 h-28 neon-x" /> : winner === 'O' ? <OIcon className="w-28 h-28 neon-o" /> : <div className="text-7xl">🤝</div>}
                </div>
                <h2 className="text-5xl font-black mb-2 tracking-tighter text-white uppercase">
                  {winner === 'Draw' ? "Draw" : "Victory"}
                </h2>
                <p className="text-slate-500 text-sm mb-10 font-bold uppercase tracking-widest">
                  {winner === 'Draw' ? "Logic Loop" : `${winner === 'X' ? playerNames.X : playerNames.O} Optimized`}
                </p>
                <button onClick={resetGame} className="bg-white text-slate-950 px-16 py-5 rounded-[2.5rem] font-black hover:bg-cyan-400 hover:text-white transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-sm">
                  Initialize Next Round
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-5 sm:gap-7 p-8 glass rounded-[4rem] border-white/5 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)]">
              {board.map((square, i) => (
                <Square key={i} value={square} onClick={() => makeMove(i)} isWinningSquare={winningLine?.includes(i) ?? false} disabled={isGameOver || isAiThinking} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Move Log */}
        <div className="glass p-8 rounded-[3rem] w-full xl:max-w-[280px] h-[520px] flex flex-col animate-fade-in order-3">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center mb-6">Execution Log</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {moveLog.length === 0 && (
              <div className="h-full flex items-center justify-center text-[10px] uppercase font-black text-slate-700 tracking-widest text-center">
                Waiting for input...
              </div>
            )}
            {moveLog.slice().reverse().map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-white/5 animate-fade-in">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${log.player === playerNames.X ? 'bg-cyan-400/20 text-cyan-400' : 'bg-rose-400/20 text-rose-400'}`}>
                  {log.player === playerNames.X ? 'X' : 'O'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black uppercase text-slate-400 truncate">{log.player}</div>
                  <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Sector {log.pos} occupied</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-bold text-center text-slate-700 uppercase tracking-widest">
            {moveLog.length} Total Operations
          </div>
        </div>
      </div>

      {/* Commentary Box */}
      <div className="w-full max-w-4xl mx-auto glass p-10 rounded-[3.5rem] border-t border-white/10 relative overflow-hidden animate-fade-in shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-24 h-24 rounded-[2.2rem] bg-slate-950 flex items-center justify-center flex-shrink-0 animate-pulse-slow shadow-2xl ring-4 ring-white/5 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-rose-400/10"></div>
               <span className="relative font-black text-white italic text-4xl">G</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
              <h4 className="text-xs font-black uppercase text-cyan-400 tracking-[0.5em]">Neural Commentary Core</h4>
              <div className="px-4 py-1.5 rounded-full bg-slate-950/80 text-[9px] uppercase font-black text-slate-500 tracking-widest border border-white/10">
                Mode: {mode === GameMode.SINGLE ? difficulty : 'PvP'} • Sync Active
              </div>
            </div>
            <p className="text-3xl font-light leading-tight italic text-slate-100 min-h-[4rem]">
              "{commentary}"
            </p>
          </div>
        </div>
        {isAiThinking && (
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-400 w-full animate-scan"></div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto border-t border-white/5 text-center space-y-2 opacity-60 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">&copy; Noam Gold AI 2025</p>
        <div className="flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-widest">
          <span className="text-slate-600">Send Feedback</span>
          <a href="mailto:gold.noam@gmail.com" className="text-cyan-400 hover:text-white transition-colors">gold.noam@gmail.com</a>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        mode={mode} 
        setMode={(m) => updateSettings(m, difficulty)} 
        difficulty={difficulty} 
        setDifficulty={(d) => updateSettings(mode, d)} 
        playerNames={playerNames}
        setPlayerNames={setPlayerNames}
      />
    </div>
  );
};

export default App;
