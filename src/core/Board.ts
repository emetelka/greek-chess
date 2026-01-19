/**
 * Board class representing the chess board state
 * Uses an 8x8 2D array to store pieces
 */

import { Position, Square, Color, PieceType, IBoard } from './types';
import { Piece } from './Piece';
import { BOARD_SIZE, INITIAL_BOARD_SETUP } from './constants';

export class Board implements IBoard {
  private squares: Square[][];

  constructor(squares?: Square[][]) {
    if (squares) {
      // Create board from provided squares (used for cloning)
      this.squares = squares;
    } else {
      // Initialize empty board with starting position
      this.squares = this.createEmptyBoard();
      this.setupInitialPosition();
    }
  }

  /**
   * Create an 8x8 array filled with nulls
   */
  private createEmptyBoard(): Square[][] {
    const board: Square[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      board[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        board[row][col] = null;
      }
    }
    return board;
  }

  /**
   * Set up the standard chess starting position
   */
  private setupInitialPosition(): void {
    for (const pieceSetup of INITIAL_BOARD_SETUP) {
      const piece = new Piece(pieceSetup.type, pieceSetup.color, false);
      const pos = new Position(pieceSetup.row, pieceSetup.col);
      this.setPiece(pos, piece);
    }
  }

  /**
   * Get the piece at a position, or null if empty
   */
  getPiece(pos: Position): Square {
    if (!this.isValidPosition(pos)) {
      return null;
    }
    return this.squares[pos.row][pos.col];
  }

  /**
   * Set a piece at a position (or null to clear)
   */
  setPiece(pos: Position, piece: Square): void {
    if (!this.isValidPosition(pos)) {
      throw new Error(`Invalid position: ${pos.toString()}`);
    }
    this.squares[pos.row][pos.col] = piece;
  }

  /**
   * Move a piece from one position to another
   * Does not validate if the move is legal - just performs the move
   */
  movePiece(from: Position, to: Position): void {
    if (!this.isValidPosition(from) || !this.isValidPosition(to)) {
      throw new Error(`Invalid move: ${from.toString()} to ${to.toString()}`);
    }

    const piece = this.getPiece(from);
    if (!piece) {
      throw new Error(`No piece at position: ${from.toString()}`);
    }

    // Mark piece as having moved (important for castling and pawn double-move)
    piece.hasMoved = true;

    // Move the piece
    this.setPiece(to, piece);
    this.setPiece(from, null);
  }

  /**
   * Check if a position is empty
   */
  isEmpty(pos: Position): boolean {
    return this.getPiece(pos) === null;
  }

  /**
   * Check if a position is valid (within board bounds)
   */
  isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
  }

  /**
   * Check if a position contains a piece of a specific color
   */
  hasPieceOfColor(pos: Position, color: Color): boolean {
    const piece = this.getPiece(pos);
    return piece !== null && piece.color === color;
  }

  /**
   * Find the position of a specific piece type and color
   * Useful for finding the king
   */
  findPiece(type: PieceType, color: Color): Position | null {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const pos = new Position(row, col);
        const piece = this.getPiece(pos);
        if (piece && piece.type === type && piece.color === color) {
          return pos;
        }
      }
    }
    return null;
  }

  /**
   * Get all pieces of a specific color
   */
  getPiecesOfColor(color: Color): Array<{ piece: Piece; position: Position }> {
    const pieces: Array<{ piece: Piece; position: Position }> = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const pos = new Position(row, col);
        const piece = this.getPiece(pos);
        if (piece && piece.color === color) {
          pieces.push({ piece: piece as Piece, position: pos });
        }
      }
    }

    return pieces;
  }

  /**
   * Create a deep copy of this board
   * Essential for move validation (simulating moves without affecting the real board)
   */
  clone(): Board {
    const newSquares: Square[][] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      newSquares[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = this.squares[row][col];
        newSquares[row][col] = piece ? piece.clone() : null;
      }
    }

    return new Board(newSquares);
  }

  /**
   * Get a text representation of the board (useful for debugging and testing)
   */
  toString(): string {
    let result = '  a b c d e f g h\n';

    for (let row = 0; row < BOARD_SIZE; row++) {
      const rank = 8 - row;
      result += `${rank} `;

      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = this.squares[row][col];
        if (piece) {
          result += (piece as Piece).toChar() + ' ';
        } else {
          result += '. ';
        }
      }

      result += `${rank}\n`;
    }

    result += '  a b c d e f g h\n';
    return result;
  }

  /**
   * Clear the entire board
   */
  clear(): void {
    this.squares = this.createEmptyBoard();
  }

  /**
   * Get all squares as a 2D array (for direct access in tests or UI)
   */
  getSquares(): Square[][] {
    return this.squares;
  }
}
