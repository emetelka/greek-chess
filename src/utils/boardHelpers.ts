/**
 * Utility functions for board operations and coordinate conversions
 */

import { Position, Color } from '../core/types';
import { BOARD_SIZE } from '../core/constants';

/**
 * Check if a position is within the board boundaries
 */
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Check if a Position object is valid
 */
export function isPositionValid(pos: Position): boolean {
  return isValidPosition(pos.row, pos.col);
}

/**
 * Get all positions between two positions (exclusive of endpoints)
 * Used for checking if path is clear for sliding pieces (rook, bishop, queen)
 */
export function getSquaresBetween(from: Position, to: Position): Position[] {
  const squares: Position[] = [];

  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  // Determine direction
  const rowStep = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
  const colStep = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;

  // Verify it's a straight line or diagonal
  if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
    // Not a valid rook/bishop/queen move
    return squares;
  }

  // Walk from 'from' to 'to', collecting intermediate squares
  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;

  while (currentRow !== to.row || currentCol !== to.col) {
    squares.push(new Position(currentRow, currentCol));
    currentRow += rowStep;
    currentCol += colStep;
  }

  return squares;
}

/**
 * Check if a path between two positions is clear (no pieces in between)
 * Used by sliding pieces (rook, bishop, queen)
 */
export function isPathClear(
  from: Position,
  to: Position,
  getPiece: (pos: Position) => any
): boolean {
  const squaresBetween = getSquaresBetween(from, to);
  return squaresBetween.every((pos) => getPiece(pos) === null);
}

/**
 * Get the opposite color
 */
export function getOppositeColor(color: Color): Color {
  return color === Color.WHITE ? Color.BLACK : Color.WHITE;
}

/**
 * Get forward direction for pawns based on color
 * White pawns move "up" (decreasing row), black pawns move "down" (increasing row)
 */
export function getPawnDirection(color: Color): number {
  return color === Color.WHITE ? -1 : 1;
}

/**
 * Get the starting row for pawns of a given color
 */
export function getPawnStartRow(color: Color): number {
  return color === Color.WHITE ? 6 : 1;
}

/**
 * Get the promotion row (rank) for pawns of a given color
 */
export function getPawnPromotionRow(color: Color): number {
  return color === Color.WHITE ? 0 : 7;
}

/**
 * Get the back rank for a given color (for castling)
 */
export function getBackRank(color: Color): number {
  return color === Color.WHITE ? 7 : 0;
}

/**
 * Calculate Manhattan distance between two positions
 */
export function getManhattanDistance(from: Position, to: Position): number {
  return Math.abs(to.row - from.row) + Math.abs(to.col - from.col);
}

/**
 * Calculate Chebyshev distance (maximum of row/col difference)
 * Useful for king movement (king can move one square in any direction)
 */
export function getChebyshevDistance(from: Position, to: Position): number {
  return Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));
}

/**
 * Check if two positions are on the same diagonal
 */
export function isOnSameDiagonal(from: Position, to: Position): boolean {
  return Math.abs(to.row - from.row) === Math.abs(to.col - from.col);
}

/**
 * Check if two positions are on the same file (column)
 */
export function isOnSameFile(from: Position, to: Position): boolean {
  return from.col === to.col;
}

/**
 * Check if two positions are on the same rank (row)
 */
export function isOnSameRank(from: Position, to: Position): boolean {
  return from.row === to.row;
}

/**
 * Check if two positions are on the same straight line (horizontal or vertical)
 */
export function isOnStraightLine(from: Position, to: Position): boolean {
  return isOnSameFile(from, to) || isOnSameRank(from, to);
}

/**
 * Convert file character to column number
 */
export function fileToCol(file: string): number {
  return file.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
}

/**
 * Convert column number to file character
 */
export function colToFile(col: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + col);
}

/**
 * Convert rank number to row
 */
export function rankToRow(rank: number): number {
  return 8 - rank;
}

/**
 * Convert row to rank number
 */
export function rowToRank(row: number): number {
  return 8 - row;
}
