/**
 * Tests for the Board class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../../src/core/Board';
import { Piece } from '../../src/core/Piece';
import { Position, PieceType, Color } from '../../src/core/types';

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  describe('Initialization', () => {
    it('should create an 8x8 board', () => {
      const squares = board.getSquares();
      expect(squares.length).toBe(8);
      expect(squares[0].length).toBe(8);
    });

    it('should set up initial position correctly', () => {
      // Check white pieces
      const whiteKing = board.getPiece(new Position(7, 4));
      expect(whiteKing).not.toBeNull();
      expect(whiteKing?.type).toBe(PieceType.KING);
      expect(whiteKing?.color).toBe(Color.WHITE);

      const whiteQueen = board.getPiece(new Position(7, 3));
      expect(whiteQueen).not.toBeNull();
      expect(whiteQueen?.type).toBe(PieceType.QUEEN);
      expect(whiteQueen?.color).toBe(Color.WHITE);

      // Check black pieces
      const blackKing = board.getPiece(new Position(0, 4));
      expect(blackKing).not.toBeNull();
      expect(blackKing?.type).toBe(PieceType.KING);
      expect(blackKing?.color).toBe(Color.BLACK);

      // Check pawns
      const whitePawn = board.getPiece(new Position(6, 0));
      expect(whitePawn).not.toBeNull();
      expect(whitePawn?.type).toBe(PieceType.PAWN);
      expect(whitePawn?.color).toBe(Color.WHITE);

      const blackPawn = board.getPiece(new Position(1, 0));
      expect(blackPawn).not.toBeNull();
      expect(blackPawn?.type).toBe(PieceType.PAWN);
      expect(blackPawn?.color).toBe(Color.BLACK);
    });

    it('should have empty squares in the middle of the board', () => {
      for (let row = 2; row <= 5; row++) {
        for (let col = 0; col < 8; col++) {
          const pos = new Position(row, col);
          expect(board.isEmpty(pos)).toBe(true);
        }
      }
    });

    it('should set all pieces as not having moved initially', () => {
      const whiteRook = board.getPiece(new Position(7, 0));
      expect(whiteRook?.hasMoved).toBe(false);

      const blackKing = board.getPiece(new Position(0, 4));
      expect(blackKing?.hasMoved).toBe(false);
    });
  });

  describe('Position validation', () => {
    it('should validate positions correctly', () => {
      expect(board.isValidPosition(new Position(0, 0))).toBe(true);
      expect(board.isValidPosition(new Position(7, 7))).toBe(true);
      expect(board.isValidPosition(new Position(3, 4))).toBe(true);
    });

    it('should reject invalid positions', () => {
      // Test positions outside bounds by creating them directly (bypassing Position validation)
      const invalidPos1 = { row: -1, col: 0 } as Position;
      const invalidPos2 = { row: 0, col: 8 } as Position;
      const invalidPos3 = { row: 8, col: 0 } as Position;

      expect(board.isValidPosition(invalidPos1)).toBe(false);
      expect(board.isValidPosition(invalidPos2)).toBe(false);
      expect(board.isValidPosition(invalidPos3)).toBe(false);
    });
  });

  describe('Getting and setting pieces', () => {
    it('should get pieces correctly', () => {
      const piece = board.getPiece(new Position(0, 0));
      expect(piece).not.toBeNull();
      expect(piece?.type).toBe(PieceType.ROOK);
      expect(piece?.color).toBe(Color.BLACK);
    });

    it('should return null for empty squares', () => {
      const piece = board.getPiece(new Position(4, 4));
      expect(piece).toBeNull();
    });

    it('should set pieces correctly', () => {
      const pos = new Position(4, 4);
      const newPiece = new Piece(PieceType.QUEEN, Color.WHITE);

      board.setPiece(pos, newPiece);
      const retrievedPiece = board.getPiece(pos);

      expect(retrievedPiece).not.toBeNull();
      expect(retrievedPiece?.type).toBe(PieceType.QUEEN);
      expect(retrievedPiece?.color).toBe(Color.WHITE);
    });

    it('should clear squares when setting null', () => {
      const pos = new Position(0, 0);
      expect(board.isEmpty(pos)).toBe(false);

      board.setPiece(pos, null);
      expect(board.isEmpty(pos)).toBe(true);
    });
  });

  describe('Moving pieces', () => {
    it('should move pieces correctly', () => {
      const from = new Position(6, 4); // White pawn at e2
      const to = new Position(4, 4);   // Move to e4

      const piece = board.getPiece(from);
      expect(piece).not.toBeNull();

      board.movePiece(from, to);

      expect(board.isEmpty(from)).toBe(true);
      expect(board.isEmpty(to)).toBe(false);

      const movedPiece = board.getPiece(to);
      expect(movedPiece?.type).toBe(PieceType.PAWN);
      expect(movedPiece?.color).toBe(Color.WHITE);
    });

    it('should mark pieces as moved after moving', () => {
      const from = new Position(7, 4); // White king
      const to = new Position(6, 4);

      const piece = board.getPiece(from);
      expect(piece?.hasMoved).toBe(false);

      board.movePiece(from, to);

      const movedPiece = board.getPiece(to);
      expect(movedPiece?.hasMoved).toBe(true);
    });

    it('should throw error when moving from empty square', () => {
      const from = new Position(4, 4); // Empty square
      const to = new Position(5, 5);

      expect(() => board.movePiece(from, to)).toThrow();
    });
  });

  describe('Finding pieces', () => {
    it('should find the white king', () => {
      const pos = board.findPiece(PieceType.KING, Color.WHITE);
      expect(pos).not.toBeNull();
      expect(pos?.row).toBe(7);
      expect(pos?.col).toBe(4);
    });

    it('should find the black queen', () => {
      const pos = board.findPiece(PieceType.QUEEN, Color.BLACK);
      expect(pos).not.toBeNull();
      expect(pos?.row).toBe(0);
      expect(pos?.col).toBe(3);
    });

    it('should return null for non-existent pieces', () => {
      // Remove a piece and try to find it
      board.setPiece(new Position(0, 4), null);
      const pos = board.findPiece(PieceType.KING, Color.BLACK);
      expect(pos).toBeNull();
    });
  });

  describe('Getting pieces of a color', () => {
    it('should get all white pieces', () => {
      const whitePieces = board.getPiecesOfColor(Color.WHITE);
      expect(whitePieces.length).toBe(16); // 16 white pieces initially
    });

    it('should get all black pieces', () => {
      const blackPieces = board.getPiecesOfColor(Color.BLACK);
      expect(blackPieces.length).toBe(16); // 16 black pieces initially
    });

    it('should return correct pieces after captures', () => {
      // Remove a white piece
      board.setPiece(new Position(6, 0), null);

      const whitePieces = board.getPiecesOfColor(Color.WHITE);
      expect(whitePieces.length).toBe(15);
    });
  });

  describe('Checking piece colors at positions', () => {
    it('should correctly identify piece colors', () => {
      const whitePos = new Position(7, 0);
      const blackPos = new Position(0, 0);

      expect(board.hasPieceOfColor(whitePos, Color.WHITE)).toBe(true);
      expect(board.hasPieceOfColor(whitePos, Color.BLACK)).toBe(false);
      expect(board.hasPieceOfColor(blackPos, Color.BLACK)).toBe(true);
      expect(board.hasPieceOfColor(blackPos, Color.WHITE)).toBe(false);
    });

    it('should return false for empty squares', () => {
      const emptyPos = new Position(4, 4);
      expect(board.hasPieceOfColor(emptyPos, Color.WHITE)).toBe(false);
      expect(board.hasPieceOfColor(emptyPos, Color.BLACK)).toBe(false);
    });
  });

  describe('Cloning', () => {
    it('should create an independent copy', () => {
      const clone = board.clone();

      // Modify the clone
      const pos = new Position(4, 4);
      const newPiece = new Piece(PieceType.QUEEN, Color.WHITE);
      clone.setPiece(pos, newPiece);

      // Original should be unchanged
      expect(board.isEmpty(pos)).toBe(true);
      expect(clone.isEmpty(pos)).toBe(false);
    });

    it('should deep clone pieces', () => {
      const from = new Position(6, 0);
      const to = new Position(5, 0);

      const clone = board.clone();

      // Move piece in clone
      clone.movePiece(from, to);

      // Original should be unchanged
      expect(board.isEmpty(from)).toBe(false);
      expect(board.isEmpty(to)).toBe(true);

      // Clone should have moved piece
      expect(clone.isEmpty(from)).toBe(true);
      expect(clone.isEmpty(to)).toBe(false);
    });
  });

  describe('Clearing the board', () => {
    it('should clear all pieces', () => {
      board.clear();

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const pos = new Position(row, col);
          expect(board.isEmpty(pos)).toBe(true);
        }
      }
    });
  });

  describe('toString', () => {
    it('should produce a text representation', () => {
      const str = board.toString();
      expect(str).toContain('a b c d e f g h');
      expect(str).toContain('8');
      expect(str).toContain('1');
      expect(str).toContain('r'); // Black rook
      expect(str).toContain('K'); // White king
    });
  });
});
