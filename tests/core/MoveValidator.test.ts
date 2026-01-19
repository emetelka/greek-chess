/**
 * Tests for the MoveValidator class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../../src/core/Board';
import { Piece } from '../../src/core/Piece';
import { MoveValidator } from '../../src/core/MoveValidator';
import { Position, PieceType, Color, Move, MoveType } from '../../src/core/types';

describe('MoveValidator', () => {
  let board: Board;
  let validator: MoveValidator;

  beforeEach(() => {
    board = new Board();
    validator = new MoveValidator(board);
  });

  describe('Check detection', () => {
    it('should detect check from a rook', () => {
      board.clear();

      // Place white king and black rook on same file
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(0, 4), new Piece(PieceType.ROOK, Color.BLACK));

      expect(validator.isKingInCheck(board, Color.WHITE)).toBe(true);
    });

    it('should detect check from a bishop', () => {
      board.clear();

      // Place white king and black bishop on same diagonal
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(0, 0), new Piece(PieceType.BISHOP, Color.BLACK));

      expect(validator.isKingInCheck(board, Color.WHITE)).toBe(true);
    });

    it('should detect check from a knight', () => {
      board.clear();

      // Place white king and black knight in L-shape position
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(2, 3), new Piece(PieceType.KNIGHT, Color.BLACK));

      expect(validator.isKingInCheck(board, Color.WHITE)).toBe(true);
    });

    it('should detect check from a queen', () => {
      board.clear();

      // Place white king and black queen on same rank
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(4, 0), new Piece(PieceType.QUEEN, Color.BLACK));

      expect(validator.isKingInCheck(board, Color.WHITE)).toBe(true);
    });

    it('should detect check from a pawn', () => {
      board.clear();

      // Place white king and black pawn in diagonal capture position
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(3, 3), new Piece(PieceType.PAWN, Color.BLACK));

      expect(validator.isKingInCheck(board, Color.WHITE)).toBe(true);
    });

    it('should not detect check when path is blocked', () => {
      board.clear();

      // Place white king and black rook on same file with blocker
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(0, 4), new Piece(PieceType.ROOK, Color.BLACK));
      board.setPiece(new Position(2, 4), new Piece(PieceType.PAWN, Color.WHITE)); // Blocker

      expect(validator.isKingInCheck(board, Color.WHITE)).toBe(false);
    });

    it('should not detect check when king is safe', () => {
      board.clear();

      // Place pieces but king is not in check
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(0, 0), new Piece(PieceType.ROOK, Color.BLACK));

      expect(validator.isKingInCheck(board, Color.WHITE)).toBe(false);
    });
  });

  describe('Legal move validation', () => {
    it('should allow legal moves', () => {
      const from = new Position(6, 4); // e2
      const to = new Position(4, 4); // e4
      const piece = board.getPiece(from) as Piece;

      expect(validator.isLegalMove(from, to, piece)).toBe(true);
    });

    it('should reject moves that leave king in check', () => {
      board.clear();

      // Setup: White king, white rook (pinned), black rook
      const kingPos = new Position(4, 4); // e4
      const whiteRookPos = new Position(4, 3); // d4
      const blackRookPos = new Position(4, 0); // a4

      board.setPiece(kingPos, new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(whiteRookPos, new Piece(PieceType.ROOK, Color.WHITE));
      board.setPiece(blackRookPos, new Piece(PieceType.ROOK, Color.BLACK));

      // Try to move the white rook (which is pinned)
      const piece = board.getPiece(whiteRookPos) as Piece;
      const illegalMove = new Position(3, 3); // c5 (diagonal move)

      expect(validator.isLegalMove(whiteRookPos, illegalMove, piece)).toBe(false);
    });

    it('should allow moves that block check', () => {
      board.clear();

      // Setup: White king in check by black rook, white rook can block
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE)); // e4
      board.setPiece(new Position(0, 4), new Piece(PieceType.ROOK, Color.BLACK)); // e8 (checking)
      board.setPiece(new Position(2, 0), new Piece(PieceType.ROOK, Color.WHITE)); // a6

      // Move white rook to block on e-file
      const piece = board.getPiece(new Position(2, 0)) as Piece;
      expect(validator.isLegalMove(new Position(2, 0), new Position(2, 4), piece)).toBe(true);
    });

    it('should allow king to move out of check', () => {
      board.clear();

      // Setup: White king in check by black rook
      const kingPos = new Position(4, 4); // e4
      board.setPiece(kingPos, new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(0, 4), new Piece(PieceType.ROOK, Color.BLACK));

      // King can move to safety
      const king = board.getPiece(kingPos) as Piece;
      expect(validator.isLegalMove(kingPos, new Position(4, 3), king)).toBe(true);
    });

    it('should reject king moves into check', () => {
      board.clear();

      // Setup: White king, black rook
      const kingPos = new Position(4, 4); // e4
      board.setPiece(kingPos, new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(0, 3), new Piece(PieceType.ROOK, Color.BLACK)); // On d-file

      // Try to move king to d-file (into check)
      const king = board.getPiece(kingPos) as Piece;
      expect(validator.isLegalMove(kingPos, new Position(4, 3), king)).toBe(false);
    });
  });

  describe('Castling', () => {
    beforeEach(() => {
      board.clear();
    });

    it('should allow kingside castling when conditions are met', () => {
      // Setup: White king and rook in starting positions, squares between clear
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, false));
      board.setPiece(new Position(7, 7), new Piece(PieceType.ROOK, Color.WHITE, false));

      expect(validator.canCastle(Color.WHITE, 'kingside')).toBe(true);
    });

    it('should allow queenside castling when conditions are met', () => {
      // Setup: White king and rook in starting positions, squares between clear
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, false));
      board.setPiece(new Position(7, 0), new Piece(PieceType.ROOK, Color.WHITE, false));

      expect(validator.canCastle(Color.WHITE, 'queenside')).toBe(true);
    });

    it('should not allow castling if king has moved', () => {
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, true)); // hasMoved = true
      board.setPiece(new Position(7, 7), new Piece(PieceType.ROOK, Color.WHITE, false));

      expect(validator.canCastle(Color.WHITE, 'kingside')).toBe(false);
    });

    it('should not allow castling if rook has moved', () => {
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, false));
      board.setPiece(new Position(7, 7), new Piece(PieceType.ROOK, Color.WHITE, true)); // hasMoved = true

      expect(validator.canCastle(Color.WHITE, 'kingside')).toBe(false);
    });

    it('should not allow castling if squares between are occupied', () => {
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, false));
      board.setPiece(new Position(7, 7), new Piece(PieceType.ROOK, Color.WHITE, false));
      board.setPiece(new Position(7, 6), new Piece(PieceType.KNIGHT, Color.WHITE)); // Blocker

      expect(validator.canCastle(Color.WHITE, 'kingside')).toBe(false);
    });

    it('should not allow castling when king is in check', () => {
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, false));
      board.setPiece(new Position(7, 7), new Piece(PieceType.ROOK, Color.WHITE, false));
      board.setPiece(new Position(0, 4), new Piece(PieceType.ROOK, Color.BLACK)); // Checking king

      expect(validator.canCastle(Color.WHITE, 'kingside')).toBe(false);
    });

    it('should not allow castling through check', () => {
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, false));
      board.setPiece(new Position(7, 7), new Piece(PieceType.ROOK, Color.WHITE, false));
      board.setPiece(new Position(0, 5), new Piece(PieceType.ROOK, Color.BLACK)); // Attacking f1

      expect(validator.canCastle(Color.WHITE, 'kingside')).toBe(false);
    });

    it('should not allow castling into check', () => {
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, false));
      board.setPiece(new Position(7, 7), new Piece(PieceType.ROOK, Color.WHITE, false));
      board.setPiece(new Position(0, 6), new Piece(PieceType.ROOK, Color.BLACK)); // Attacking g1

      expect(validator.canCastle(Color.WHITE, 'kingside')).toBe(false);
    });

    it('should allow black to castle', () => {
      board.setPiece(new Position(0, 4), new Piece(PieceType.KING, Color.BLACK, false));
      board.setPiece(new Position(0, 7), new Piece(PieceType.ROOK, Color.BLACK, false));

      expect(validator.canCastle(Color.BLACK, 'kingside')).toBe(true);
    });
  });

  describe('En passant', () => {
    it('should allow en passant capture', () => {
      board.clear();

      // Setup: White pawn on 5th rank, black pawn just moved two squares
      const whitePawnPos = new Position(3, 4); // e5
      const blackPawnPos = new Position(3, 5); // f5

      board.setPiece(whitePawnPos, new Piece(PieceType.PAWN, Color.WHITE));
      board.setPiece(blackPawnPos, new Piece(PieceType.PAWN, Color.BLACK, true));

      // Create last move: black pawn moved from f7 to f5
      const lastMove: Move = {
        from: new Position(1, 5),
        to: new Position(3, 5),
        piece: new Piece(PieceType.PAWN, Color.BLACK),
        moveType: MoveType.NORMAL,
        timestamp: Date.now(),
        notation: 'f5',
      };

      const whitePawn = board.getPiece(whitePawnPos) as Piece;
      const enPassantTarget = new Position(2, 5); // f6

      expect(validator.canEnPassant(whitePawnPos, enPassantTarget, Color.WHITE, lastMove)).toBe(
        true
      );
    });

    it('should not allow en passant if last move was not a pawn', () => {
      board.clear();

      const whitePawnPos = new Position(3, 4); // e5
      board.setPiece(whitePawnPos, new Piece(PieceType.PAWN, Color.WHITE));

      const lastMove: Move = {
        from: new Position(1, 5),
        to: new Position(3, 5),
        piece: new Piece(PieceType.KNIGHT, Color.BLACK), // Not a pawn
        moveType: MoveType.NORMAL,
        timestamp: Date.now(),
        notation: 'Nf5',
      };

      const enPassantTarget = new Position(2, 5);
      expect(validator.canEnPassant(whitePawnPos, enPassantTarget, Color.WHITE, lastMove)).toBe(
        false
      );
    });

    it('should not allow en passant if pawn did not move two squares', () => {
      board.clear();

      const whitePawnPos = new Position(3, 4); // e5
      const blackPawnPos = new Position(3, 5); // f5

      board.setPiece(whitePawnPos, new Piece(PieceType.PAWN, Color.WHITE));
      board.setPiece(blackPawnPos, new Piece(PieceType.PAWN, Color.BLACK));

      // Last move: black pawn moved only one square
      const lastMove: Move = {
        from: new Position(2, 5), // f6
        to: new Position(3, 5), // f5
        piece: new Piece(PieceType.PAWN, Color.BLACK),
        moveType: MoveType.NORMAL,
        timestamp: Date.now(),
        notation: 'f5',
      };

      const enPassantTarget = new Position(2, 5);
      expect(validator.canEnPassant(whitePawnPos, enPassantTarget, Color.WHITE, lastMove)).toBe(
        false
      );
    });
  });

  describe('Checkmate and stalemate', () => {
    it('should detect checkmate', () => {
      board.clear();

      // Back rank mate: White king trapped on h1 by own pawns
      board.setPiece(new Position(7, 7), new Piece(PieceType.KING, Color.WHITE)); // h1
      board.setPiece(new Position(6, 6), new Piece(PieceType.PAWN, Color.WHITE)); // g2
      board.setPiece(new Position(6, 7), new Piece(PieceType.PAWN, Color.WHITE)); // h2
      board.setPiece(new Position(7, 0), new Piece(PieceType.ROOK, Color.BLACK)); // a1 (giving check on rank 1)
      board.setPiece(new Position(6, 0), new Piece(PieceType.ROOK, Color.BLACK)); // a2 (supporting/cutting off g1)

      expect(validator.isCheckmate(Color.WHITE)).toBe(true);
    });

    it('should not detect checkmate when king can escape', () => {
      board.clear();

      // White king in check but can move
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(0, 4), new Piece(PieceType.ROOK, Color.BLACK));

      expect(validator.isCheckmate(Color.WHITE)).toBe(false);
    });

    it('should not detect checkmate when piece can block', () => {
      board.clear();

      // White king in check but rook can block
      board.setPiece(new Position(4, 4), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(0, 4), new Piece(PieceType.ROOK, Color.BLACK));
      board.setPiece(new Position(4, 0), new Piece(PieceType.ROOK, Color.WHITE));

      expect(validator.isCheckmate(Color.WHITE)).toBe(false);
    });

    it('should detect stalemate', () => {
      board.clear();

      // King on corner with no legal moves, not in check
      board.setPiece(new Position(0, 0), new Piece(PieceType.KING, Color.WHITE)); // a8
      board.setPiece(new Position(1, 2), new Piece(PieceType.QUEEN, Color.BLACK)); // c7
      board.setPiece(new Position(2, 1), new Piece(PieceType.KING, Color.BLACK)); // b6

      expect(validator.isStalemate(Color.WHITE)).toBe(true);
    });

    it('should not detect stalemate when moves are available', () => {
      // Standard starting position
      expect(validator.isStalemate(Color.WHITE)).toBe(false);
    });

    it('should not detect stalemate when in check', () => {
      board.clear();

      // King in check (checkmate, not stalemate)
      board.setPiece(new Position(7, 6), new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(new Position(6, 5), new Piece(PieceType.PAWN, Color.WHITE));
      board.setPiece(new Position(6, 6), new Piece(PieceType.PAWN, Color.WHITE));
      board.setPiece(new Position(6, 7), new Piece(PieceType.PAWN, Color.WHITE));
      board.setPiece(new Position(0, 6), new Piece(PieceType.ROOK, Color.BLACK));
      board.setPiece(new Position(1, 6), new Piece(PieceType.ROOK, Color.BLACK));

      expect(validator.isStalemate(Color.WHITE)).toBe(false);
    });
  });

  describe('Legal moves generation', () => {
    it('should only return legal moves', () => {
      board.clear();

      // Setup: White king, white rook (pinned), black rook
      const kingPos = new Position(4, 4);
      const whiteRookPos = new Position(4, 3);
      const blackRookPos = new Position(4, 0);

      board.setPiece(kingPos, new Piece(PieceType.KING, Color.WHITE));
      board.setPiece(whiteRookPos, new Piece(PieceType.ROOK, Color.WHITE));
      board.setPiece(blackRookPos, new Piece(PieceType.ROOK, Color.BLACK));

      // Pinned rook can only move along the pin line
      const piece = board.getPiece(whiteRookPos) as Piece;
      const legalMoves = validator.getLegalMoves(whiteRookPos, piece);

      // Should only be able to move horizontally (blocking/capturing)
      expect(legalMoves.length).toBeGreaterThan(0);
      expect(legalMoves.every((move) => move.row === 4)).toBe(true); // All on same rank
    });

    it('should include castling in legal moves', () => {
      board.clear();

      // Setup for castling
      board.setPiece(new Position(7, 4), new Piece(PieceType.KING, Color.WHITE, false));
      board.setPiece(new Position(7, 7), new Piece(PieceType.ROOK, Color.WHITE, false));

      const king = board.getPiece(new Position(7, 4)) as Piece;
      const legalMoves = validator.getLegalMoves(new Position(7, 4), king);

      // Should include kingside castling (g1)
      expect(legalMoves.some((move) => move.row === 7 && move.col === 6)).toBe(true);
    });
  });
});
