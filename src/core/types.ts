/**
 * Core type definitions for the Greek Chess game
 * This file serves as the contract for the entire system
 */

// Piece types in chess
export enum PieceType {
  PAWN = 'PAWN',
  ROOK = 'ROOK',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  QUEEN = 'QUEEN',
  KING = 'KING',
}

// Player colors
export enum Color {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

// Current state of the game
export enum GameStatus {
  ACTIVE = 'ACTIVE',
  CHECK = 'CHECK',
  CHECKMATE = 'CHECKMATE',
  STALEMATE = 'STALEMATE',
  DRAW = 'DRAW',
}

// Types of moves that can be made
export enum MoveType {
  NORMAL = 'NORMAL',
  CAPTURE = 'CAPTURE',
  CASTLE_KINGSIDE = 'CASTLE_KINGSIDE',
  CASTLE_QUEENSIDE = 'CASTLE_QUEENSIDE',
  EN_PASSANT = 'EN_PASSANT',
  PROMOTION = 'PROMOTION',
}

/**
 * Position on the chess board
 * Row 0 = rank 8 (black's back rank)
 * Row 7 = rank 1 (white's back rank)
 * Col 0 = a-file, Col 7 = h-file
 */
export class Position {
  constructor(
    public readonly row: number,
    public readonly col: number
  ) {
    if (row < 0 || row > 7 || col < 0 || col > 7) {
      throw new Error(`Invalid position: row=${row}, col=${col}`);
    }
  }

  /**
   * Convert position to algebraic notation (e.g., "e4")
   */
  toAlgebraic(): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rank = 8 - this.row; // Convert row to rank (8 to 1)
    const file = files[this.col];
    return `${file}${rank}`;
  }

  /**
   * Create Position from algebraic notation (e.g., "e4")
   */
  static fromAlgebraic(notation: string): Position {
    if (notation.length !== 2) {
      throw new Error(`Invalid algebraic notation: ${notation}`);
    }

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const file = notation[0]!.toLowerCase();
    const rank = parseInt(notation[1]!, 10);

    const col = files.indexOf(file);
    const row = 8 - rank; // Convert rank to row

    if (col === -1 || rank < 1 || rank > 8) {
      throw new Error(`Invalid algebraic notation: ${notation}`);
    }

    return new Position(row, col);
  }

  /**
   * Check if two positions are equal
   */
  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  /**
   * Create a copy of this position
   */
  clone(): Position {
    return new Position(this.row, this.col);
  }

  /**
   * Get string representation for debugging
   */
  toString(): string {
    return `Position(${this.toAlgebraic()}, row=${this.row}, col=${this.col})`;
  }
}

/**
 * A square on the board can either contain a Piece or be empty (null)
 * Piece type is imported from Piece.ts to avoid circular dependencies
 */
export type Square = Piece | null;

/**
 * Interface for Piece class (defined in Piece.ts)
 * This avoids circular dependency between types.ts and Piece.ts
 */
export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
  clone(): Piece;
  equals(other: Piece): boolean;
  toChar(): string;
  toUnicode(): string;
}

/**
 * Represents a move in the game
 */
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  moveType: MoveType;
  timestamp: number;
  notation: string; // Algebraic notation like "e4", "Nf3", "O-O"
  promotionPiece?: PieceType; // For pawn promotion
}

/**
 * Result of attempting to make a move
 */
export interface MoveResult {
  success: boolean;
  move?: Move;
  error?: string;
  newStatus?: GameStatus;
  capturedPiece?: Piece;
}

/**
 * Interface for Board class to avoid circular dependencies
 */
export interface IBoard {
  getPiece(pos: Position): Square;
  setPiece(pos: Position, piece: Square): void;
  movePiece(from: Position, to: Position): void;
  clone(): IBoard;
  isEmpty(pos: Position): boolean;
  isValidPosition(pos: Position): boolean;
  findPiece(type: PieceType, color: Color): Position | null;
  getPiecesOfColor(color: Color): Array<{ piece: Piece; position: Position }>;
}
