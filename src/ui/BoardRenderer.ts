/**
 * BoardRenderer creates and manages the DOM elements for the chess board
 */

import { Position } from '../core/types';
import { Board } from '../core/Board';

export class BoardRenderer {
  private boardElement: HTMLElement;
  private squares: HTMLElement[][] = [];

  constructor(boardElementId: string) {
    const element = document.getElementById(boardElementId);
    if (!element) {
      throw new Error(`Element with id '${boardElementId}' not found`);
    }
    this.boardElement = element;
  }

  /**
   * Initialize the board DOM structure
   */
  initialize(): void {
    this.boardElement.innerHTML = '';
    this.squares = [];

    // Create 64 squares (8x8)
    for (let row = 0; row < 8; row++) {
      this.squares[row] = [];
      for (let col = 0; col < 8; col++) {
        const square = this.createSquare(row, col);
        this.squares[row]![col] = square;
        this.boardElement.appendChild(square);
      }
    }
  }

  /**
   * Create a single square element
   */
  private createSquare(row: number, col: number): HTMLElement {
    const square = document.createElement('div');
    square.className = 'square';
    square.dataset.row = row.toString();
    square.dataset.col = col.toString();

    // Determine square color (alternating pattern)
    const isLight = (row + col) % 2 === 0;
    square.classList.add(isLight ? 'light' : 'dark');

    return square;
  }

  /**
   * Get square element at a position
   */
  getSquareElement(position: Position): HTMLElement | null {
    if (position.row < 0 || position.row > 7 || position.col < 0 || position.col > 7) {
      return null;
    }
    return this.squares[position.row]?.[position.col] || null;
  }

  /**
   * Clear all highlighting from the board
   */
  clearHighlights(): void {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = this.squares[row]?.[col];
        square?.classList.remove('selected', 'legal-move', 'last-move', 'in-check', 'has-piece');
      }
    }
  }

  /**
   * Highlight a square as selected
   */
  highlightSelected(position: Position): void {
    const square = this.getSquareElement(position);
    if (square) {
      square.classList.add('selected');
    }
  }

  /**
   * Highlight legal move squares
   */
  highlightLegalMoves(positions: Position[], board: Board): void {
    for (const position of positions) {
      const square = this.getSquareElement(position);
      if (square) {
        square.classList.add('legal-move');
        // Add has-piece class if there's a capturable piece
        if (!board.isEmpty(position)) {
          square.classList.add('has-piece');
        }
      }
    }
  }

  /**
   * Highlight the last move made
   */
  highlightLastMove(from: Position, to: Position): void {
    const fromSquare = this.getSquareElement(from);
    const toSquare = this.getSquareElement(to);

    if (fromSquare) {
      fromSquare.classList.add('last-move');
    }
    if (toSquare) {
      toSquare.classList.add('last-move');
    }
  }

  /**
   * Highlight a square where the king is in check
   */
  highlightCheck(position: Position): void {
    const square = this.getSquareElement(position);
    if (square) {
      square.classList.add('in-check');
    }
  }

  /**
   * Get position from a square element
   */
  getPositionFromElement(element: HTMLElement): Position | null {
    const row = element.dataset.row;
    const col = element.dataset.col;

    if (row === undefined || col === undefined) {
      return null;
    }

    return new Position(parseInt(row, 10), parseInt(col, 10));
  }

  /**
   * Add click handler to all squares
   */
  addClickHandler(handler: (position: Position) => void): void {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = this.squares[row]?.[col];
        square?.addEventListener('click', () => {
          handler(new Position(row, col));
        });
      }
    }
  }

  /**
   * Get the board element
   */
  getBoardElement(): HTMLElement {
    return this.boardElement;
  }
}
