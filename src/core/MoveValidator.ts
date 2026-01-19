/**
 * MoveValidator validates moves according to chess rules
 * Ensures moves don't leave the king in check and handles special moves
 */

import { Position, Color, PieceType, IBoard, Move } from './types';
import { Piece } from './Piece';
import { MoveGenerator } from './MoveGenerator';
import { Board } from './Board';
import { getBackRank, getPawnDirection, isPathClear } from '../utils/boardHelpers';

export class MoveValidator {
  private generator: MoveGenerator;

  constructor(private board: IBoard) {
    this.generator = new MoveGenerator(board);
  }

  /**
   * Check if a move is fully legal (pseudo-legal + doesn't leave king in check)
   */
  isLegalMove(from: Position, to: Position, piece: Piece, lastMove?: Move): boolean {
    // First check if move is pseudo-legal
    if (!this.generator.isPseudoLegal(from, to, piece)) {
      // Special case: check castling
      if (piece.type === PieceType.KING && !piece.hasMoved) {
        if (this.isCastlingMove(from, to, piece.color)) {
          return this.canCastle(piece.color, to.col > from.col ? 'kingside' : 'queenside');
        }
      }

      // Special case: check en passant
      if (piece.type === PieceType.PAWN && lastMove) {
        if (this.isEnPassantMove(from, to, piece.color, lastMove)) {
          return this.canEnPassant(from, to, piece.color, lastMove);
        }
      }

      return false;
    }

    // Simulate the move on a cloned board
    const clonedBoard = this.board.clone();
    clonedBoard.movePiece(from, to);

    // Check if this move leaves our king in check
    return !this.isKingInCheck(clonedBoard, piece.color);
  }

