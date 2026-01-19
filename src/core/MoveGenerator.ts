/**
 * MoveGenerator generates pseudo-legal moves for each piece type
 * "Pseudo-legal" means the move follows the piece's movement rules,
 * but doesn't check if the move leaves the king in check
 * (that's handled by MoveValidator)
 */

import { Position, PieceType, Color, IBoard } from './types';
import { Piece } from './Piece';
import { DIRECTIONS } from './constants';
import {
  isValidPosition,
  getPawnDirection,
  getPawnStartRow,
} from '../utils/boardHelpers';

export class MoveGenerator {
  constructor(private board: IBoard) {}

  /**
   * Generate all pseudo-legal moves for a piece at a position
   */
  generateMoves(position: Position, piece: Piece): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return this.generatePawnMoves(position, piece.color);
      case PieceType.ROOK:
        return this.generateRookMoves(position, piece.color);
      case PieceType.KNIGHT:
        return this.generateKnightMoves(position, piece.color);
      case PieceType.BISHOP:
        return this.generateBishopMoves(position, piece.color);
      case PieceType.QUEEN:
        return this.generateQueenMoves(position, piece.color);
      case PieceType.KING:
        return this.generateKingMoves(position, piece.color);
      default:
        return [];
    }
  }

  /**
   * Generate moves for a pawn
   * Pawns are the most complex piece:
   * - Move forward one square (or two from starting position)
   * - Capture diagonally
   * - En passant capture
   * - Promotion
   */
  private generatePawnMoves(position: Position, color: Color): Position[] {
    const moves: Position[] = [];
    const direction = getPawnDirection(color);
    const startRow = getPawnStartRow(color);

    // Forward move (one square)
    const forwardOne = new Position(position.row + direction, position.col);
    if (isValidPosition(forwardOne.row, forwardOne.col) && this.board.isEmpty(forwardOne)) {
      moves.push(forwardOne);

      // Forward move (two squares from starting position)
      if (position.row === startRow) {
        const forwardTwo = new Position(position.row + direction * 2, position.col);
        if (isValidPosition(forwardTwo.row, forwardTwo.col) && this.board.isEmpty(forwardTwo)) {
          moves.push(forwardTwo);
        }
      }
    }

    // Diagonal captures
    const captureDirs = [
      { row: direction, col: -1 }, // Left diagonal
      { row: direction, col: 1 },  // Right diagonal
    ];

    for (const dir of captureDirs) {
      const targetRow = position.row + dir.row;
      const targetCol = position.col + dir.col;

      if (isValidPosition(targetRow, targetCol)) {
        const capturePos = new Position(targetRow, targetCol);
        const targetPiece = this.board.getPiece(capturePos);
        if (targetPiece && targetPiece.color !== color) {
          moves.push(capturePos);
        }
      }
    }

    // Note: En passant will be handled by MoveValidator since it requires game state

    return moves;
  }

  /**
   * Generate moves for a rook
   * Rooks move in straight lines (horizontal and vertical)
   */
  private generateRookMoves(position: Position, color: Color): Position[] {
    return this.generateSlidingMoves(position, color, DIRECTIONS.ROOK);
  }

  /**
   * Generate moves for a bishop
   * Bishops move diagonally
   */
  private generateBishopMoves(position: Position, color: Color): Position[] {
    return this.generateSlidingMoves(position, color, DIRECTIONS.BISHOP);
  }

  /**
   * Generate moves for a queen
   * Queens move like rooks + bishops (all directions)
   */
  private generateQueenMoves(position: Position, color: Color): Position[] {
    const rookMoves = this.generateSlidingMoves(position, color, DIRECTIONS.ROOK);
    const bishopMoves = this.generateSlidingMoves(position, color, DIRECTIONS.BISHOP);
    return [...rookMoves, ...bishopMoves];
  }

  /**
   * Generate moves for sliding pieces (rook, bishop, queen)
   * These pieces move in a direction until blocked by a piece or edge of board
   */
  private generateSlidingMoves(
    position: Position,
    color: Color,
    directions: ReadonlyArray<{ row: number; col: number }>
  ): Position[] {
    const moves: Position[] = [];

    for (const direction of directions) {
      let currentRow = position.row + direction.row;
      let currentCol = position.col + direction.col;

      // Keep moving in this direction until we hit something
      while (isValidPosition(currentRow, currentCol)) {
        const targetPos = new Position(currentRow, currentCol);
        const targetPiece = this.board.getPiece(targetPos);

        if (targetPiece === null) {
          // Empty square - can move here
          moves.push(targetPos);
        } else if (targetPiece.color !== color) {
          // Enemy piece - can capture but can't move past
          moves.push(targetPos);
          break;
        } else {
          // Own piece - can't move here or past
          break;
        }

        currentRow += direction.row;
        currentCol += direction.col;
      }
    }

    return moves;
  }

  /**
   * Generate moves for a knight
   * Knights move in an L-shape (2 squares in one direction, 1 in perpendicular)
   */
  private generateKnightMoves(position: Position, color: Color): Position[] {
    const moves: Position[] = [];

    for (const direction of DIRECTIONS.KNIGHT) {
      const targetRow = position.row + direction.row;
      const targetCol = position.col + direction.col;

      if (isValidPosition(targetRow, targetCol)) {
        const targetPos = new Position(targetRow, targetCol);
        const targetPiece = this.board.getPiece(targetPos);

        // Can move to empty square or capture enemy piece
        if (targetPiece === null || targetPiece.color !== color) {
          moves.push(targetPos);
        }
      }
    }

    return moves;
  }

  /**
   * Generate moves for a king
   * Kings move one square in any direction
   */
  private generateKingMoves(position: Position, color: Color): Position[] {
    const moves: Position[] = [];

    for (const direction of DIRECTIONS.KING) {
      const targetRow = position.row + direction.row;
      const targetCol = position.col + direction.col;

      if (isValidPosition(targetRow, targetCol)) {
        const targetPos = new Position(targetRow, targetCol);
        const targetPiece = this.board.getPiece(targetPos);

        // Can move to empty square or capture enemy piece
        if (targetPiece === null || targetPiece.color !== color) {
          moves.push(targetPos);
        }
      }
    }

    // Note: Castling will be handled by MoveValidator since it requires:
    // - King and rook haven't moved
    // - No pieces between them
    // - King not in check, doesn't pass through check

    return moves;
  }

  /**
   * Check if a piece can attack a specific square
   * This is similar to generateMoves but only checks if target is reachable
   * Used for check detection
   */
  canAttack(from: Position, to: Position, piece: Piece): boolean {
    const moves = this.generateMoves(from, piece);
    return moves.some((move) => move.equals(to));
  }

  /**
   * Get all squares that a piece is attacking (for check detection)
   */
  getAttackedSquares(position: Position, piece: Piece): Position[] {
    return this.generateMoves(position, piece);
  }

  /**
   * Check if a move is pseudo-legal for a piece
   */
  isPseudoLegal(from: Position, to: Position, piece: Piece): boolean {
    const moves = this.generateMoves(from, piece);
    return moves.some((move) => move.equals(to));
  }
}
