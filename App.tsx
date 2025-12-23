
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameMode, Difficulty, Player, SquareValue } from './types';
import { calculateWinner, getBestMove } from './services/gameLogic';
import Square from './components/Square';
import SettingsModal from './components/SettingsModal';
import { XIcon, OIcon, SettingsIcon } from './constants';

const App: React.FC = () => {
  const [history, setHistory] = useState<SquareValue[][]>([Array(9).fill(null)]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [moveLog, setMoveLog] = useState<{ player: string; symbol: Player; index: number }[]>([]);
  
  const [playerNames, setPlayerNames] = useState({ X: 'Player X', O: 'Player O' });
  const [mode, setMode] = useState<GameMode>(GameMode.SINGLE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.HARD);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });

  const board = useMemo(() => history[currentStep], [history, currentStep]);
  const xIsNext = currentStep % 2 === 0;

  const result = calculateWinner(board);
  const winner = result?.winner ?? null;
  const winningLine = result?.line ?? null;
  const isGameOver = !!winner;

  const makeMove = useCallback((index: number) => {
    if (board[index] || winner || isAiThinking) return;

    const currentPlayerSymbol: Player = xIsNext ? 'X' : 'O';
    const currentPlayerName = xIsNext ? playerNames.X : playerNames.O;
    const newBoard = [...board];
    newBoard[index] = currentPlayerSymbol;

    const newHistory = history.slice(0, currentStep + 1);
    const updatedHistory = [...newHistory, newBoard];
    
    const newMoveLog = moveLog.slice(0, currentStep);
    setMoveLog([...newMoveLog, { player: currentPlayerName, symbol: currentPlayerSymbol, index: index + 1 }]);

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
  }, [board, winner, xIsNext, isAiThinking, history, currentStep, playerNames, moveLog]);

  useEffect(() => {
    const isAtLatestStep = currentStep === history.length - 1;
    if (mode === GameMode.SINGLE && !xIsNext && !winner && isAtLatestStep) {
      const timer = setTimeout(() => {
        setIsAiThinking(true);
        const bestMoveIndex = getBestMove(board, difficulty);
        makeMove(bestMoveIndex);
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
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentStep(0);
    setMoveLog([]);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, Draw: 0 });
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
      {/* Header & Stats */}
      <div className="w-full space-y-8 animate-fade-in mt-10">
        <h1 className="text-6xl sm:text-8xl font-black text-center tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-white to-rose-400">
          Tic Taq Toe
        </h1>
        
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full max-w-4xl mx-auto">
          {/* Player X Card */}
          <div className={`relative flex-1 glass p-6 rounded-[2.5rem] border-t-2 transition-all duration-500 ${leader === 'X' ? 'border-cyan-400 scale-105 shadow-2xl' : 'border-white/5 opacity-80'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                <XIcon className="w-9 h-9 text-cyan-400" />
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block text-[10px] uppercase font-black text-slate-500 tracking-widest truncate">{playerNames.X}</span>
                <span className="text-4xl font-black text-white">{scores.X}</span>
              </div>
            </div>
            {leader === 'X' && <div className="absolute top-2 right-4 text-[8px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">Leader</div>}
          </div>

          {/* Draws */}
          <div className="flex flex-col items-center justify-center px-8 py-4 glass rounded-3xl border border-white/5 opacity-60">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Stalemates</span>
            <span className="text-2xl font-black text-slate-300">{scores.Draw}</span>
          </div>

          {/* Player O Card */}
          <div className={`relative flex-1 glass p-6 rounded-[2.5rem] border-t-2 transition-all duration-500 ${leader === 'O' ? 'border-rose-400 scale-105 shadow-2xl' : 'border-white/5 opacity-80'}`}>
            <div className="flex items-center gap-4 justify-end text-right">
              <div className="flex-1 overflow-hidden">
                <span className="block text-[10px] uppercase font-black text-slate-500 tracking-widest truncate">{playerNames.O}</span>
                <span className="text-4xl font-black text-white">{scores.O}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-400/10 flex items-center justify-center border border-rose-400/20">
                <OIcon className="w-9 h-9 text-rose-400" />
              </div>
            </div>
            {leader === 'O' && <div className="absolute top-2 left-4 text-[8px] font-black text-rose-400 uppercase tracking-widest animate-pulse">Leader</div>}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col xl:flex-row items-start justify-center gap-8 w-full">
        
        {/* Move Timeline */}
        <div className="glass p-8 rounded-[3rem] w-full xl:max-w-[280px] h-fit xl:h-[540px] flex flex-col animate-fade-in order-2 xl:order-1">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center mb-6 border-b border-white/5 pb-2">Move Timeline</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[250px] xl:max-h-full">
            {moveLog.length === 0 ? (
              <div className="h-20 flex items-center justify-center text-[10px] uppercase font-black text-slate-700 tracking-widest">Initialization Pending...</div>
            ) : (
              moveLog.slice().reverse().map((log, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/50 border border-white/5 animate-fade-in">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${log.symbol === 'X' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-rose-400/10 text-rose-400'}`}>
                    {log.symbol}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[10px] font-black uppercase text-slate-400 truncate">{log.player}</div>
                    <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Sector {log.index}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Board */}
        <div className="relative order-1 xl:order-2 flex flex-col items-center flex-1">
          <div className="mb-6 flex items-center gap-3 bg-slate-900/80 px-6 py-2 rounded-full border border-white/5 animate-fade-in shadow-xl">
             <div className={`w-2 h-2 rounded-full ${isGameOver ? 'bg-slate-700' : (xIsNext ? 'bg-cyan-400 animate-pulse' : 'bg-rose-400 animate-pulse')}`}></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               {isGameOver ? 'Session Finalized' : `Current Phase: ${xIsNext ? playerNames.X : playerNames.O}`}
             </span>
          </div>

          <div className="relative">
            {isGameOver && (
              <div className="absolute -inset-8 bg-slate-950/95 backdrop-blur-2xl rounded-[4rem] z-20 flex flex-col items-center justify-center p-12 text-center animate-fade-in border border-white/10 shadow-2xl">
                <div className="mb-8 p-10 rounded-full bg-white/5 ring-1 ring-white/10 shadow-inner">
                   {winner === 'X' ? <XIcon className="w-24 h-24 neon-x" /> : winner === 'O' ? <OIcon className="w-24 h-24 neon-o" /> : <div className="text-7xl">🤝</div>}
                </div>
                <h2 className="text-5xl font-black mb-1 tracking-tighter text-white uppercase">
                  {winner === 'Draw' ? "Draw" : "Victory"}
                </h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-12">
                  {winner === 'Draw' ? "Balanced State Detected" : `${winner === 'X' ? playerNames.X : playerNames.O} Wins Round`}
                </p>
                <button onClick={resetGame} className="bg-white text-slate-950 px-16 py-5 rounded-[2.5rem] font-black hover:bg-cyan-400 hover:text-white transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-xs">
                  Next Iteration
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-6 p-8 glass rounded-[4rem] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
              {board.map((square, i) => (
                <Square key={i} value={square} onClick={() => makeMove(i)} isWinningSquare={winningLine?.includes(i) ?? false} disabled={isGameOver || isAiThinking} />
              ))}
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="glass p-8 rounded-[3rem] w-full xl:max-w-[280px] space-y-8 animate-fade-in order-3 self-center xl:self-start">
          <div className="space-y-4 text-center">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5 pb-2">Interface</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={undo}
                disabled={currentStep === 0 || isAiThinking}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border border-white/5 transition-all ${currentStep === 0 || isAiThinking ? 'opacity-10 cursor-not-allowed bg-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span className="text-[9px] uppercase font-black">Undo</span>
              </button>
              <button 
                onClick={redo}
                disabled={currentStep >= history.length - 1 || isAiThinking}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border border-white/5 transition-all ${currentStep >= history.length - 1 || isAiThinking ? 'opacity-10 cursor-not-allowed bg-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span className="text-[9px] uppercase font-black">Redo</span>
              </button>
            </div>
            <button onClick={resetGame} className="w-full bg-slate-50 hover:bg-white text-slate-950 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest">
              Reset Session
            </button>
          </div>
          <div className="pt-6 border-t border-white/5 space-y-3">
             <button onClick={() => setIsSettingsOpen(true)} className="w-full bg-slate-900/40 hover:bg-slate-900 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-3">
                <SettingsIcon className="w-4 h-4" />
                Config
              </button>
              <button onClick={resetScores} className="w-full text-rose-500/30 hover:text-rose-400 py-2 text-[8px] font-black uppercase tracking-widest transition-all">
                Wipe Metrics
              </button>
          </div>
        </div>
      </div>

      {/* Production Footer */}
      <footer className="w-full py-12 mt-auto border-t border-white/5 flex flex-col items-center gap-6 animate-fade-in opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em]">&copy; Noam Gold AI 2025</p>
        <div className="flex items-center gap-8">
          <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Send Feedback</span>
          <a href="mailto:gold.noam@gmail.com" className="text-[10px] font-black uppercase text-cyan-400 hover:text-white transition-colors tracking-widest">gold.noam@gmail.com</a>
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
