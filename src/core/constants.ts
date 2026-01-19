/**
 * Constants used throughout the chess game
 */

import { PieceType, Color } from './types';

// Board dimensions
export const BOARD_SIZE = 8;
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

/**
 * Initial piece setup for standard chess
 * Row 0 = rank 8 (black's back rank)
 * Row 7 = rank 1 (white's back rank)
 */
export const INITIAL_BOARD_SETUP: Array<{
  type: PieceType;
  color: Color;
  row: number;
  col: number;
}> = [
  // Black pieces (row 0 = rank 8)
  { type: PieceType.ROOK, color: Color.BLACK, row: 0, col: 0 },
  { type: PieceType.KNIGHT, color: Color.BLACK, row: 0, col: 1 },
  { type: PieceType.BISHOP, color: Color.BLACK, row: 0, col: 2 },
  { type: PieceType.QUEEN, color: Color.BLACK, row: 0, col: 3 },
  { type: PieceType.KING, color: Color.BLACK, row: 0, col: 4 },
  { type: PieceType.BISHOP, color: Color.BLACK, row: 0, col: 5 },
  { type: PieceType.KNIGHT, color: Color.BLACK, row: 0, col: 6 },
  { type: PieceType.ROOK, color: Color.BLACK, row: 0, col: 7 },

  // Black pawns (row 1 = rank 7)
  { type: PieceType.PAWN, color: Color.BLACK, row: 1, col: 0 },
  { type: PieceType.PAWN, color: Color.BLACK, row: 1, col: 1 },
  { type: PieceType.PAWN, color: Color.BLACK, row: 1, col: 2 },
  { type: PieceType.PAWN, color: Color.BLACK, row: 1, col: 3 },
  { type: PieceType.PAWN, color: Color.BLACK, row: 1, col: 4 },
  { type: PieceType.PAWN, color: Color.BLACK, row: 1, col: 5 },
  { type: PieceType.PAWN, color: Color.BLACK, row: 1, col: 6 },
  { type: PieceType.PAWN, color: Color.BLACK, row: 1, col: 7 },

  // White pawns (row 6 = rank 2)
  { type: PieceType.PAWN, color: Color.WHITE, row: 6, col: 0 },
  { type: PieceType.PAWN, color: Color.WHITE, row: 6, col: 1 },
  { type: PieceType.PAWN, color: Color.WHITE, row: 6, col: 2 },
  { type: PieceType.PAWN, color: Color.WHITE, row: 6, col: 3 },
  { type: PieceType.PAWN, color: Color.WHITE, row: 6, col: 4 },
  { type: PieceType.PAWN, color: Color.WHITE, row: 6, col: 5 },
  { type: PieceType.PAWN, color: Color.WHITE, row: 6, col: 6 },
  { type: PieceType.PAWN, color: Color.WHITE, row: 6, col: 7 },

  // White pieces (row 7 = rank 1)
  { type: PieceType.ROOK, color: Color.WHITE, row: 7, col: 0 },
  { type: PieceType.KNIGHT, color: Color.WHITE, row: 7, col: 1 },
  { type: PieceType.BISHOP, color: Color.WHITE, row: 7, col: 2 },
  { type: PieceType.QUEEN, color: Color.WHITE, row: 7, col: 3 },
  { type: PieceType.KING, color: Color.WHITE, row: 7, col: 4 },
  { type: PieceType.BISHOP, color: Color.WHITE, row: 7, col: 5 },
  { type: PieceType.KNIGHT, color: Color.WHITE, row: 7, col: 6 },
  { type: PieceType.ROOK, color: Color.WHITE, row: 7, col: 7 },
];

/**
 * Direction vectors for piece movement
 * Used by move generation algorithms
 */
export const DIRECTIONS = {
  // Rook directions (straight lines)
  ROOK: [
    { row: -1, col: 0 }, // Up
    { row: 1, col: 0 },  // Down
    { row: 0, col: -1 }, // Left
    { row: 0, col: 1 },  // Right
  ],

  // Bishop directions (diagonals)
  BISHOP: [
    { row: -1, col: -1 }, // Up-left
    { row: -1, col: 1 },  // Up-right
    { row: 1, col: -1 },  // Down-left
    { row: 1, col: 1 },   // Down-right
  ],

  // Knight directions (L-shapes)
  KNIGHT: [
    { row: -2, col: -1 },
    { row: -2, col: 1 },
    { row: -1, col: -2 },
    { row: -1, col: 2 },
    { row: 1, col: -2 },
    { row: 1, col: 2 },
    { row: 2, col: -1 },
    { row: 2, col: 1 },
  ],

  // King/Queen use combination of ROOK and BISHOP directions
  KING: [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                        { row: 0, col: 1 },
    { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 },
  ],
} as const;

/**
 * Piece values for evaluation (standard chess values)
 */
export const PIECE_VALUES = {
  [PieceType.PAWN]: 1,
  [PieceType.KNIGHT]: 3,
  [PieceType.BISHOP]: 3,
  [PieceType.ROOK]: 5,
  [PieceType.QUEEN]: 9,
  [PieceType.KING]: 0, // King is invaluable
} as const;