  /**
   * Check if a king of a given color is in check
   */
  isKingInCheck(board: IBoard, color: Color): boolean {
    // Find the king
    const kingPos = board.findPiece(PieceType.KING, color);
    if (!kingPos) {
      // No king found (shouldn't happen in a valid game)
      return false;
    }

    // Check if any opponent piece can attack the king
    const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;
    const opponentPieces = board.getPiecesOfColor(opponentColor);

    for (const { piece, position } of opponentPieces) {
      const generator = new MoveGenerator(board);
      if (generator.canAttack(position, kingPos, piece as Piece)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all legal moves for a piece at a position
   */
  getLegalMoves(position: Position, piece: Piece, lastMove?: Move): Position[] {
    const pseudoLegalMoves = this.generator.generateMoves(position, piece);
    const legalMoves: Position[] = [];

    for (const move of pseudoLegalMoves) {
      if (this.isLegalMove(position, move, piece, lastMove)) {
        legalMoves.push(move);
      }
    }

    // Add castling moves if applicable
    if (piece.type === PieceType.KING && !piece.hasMoved) {
      const backRank = getBackRank(piece.color);

      // Kingside castling (move king 2 squares right)
      if (this.canCastle(piece.color, 'kingside')) {
        legalMoves.push(new Position(backRank, 6)); // g1 for white, g8 for black
      }

      // Queenside castling (move king 2 squares left)
      if (this.canCastle(piece.color, 'queenside')) {
        legalMoves.push(new Position(backRank, 2)); // c1 for white, c8 for black
      }
    }

    // Add en passant if applicable
    if (piece.type === PieceType.PAWN && lastMove) {
      const direction = getPawnDirection(piece.color);
      const enPassantSquares = [
        new Position(position.row + direction, position.col - 1),
        new Position(position.row + direction, position.col + 1),
      ];

      for (const square of enPassantSquares) {
        if (this.canEnPassant(position, square, piece.color, lastMove)) {
          legalMoves.push(square);
        }
      }
    }

    return legalMoves;
  }

  /**
   * Check if castling is possible
   */
  canCastle(color: Color, side: 'kingside' | 'queenside'): boolean {
    const backRank = getBackRank(color);
    const kingCol = 4; // e-file
    const kingPos = new Position(backRank, kingCol);
    const king = this.board.getPiece(kingPos);

    // King must exist and not have moved
    if (!king || king.type !== PieceType.KING || king.hasMoved) {
      return false;
    }

    // Determine rook position based on side
    const rookCol = side === 'kingside' ? 7 : 0; // h-file or a-file
    const rookPos = new Position(backRank, rookCol);
    const rook = this.board.getPiece(rookPos);

    // Rook must exist and not have moved
    if (!rook || rook.type !== PieceType.ROOK || rook.hasMoved) {
      return false;
    }

    // Check if squares between king and rook are empty
    const squaresBetween =
      side === 'kingside'
        ? [new Position(backRank, 5), new Position(backRank, 6)] // f and g
        : [new Position(backRank, 1), new Position(backRank, 2), new Position(backRank, 3)]; // b, c, d

    for (const square of squaresBetween) {
      if (!this.board.isEmpty(square)) {
        return false;
      }
    }

    // King must not be in check
    if (this.isKingInCheck(this.board, color)) {
      return false;
    }

    // King must not pass through check
    const squaresKingPasses =
      side === 'kingside'
        ? [new Position(backRank, 5), new Position(backRank, 6)] // f and g
        : [new Position(backRank, 3), new Position(backRank, 2)]; // d and c

    for (const square of squaresKingPasses) {
      const clonedBoard = this.board.clone();
      clonedBoard.movePiece(kingPos, square);
      if (this.isKingInCheck(clonedBoard, color)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if castling move is being attempted
   */
  private isCastlingMove(from: Position, to: Position, color: Color): boolean {
    const backRank = getBackRank(color);
    return (
      from.row === backRank &&
      from.col === 4 && // King starting position
      to.row === backRank &&
      (to.col === 6 || to.col === 2) // Castling destination (g or c file)
    );
  }

  /**
   * Check if en passant is possible
   */
  canEnPassant(from: Position, to: Position, color: Color, lastMove: Move): boolean {
    // Last move must have been a pawn moving two squares
    if (lastMove.piece.type !== PieceType.PAWN) {
      return false;
    }

    const lastMoveDistance = Math.abs(lastMove.to.row - lastMove.from.row);
    if (lastMoveDistance !== 2) {
      return false;
    }

    // Our pawn must be on the correct rank (5th rank for white, 4th rank for black)
    const correctRank = color === Color.WHITE ? 3 : 4;
    if (from.row !== correctRank) {
      return false;
    }

    // Enemy pawn must be adjacent to our pawn
    if (lastMove.to.row !== from.row || Math.abs(lastMove.to.col - from.col) !== 1) {
      return false;
    }

    // The target square must be behind the enemy pawn
    const direction = getPawnDirection(color);
    const expectedToRow = from.row + direction;
    const expectedToCol = lastMove.to.col;

    if (to.row !== expectedToRow || to.col !== expectedToCol) {
      return false;
    }

    // Simulate the en passant capture
    const clonedBoard = this.board.clone();
    clonedBoard.movePiece(from, to);
    clonedBoard.setPiece(lastMove.to, null); // Remove the captured pawn

    // Make sure this doesn't leave our king in check
    return !this.isKingInCheck(clonedBoard, color);
  }

  /**
   * Check if an en passant move is being attempted
   */
  private isEnPassantMove(from: Position, to: Position, color: Color, lastMove: Move): boolean {
    // Check if we're moving diagonally to an empty square (classic en passant pattern)
    const direction = getPawnDirection(color);
    const isMovingDiagonally =
      to.row === from.row + direction && Math.abs(to.col - from.col) === 1;

    if (!isMovingDiagonally || !this.board.isEmpty(to)) {
      return false;
    }

    // Check if last move was a pawn double-move adjacent to us
    if (lastMove.piece.type !== PieceType.PAWN) {
      return false;
    }

    const lastMoveDistance = Math.abs(lastMove.to.row - lastMove.from.row);
    if (lastMoveDistance !== 2) {
      return false;
    }

    // Enemy pawn should be on the same row as our pawn
    return lastMove.to.row === from.row && Math.abs(lastMove.to.col - from.col) === 1;
  }

  /**
   * Check if a color has any legal moves
   * Used for checkmate and stalemate detection
   */
  hasAnyLegalMoves(color: Color, lastMove?: Move): boolean {
    const pieces = this.board.getPiecesOfColor(color);

    for (const { piece, position } of pieces) {
      const legalMoves = this.getLegalMoves(position, piece as Piece, lastMove);
      if (legalMoves.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if the current position is checkmate
   */
  isCheckmate(color: Color, lastMove?: Move): boolean {
    return this.isKingInCheck(this.board, color) && !this.hasAnyLegalMoves(color, lastMove);
  }

  /**
   * Check if the current position is stalemate
   */
  isStalemate(color: Color, lastMove?: Move): boolean {
    return !this.isKingInCheck(this.board, color) && !this.hasAnyLegalMoves(color, lastMove);
  }
}
