
import { GoogleGenAI } from "@google/genai";
import { SquareValue, Player } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameCommentary = async (
  board: SquareValue[],
  lastMoveIndex: number,
  player: Player,
  winner: Player | 'Draw' | null
) => {
  try {
    const boardState = board.map((s, i) => s || (i + 1)).join(', ');
    const winnerText = winner ? (winner === 'Draw' ? "It's a draw!" : `${winner} wins!`) : "Game in progress.";
    
    const prompt = `
      You are a witty, slightly sarcastic, but fun Tic-Tac-Toe game master named "Gemini Prime". 
      The current board state is: [${boardState}] (numbers represent empty spots).
      Player ${player} just moved to position ${lastMoveIndex + 1}.
      Current Status: ${winnerText}
      
      Provide a very short (max 15 words) commentary on the current situation. 
      Be competitive if the AI is 'O'.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 50,
      }
    });

    return response.text?.trim() || "Nice move.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The game intensifies...";
  }
};
