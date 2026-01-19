/**
 * Tests for the MoveGenerator class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../../src/core/Board';
import { Piece } from '../../src/core/Piece';
import { MoveGenerator } from '../../src/core/MoveGenerator';
import { Position, PieceType, Color } from '../../src/core/types';

describe('MoveGenerator', () => {
  let board: Board;
  let generator: MoveGenerator;

  beforeEach(() => {
    board = new Board();
    generator = new MoveGenerator(board);
  });

  describe('Pawn moves', () => {
    it('should allow white pawn to move forward one square', () => {
      const from = new Position(6, 4); // e2
      const piece = board.getPiece(from) as Piece;

      const moves = generator.generateMoves(from, piece);
      const forward = new Position(5, 4); // e3

      expect(moves.some((m) => m.equals(forward))).toBe(true);
    });

    it('should allow white pawn to move two squares from starting position', () => {
      const from = new Position(6, 4); // e2
      const piece = board.getPiece(from) as Piece;

      const moves = generator.generateMoves(from, piece);
      const forwardTwo = new Position(4, 4); // e4

      expect(moves.some((m) => m.equals(forwardTwo))).toBe(true);
      expect(moves.length).toBe(2); // e3 and e4
    });

    it('should allow black pawn to move forward one square', () => {
      const from = new Position(1, 4); // e7
      const piece = board.getPiece(from) as Piece;

      const moves = generator.generateMoves(from, piece);
      const forward = new Position(2, 4); // e6

      expect(moves.some((m) => m.equals(forward))).toBe(true);
    });

    it('should not allow pawn to move forward if blocked', () => {
      // Place a piece in front of white pawn
      const pawnPos = new Position(6, 4); // e2
      const blockPos = new Position(5, 4); // e3
      board.setPiece(blockPos, new Piece(PieceType.KNIGHT, Color.BLACK));

      const piece = board.getPiece(pawnPos) as Piece;
      const moves = generator.generateMoves(pawnPos, piece);

      expect(moves.length).toBe(0); // No moves available
    });

    it('should not allow pawn to move two squares if first square is blocked', () => {
      const pawnPos = new Position(6, 4); // e2
      const blockPos = new Position(5, 4); // e3
      board.setPiece(blockPos, new Piece(PieceType.KNIGHT, Color.BLACK));

      const piece = board.getPiece(pawnPos) as Piece;
      const moves = generator.generateMoves(pawnPos, piece);

      expect(moves.length).toBe(0);
    });

    it('should not allow pawn to move two squares if not at starting position', () => {
      // Move pawn forward first
      board.movePiece(new Position(6, 4), new Position(5, 4));

      const piece = board.getPiece(new Position(5, 4)) as Piece;
      const moves = generator.generateMoves(new Position(5, 4), piece);

      expect(moves.length).toBe(1); // Only one square forward
    });

    it('should allow pawn to capture diagonally', () => {
      // Place enemy piece diagonally
      const pawnPos = new Position(6, 4); // e2
      const enemyPos = new Position(5, 5); // f3
      board.setPiece(enemyPos, new Piece(PieceType.PAWN, Color.BLACK));

      const piece = board.getPiece(pawnPos) as Piece;
      const moves = generator.generateMoves(pawnPos, piece);

      expect(moves.some((m) => m.equals(enemyPos))).toBe(true);
      expect(moves.length).toBe(3); // forward 1, forward 2, capture diagonal
    });

    it('should not allow pawn to capture own pieces', () => {
      const pawnPos = new Position(6, 4); // e2
      const allyPos = new Position(5, 5); // f3
      board.setPiece(allyPos, new Piece(PieceType.PAWN, Color.WHITE));

      const piece = board.getPiece(pawnPos) as Piece;
      const moves = generator.generateMoves(pawnPos, piece);

      expect(moves.some((m) => m.equals(allyPos))).toBe(false);
      expect(moves.length).toBe(2); // forward 1, forward 2
    });
  });

  describe('Rook moves', () => {
    beforeEach(() => {
      // Clear board for easier testing
      board.clear();
    });

    it('should move horizontally and vertically', () => {
      const rookPos = new Position(4, 4); // e4
      const rook = new Piece(PieceType.ROOK, Color.WHITE);
      board.setPiece(rookPos, rook);

      const moves = generator.generateMoves(rookPos, rook);

      // Should have 14 moves total (7 horizontal + 7 vertical)
      expect(moves.length).toBe(14);

      // Check some specific moves
      expect(moves.some((m) => m.equals(new Position(4, 0)))).toBe(true); // a4
      expect(moves.some((m) => m.equals(new Position(4, 7)))).toBe(true); // h4
      expect(moves.some((m) => m.equals(new Position(0, 4)))).toBe(true); // e8
      expect(moves.some((m) => m.equals(new Position(7, 4)))).toBe(true); // e1
    });

    it('should be blocked by pieces', () => {
      const rookPos = new Position(4, 4); // e4
      const rook = new Piece(PieceType.ROOK, Color.WHITE);
      board.setPiece(rookPos, rook);

      // Block with own piece
      board.setPiece(new Position(4, 6), new Piece(PieceType.PAWN, Color.WHITE)); // g4

      const moves = generator.generateMoves(rookPos, rook);

      // Should not include g4 or h4
      expect(moves.some((m) => m.equals(new Position(4, 6)))).toBe(false);
      expect(moves.some((m) => m.equals(new Position(4, 7)))).toBe(false);
    });

    it('should capture enemy pieces but not move past them', () => {
      const rookPos = new Position(4, 4); // e4
      const rook = new Piece(PieceType.ROOK, Color.WHITE);
      board.setPiece(rookPos, rook);

      // Block with enemy piece
      const enemyPos = new Position(4, 6); // g4
      board.setPiece(enemyPos, new Piece(PieceType.PAWN, Color.BLACK));

      const moves = generator.generateMoves(rookPos, rook);

      // Should include g4 (capture) but not h4
      expect(moves.some((m) => m.equals(enemyPos))).toBe(true);
      expect(moves.some((m) => m.equals(new Position(4, 7)))).toBe(false);
    });
  });

  describe('Knight moves', () => {
    beforeEach(() => {
      board.clear();
    });

    it('should move in L-shapes', () => {
      const knightPos = new Position(4, 4); // e4
      const knight = new Piece(PieceType.KNIGHT, Color.WHITE);
      board.setPiece(knightPos, knight);

      const moves = generator.generateMoves(knightPos, knight);

      // Knight should have 8 possible moves from center
      expect(moves.length).toBe(8);

      // Check all 8 L-shape moves
      const expectedMoves = [
        new Position(2, 3), // d6
        new Position(2, 5), // f6
        new Position(3, 2), // c5
        new Position(3, 6), // g5
        new Position(5, 2), // c3
        new Position(5, 6), // g3
        new Position(6, 3), // d2
        new Position(6, 5), // f2
      ];

      for (const expected of expectedMoves) {
        expect(moves.some((m) => m.equals(expected))).toBe(true);
      }
    });

    it('should have fewer moves near edges', () => {
      const knightPos = new Position(0, 0); // a8 (corner)
      const knight = new Piece(PieceType.KNIGHT, Color.WHITE);
      board.setPiece(knightPos, knight);

      const moves = generator.generateMoves(knightPos, knight);

      // Only 2 moves from corner
      expect(moves.length).toBe(2);
    });

    it('should not be blocked by intervening pieces', () => {
      const knightPos = new Position(4, 4); // e4
      const knight = new Piece(PieceType.KNIGHT, Color.WHITE);
      board.setPiece(knightPos, knight);

      // Place pieces around knight (knights jump over)
      board.setPiece(new Position(3, 4), new Piece(PieceType.PAWN, Color.WHITE));
      board.setPiece(new Position(5, 4), new Piece(PieceType.PAWN, Color.WHITE));
      board.setPiece(new Position(4, 3), new Piece(PieceType.PAWN, Color.WHITE));
      board.setPiece(new Position(4, 5), new Piece(PieceType.PAWN, Color.WHITE));

      const moves = generator.generateMoves(knightPos, knight);

      // Should still have 8 moves
      expect(moves.length).toBe(8);
    });

    it('should capture enemy pieces', () => {
      const knightPos = new Position(4, 4); // e4
      const knight = new Piece(PieceType.KNIGHT, Color.WHITE);
      board.setPiece(knightPos, knight);

      const enemyPos = new Position(2, 3); // d6
      board.setPiece(enemyPos, new Piece(PieceType.PAWN, Color.BLACK));

      const moves = generator.generateMoves(knightPos, knight);

      expect(moves.some((m) => m.equals(enemyPos))).toBe(true);
    });

    it('should not capture own pieces', () => {
      const knightPos = new Position(4, 4); // e4
      const knight = new Piece(PieceType.KNIGHT, Color.WHITE);
      board.setPiece(knightPos, knight);

      const allyPos = new Position(2, 3); // d6
      board.setPiece(allyPos, new Piece(PieceType.PAWN, Color.WHITE));

      const moves = generator.generateMoves(knightPos, knight);

      expect(moves.some((m) => m.equals(allyPos))).toBe(false);
      expect(moves.length).toBe(7); // 8 - 1 blocked
    });
  });

  describe('Bishop moves', () => {
    beforeEach(() => {
      board.clear();
    });

    it('should move diagonally', () => {
      const bishopPos = new Position(4, 4); // e4
      const bishop = new Piece(PieceType.BISHOP, Color.WHITE);
      board.setPiece(bishopPos, bishop);

      const moves = generator.generateMoves(bishopPos, bishop);

      // Should have 13 moves (4 diagonals: 4+3+3+3)
      expect(moves.length).toBe(13);

      // Check diagonal moves
      expect(moves.some((m) => m.equals(new Position(0, 0)))).toBe(true); // a8
      expect(moves.some((m) => m.equals(new Position(7, 7)))).toBe(true); // h1
      expect(moves.some((m) => m.equals(new Position(1, 7)))).toBe(true); // h7
    });

    it('should be blocked by pieces', () => {
      const bishopPos = new Position(4, 4); // e4
      const bishop = new Piece(PieceType.BISHOP, Color.WHITE);
      board.setPiece(bishopPos, bishop);

      // Block with own piece
      board.setPiece(new Position(2, 2), new Piece(PieceType.PAWN, Color.WHITE)); // c6

      const moves = generator.generateMoves(bishopPos, bishop);

      // Should not include c6, b7, or a8 on that diagonal
      expect(moves.some((m) => m.equals(new Position(2, 2)))).toBe(false);
      expect(moves.some((m) => m.equals(new Position(1, 1)))).toBe(false);
      expect(moves.some((m) => m.equals(new Position(0, 0)))).toBe(false);
    });
  });

  describe('Queen moves', () => {
    beforeEach(() => {
      board.clear();
    });

    it('should move like rook + bishop', () => {
      const queenPos = new Position(4, 4); // e4
      const queen = new Piece(PieceType.QUEEN, Color.WHITE);
      board.setPiece(queenPos, queen);

      const moves = generator.generateMoves(queenPos, queen);

      // Should have 27 moves (14 rook + 13 bishop)
      expect(moves.length).toBe(27);

      // Check rook-like moves
      expect(moves.some((m) => m.equals(new Position(4, 0)))).toBe(true); // a4
      expect(moves.some((m) => m.equals(new Position(0, 4)))).toBe(true); // e8

      // Check bishop-like moves
      expect(moves.some((m) => m.equals(new Position(0, 0)))).toBe(true); // a8
      expect(moves.some((m) => m.equals(new Position(7, 7)))).toBe(true); // h1
    });
  });

  describe('King moves', () => {
    beforeEach(() => {
      board.clear();
    });

    it('should move one square in any direction', () => {
      const kingPos = new Position(4, 4); // e4
      const king = new Piece(PieceType.KING, Color.WHITE);
      board.setPiece(kingPos, king);

      const moves = generator.generateMoves(kingPos, king);

      // Should have 8 moves
      expect(moves.length).toBe(8);

      // Check all 8 directions
      const expectedMoves = [
        new Position(3, 3), // d5
        new Position(3, 4), // e5
        new Position(3, 5), // f5
        new Position(4, 3), // d4
        new Position(4, 5), // f4
        new Position(5, 3), // d3
        new Position(5, 4), // e3
        new Position(5, 5), // f3
      ];

      for (const expected of expectedMoves) {
        expect(moves.some((m) => m.equals(expected))).toBe(true);
      }
    });

    it('should have fewer moves near edges', () => {
      const kingPos = new Position(0, 0); // a8 (corner)
      const king = new Piece(PieceType.KING, Color.WHITE);
      board.setPiece(kingPos, king);

      const moves = generator.generateMoves(kingPos, king);

      // Only 3 moves from corner
      expect(moves.length).toBe(3);
    });

    it('should capture enemy pieces', () => {
      const kingPos = new Position(4, 4); // e4
      const king = new Piece(PieceType.KING, Color.WHITE);
      board.setPiece(kingPos, king);

      const enemyPos = new Position(3, 4); // e5
      board.setPiece(enemyPos, new Piece(PieceType.PAWN, Color.BLACK));

      const moves = generator.generateMoves(kingPos, king);

      expect(moves.some((m) => m.equals(enemyPos))).toBe(true);
    });

    it('should not capture own pieces', () => {
      const kingPos = new Position(4, 4); // e4
      const king = new Piece(PieceType.KING, Color.WHITE);
      board.setPiece(kingPos, king);

      const allyPos = new Position(3, 4); // e5
      board.setPiece(allyPos, new Piece(PieceType.PAWN, Color.WHITE));

      const moves = generator.generateMoves(kingPos, king);

      expect(moves.some((m) => m.equals(allyPos))).toBe(false);
      expect(moves.length).toBe(7); // 8 - 1 blocked
    });
  });

  describe('Helper methods', () => {
    it('should correctly check if piece can attack a square', () => {
      board.clear();
      const rookPos = new Position(4, 4); // e4
      const rook = new Piece(PieceType.ROOK, Color.WHITE);
      board.setPiece(rookPos, rook);

      const targetPos = new Position(4, 7); // h4
      expect(generator.canAttack(rookPos, targetPos, rook)).toBe(true);

      const nonTargetPos = new Position(5, 5); // f3 (diagonal, not reachable by rook)
      expect(generator.canAttack(rookPos, nonTargetPos, rook)).toBe(false);
    });

    it('should correctly check pseudo-legality', () => {
      const from = new Position(6, 4); // e2
      const to = new Position(4, 4); // e4
      const piece = board.getPiece(from) as Piece;

      expect(generator.isPseudoLegal(from, to, piece)).toBe(true);

      const invalidTo = new Position(4, 5); // f4
      expect(generator.isPseudoLegal(from, invalidTo, piece)).toBe(false);
    });
  });
});
