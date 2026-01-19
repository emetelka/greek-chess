/**
 * Piece class representing a chess piece
 */

import { PieceType, Color, Piece as IPiece } from './types';

export class Piece implements IPiece {
  constructor(
    public readonly type: PieceType,
    public readonly color: Color,
    public hasMoved: boolean = false
  ) {}

  /**
   * Create a deep copy of this piece
   * Used for board simulation during move validation
   */
  clone(): Piece {
    return new Piece(this.type, this.color, this.hasMoved);
  }

  /**
   * Check if this piece is the same type and color as another
   */
  equals(other: Piece): boolean {
    return this.type === other.type && this.color === other.color;
  }

  /**
   * Get string representation for debugging
   */
  toString(): string {
    const colorStr = this.color === Color.WHITE ? 'White' : 'Black';
    return `${colorStr} ${this.type}${this.hasMoved ? ' (moved)' : ''}`;
  }

  /**
   * Get a single character representation of the piece
   * Useful for text-based board display
   */
  toChar(): string {
    const chars: Record<PieceType, string> = {
      [PieceType.KING]: 'K',
      [PieceType.QUEEN]: 'Q',
      [PieceType.ROOK]: 'R',
      [PieceType.BISHOP]: 'B',
      [PieceType.KNIGHT]: 'N',
      [PieceType.PAWN]: 'P',
    };

    const char = chars[this.type];
    // Lowercase for black pieces, uppercase for white
    return this.color === Color.WHITE ? char : char.toLowerCase();
  }

  /**
   * Get Unicode chess symbol for this piece
   */
  toUnicode(): string {
    const symbols: Record<Color, Record<PieceType, string>> = {
      [Color.WHITE]: {
        [PieceType.KING]: '♔',
        [PieceType.QUEEN]: '♕',
        [PieceType.ROOK]: '♖',
        [PieceType.BISHOP]: '♗',
        [PieceType.KNIGHT]: '♘',
        [PieceType.PAWN]: '♙',
      },
      [Color.BLACK]: {
        [PieceType.KING]: '♚',
        [PieceType.QUEEN]: '♛',
        [PieceType.ROOK]: '♜',
        [PieceType.BISHOP]: '♝',
        [PieceType.KNIGHT]: '♞',
        [PieceType.PAWN]: '♟',
      },
    };

    return symbols[this.color][this.type];
  }
}
