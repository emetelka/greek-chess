/**
 * Greek Gods Chess - Main Entry Point
 * Initializes the game and sets up the UI
 */

import './style.css';
import { GameState } from './core/GameState';
import { BoardRenderer } from './ui/BoardRenderer';
import { PieceRenderer } from './ui/PieceRenderer';
import { Position, Color, GameStatus, PieceType } from './core/types';

class GreekChessGame {
  private gameState: GameState;
  private boardRenderer: BoardRenderer;
  private pieceRenderer: PieceRenderer;
  private selectedPosition: Position | null = null;
  private capturedWhite: any[] = [];
  private capturedBlack: any[] = [];

  constructor() {
    this.gameState = new GameState();
    this.boardRenderer = new BoardRenderer('chess-board');
    this.pieceRenderer = new PieceRenderer(this.boardRenderer);

    this.initialize();
  }

  /**
   * Initialize the game
   */
  private initialize(): void {
    // Initialize board DOM
    this.boardRenderer.initialize();

    // Render initial pieces
    this.render();

    // Set up event listeners
    this.setupEventListeners();

    // Update UI
    this.updateUI();
  }

  /**
   * Set up all event listeners
   */
  private setupEventListeners(): void {
    // Square click handler
    this.boardRenderer.addClickHandler((position) => this.handleSquareClick(position));

    // Undo button
    const undoButton = document.getElementById('undo-button');
    if (undoButton) {
      undoButton.addEventListener('click', () => this.handleUndo());
    }

    // Reset button
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
      resetButton.addEventListener('click', () => this.handleReset());
    }
  }

  /**
   * Handle square click
   */
  private handleSquareClick(position: Position): void {
    const piece = this.gameState.getBoard().getPiece(position);

    // If no piece is selected
    if (!this.selectedPosition) {
      // Select piece if it belongs to current player
      if (piece && piece.color === this.gameState.getCurrentTurn()) {
        this.selectPiece(position);
      }
      return;
    }

    // If clicking the same square, deselect
    if (this.selectedPosition.equals(position)) {
      this.deselectPiece();
      return;
    }

    // If clicking another piece of the same color, switch selection
    if (piece && piece.color === this.gameState.getCurrentTurn()) {
      this.selectPiece(position);
      return;
    }

    // Try to make a move
    this.makeMove(this.selectedPosition, position);
  }

  /**
   * Select a piece
   */
  private selectPiece(position: Position): void {
    this.selectedPosition = position;

    // Clear previous highlights
    this.boardRenderer.clearHighlights();

    // Highlight selected square
    this.boardRenderer.highlightSelected(position);

    // Get and highlight legal moves
    const legalMoves = this.gameState.getLegalMoves(position);
    this.boardRenderer.highlightLegalMoves(legalMoves, this.gameState.getBoard());
  }

  /**
   * Deselect piece
   */
  private deselectPiece(): void {
    this.selectedPosition = null;
    this.boardRenderer.clearHighlights();

    // Re-highlight last move if exists
    const lastMove = this.gameState.getLastMove();
    if (lastMove) {
      this.boardRenderer.highlightLastMove(lastMove.from, lastMove.to);
    }

    // Re-highlight check if in check
    this.highlightCheckIfNeeded();
  }

  /**
   * Make a move
   */
  private makeMove(from: Position, to: Position): void {
    const result = this.gameState.makeMove(from, to);

    if (result.success) {
      // Track captured pieces
      if (result.capturedPiece) {
        if (result.capturedPiece.color === Color.WHITE) {
          this.capturedWhite.push(result.capturedPiece);
        } else {
          this.capturedBlack.push(result.capturedPiece);
        }
      }

      // Deselect and render
      this.deselectPiece();
      this.render();
      this.updateUI();

      // Highlight last move
      if (result.move) {
        this.boardRenderer.highlightLastMove(result.move.from, result.move.to);
      }

      // Highlight check if needed
      this.highlightCheckIfNeeded();

      // Add move to history display
      this.updateMoveHistory();
    } else {
      // Invalid move - just deselect
      this.deselectPiece();
    }
  }

  /**
   * Handle undo
   */
  private handleUndo(): void {
    const success = this.gameState.undoMove();

    if (success) {
      // Restore captured pieces from last move
      const moveHistory = this.gameState.getMoveHistory();
      this.recalculateCapturedPieces(moveHistory);

      this.deselectPiece();
      this.render();
      this.updateUI();
      this.updateMoveHistory();
    }
  }

  /**
   * Recalculate captured pieces from move history
   */
  private recalculateCapturedPieces(moves: any[]): void {
    this.capturedWhite = [];
    this.capturedBlack = [];

    for (const move of moves) {
      if (move.capturedPiece) {
        if (move.capturedPiece.color === Color.WHITE) {
          this.capturedWhite.push(move.capturedPiece);
        } else {
          this.capturedBlack.push(move.capturedPiece);
        }
      }
    }
  }

  /**
   * Handle reset
   */
  private handleReset(): void {
    if (confirm('Start a new game? Current game will be lost.')) {
      this.gameState.reset();
      this.capturedWhite = [];
      this.capturedBlack = [];
      this.deselectPiece();
      this.render();
      this.updateUI();
      this.updateMoveHistory();
    }
  }

  /**
   * Render the board and pieces
   */
  private render(): void {
    this.pieceRenderer.renderBoard(this.gameState.getBoard());
    this.pieceRenderer.renderCapturedPieces(this.capturedWhite, this.capturedBlack);
  }

  /**
   * Update UI elements (turn indicator, status, buttons)
   */
  private updateUI(): void {
    this.updateTurnIndicator();
    this.updateGameStatus();
    this.updateButtons();
  }

  /**
   * Update turn indicator
   */
  private updateTurnIndicator(): void {
    const turnIndicator = document.getElementById('turn-indicator');
    if (!turnIndicator) return;

    const currentTurn = this.gameState.getCurrentTurn();
    const turnText =
      currentTurn === Color.WHITE
        ? "White's Turn (Olympians)"
        : "Black's Turn (Underworld)";

    turnIndicator.textContent = turnText;
    turnIndicator.classList.toggle('black-turn', currentTurn === Color.BLACK);
  }

  /**
   * Update game status display
   */
  private updateGameStatus(): void {
    const statusElement = document.getElementById('game-status');
    if (!statusElement) return;

    const status = this.gameState.getStatus();
    statusElement.className = 'game-status';

    switch (status) {
      case GameStatus.CHECK:
        statusElement.classList.add('check');
        statusElement.textContent = 'Check!';
        break;
      case GameStatus.CHECKMATE:
        statusElement.classList.add('checkmate');
        const winner = this.gameState.getCurrentTurn() === Color.WHITE ? 'Black' : 'White';
        statusElement.textContent = `Checkmate! ${winner} Wins!`;
        break;
      case GameStatus.STALEMATE:
        statusElement.classList.add('stalemate');
        statusElement.textContent = 'Stalemate! Game Drawn';
        break;
      default:
        statusElement.textContent = '';
    }
  }

  /**
   * Update button states
   */
  private updateButtons(): void {
    const undoButton = document.getElementById('undo-button') as HTMLButtonElement;
    if (undoButton) {
      undoButton.disabled = this.gameState.getMoveCount() === 0;
    }
  }

  /**
   * Highlight check if king is in check
   */
  private highlightCheckIfNeeded(): void {
    if (this.gameState.isInCheck()) {
      const currentTurn = this.gameState.getCurrentTurn();
      const kingPos = this.gameState.getBoard().findPiece(PieceType.KING, currentTurn);
      if (kingPos) {
        this.boardRenderer.highlightCheck(kingPos);
      }
    }
  }

  /**
   * Update move history display
   */
  private updateMoveHistory(): void {
    const movesListElement = document.getElementById('moves-list');
    if (!movesListElement) return;

    movesListElement.innerHTML = '';

    const moves = this.gameState.getMoveHistory();

    // Group moves by turn (white + black = 1 turn)
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];

      const moveEntry = document.createElement('div');
      moveEntry.className = 'move-entry';

      const moveNumberSpan = document.createElement('span');
      moveNumberSpan.className = 'move-number';
      moveNumberSpan.textContent = `${moveNumber}.`;

      const whiteNotation = document.createElement('span');
      whiteNotation.className = 'move-notation';
      whiteNotation.textContent = whiteMove.notation;

      moveEntry.appendChild(moveNumberSpan);
      moveEntry.appendChild(whiteNotation);

      if (blackMove) {
        const blackNotation = document.createElement('span');
        blackNotation.className = 'move-notation';
        blackNotation.textContent = ` ${blackMove.notation}`;
        moveEntry.appendChild(blackNotation);
      }

      movesListElement.appendChild(moveEntry);
    }

    // Scroll to bottom
    movesListElement.scrollTop = movesListElement.scrollHeight;
  }
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GreekChessGame();
});
