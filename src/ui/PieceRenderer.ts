/**
 * PieceRenderer handles rendering chess pieces with Greek god names
 */

import { Board } from '../core/Board';
import { Piece } from '../core/Piece';
import { Position, Color, PieceType } from '../core/types';
import { themeManager } from '../theme/greekTheme';
import { BoardRenderer } from './BoardRenderer';

export class PieceRenderer {
  constructor(private boardRenderer: BoardRenderer) {}

  /**
   * Render all pieces on the board
   */
  renderBoard(board: Board): void {
    // Clear all pieces first
    this.clearAllPieces();

    // Render each piece
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const position = new Position(row, col);
        const piece = board.getPiece(position);

        if (piece) {
          this.renderPiece(position, piece as Piece);
        }
      }
    }
  }

  /**
   * Render a single piece at a position
   */
  private renderPiece(position: Position, piece: Piece): void {
    const square = this.boardRenderer.getSquareElement(position);
    if (!square) return;

    // Create piece element
    const pieceElement = document.createElement('div');
    pieceElement.className = 'piece';
    pieceElement.classList.add(piece.color === Color.WHITE ? 'white' : 'black');
    pieceElement.classList.add(this.getPieceTypeClass(piece.type));

    // Set Unicode symbol
    pieceElement.textContent = themeManager.getPieceSymbol(piece);

    // Create Greek god name label
    const nameElement = document.createElement('div');
    nameElement.className = 'piece-name';
    nameElement.textContent = themeManager.getPieceName(piece);

    // Add to square
    square.appendChild(pieceElement);
    square.appendChild(nameElement);
  }

  /**
   * Clear all pieces from the board
   */
  private clearAllPieces(): void {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const position = new Position(row, col);
        const square = this.boardRenderer.getSquareElement(position);
        if (square) {
          square.innerHTML = '';
        }
      }
    }
  }

  /**
   * Get CSS class name for piece type
   */
  private getPieceTypeClass(type: PieceType): string {
    return type.toLowerCase();
  }

  /**
   * Update captured pieces display
   */
  renderCapturedPieces(capturedWhite: Piece[], capturedBlack: Piece[]): void {
    // Render pieces captured by white (black pieces)
    const whiteCapturedElement = document.getElementById('captured-white');
    if (whiteCapturedElement) {
      whiteCapturedElement.innerHTML = '';
      for (const piece of capturedBlack) {
        const pieceEl = document.createElement('span');
        pieceEl.className = 'captured-piece';
        pieceEl.textContent = themeManager.getPieceSymbol(piece);
        pieceEl.title = themeManager.getPieceName(piece);
        whiteCapturedElement.appendChild(pieceEl);
      }
    }

    // Render pieces captured by black (white pieces)
    const blackCapturedElement = document.getElementById('captured-black');
    if (blackCapturedElement) {
      blackCapturedElement.innerHTML = '';
      for (const piece of capturedWhite) {
        const pieceEl = document.createElement('span');
        pieceEl.className = 'captured-piece';
        pieceEl.textContent = themeManager.getPieceSymbol(piece);
        pieceEl.title = themeManager.getPieceName(piece);
        blackCapturedElement.appendChild(pieceEl);
      }
    }
  }
}
