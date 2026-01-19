/**
 * MoveHistory tracks all moves made in the game and enables undo functionality
 */

import { Move, IBoard } from './types';
import { Board } from './Board';

export interface HistoryEntry {
  move: Move;
  boardBeforeMove: Board;
}

export class MoveHistory {
  private history: HistoryEntry[] = [];

  /**
   * Add a move to the history with the board state before the move
   */
  addMove(move: Move, boardBeforeMove: IBoard): void {
    // Clone the board to preserve state
    const clonedBoard = boardBeforeMove.clone() as Board;
    this.history.push({
      move,
      boardBeforeMove: clonedBoard,
    });
  }

  /**
   * Undo the last move and return the board state and move
   */
  undo(): HistoryEntry | null {
    if (this.history.length === 0) {
      return null;
    }

    const entry = this.history.pop();
    return entry || null;
  }

  /**
   * Get the last move without removing it
   */
  getLastMove(): Move | null {
    if (this.history.length === 0) {
      return null;
    }

    return this.history[this.history.length - 1]!.move;
  }

  /**
   * Get all moves in the history
   */
  getAllMoves(): Move[] {
    return this.history.map((entry) => entry.move);
  }

  /**
   * Get the number of moves made
   */
  getMoveCount(): number {
    return this.history.length;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
  }

  /**
   * Check if there are any moves in the history
   */
  isEmpty(): boolean {
    return this.history.length === 0;
  }

  /**
   * Get a specific move by index
   */
  getMove(index: number): Move | null {
    if (index < 0 || index >= this.history.length) {
      return null;
    }
    return this.history[index]!.move;
  }

  /**
   * Get the full history entry at an index
   */
  getEntry(index: number): HistoryEntry | null {
    if (index < 0 || index >= this.history.length) {
      return null;
    }
    return this.history[index] ?? null;
  }
}
