/**
 * Tests for the Greek theme
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager, GREEK_THEME, themeManager } from '../../src/theme/greekTheme';
import { Piece } from '../../src/core/Piece';
import { PieceType, Color } from '../../src/core/types';

describe('Greek Theme', () => {
  let theme: ThemeManager;

  beforeEach(() => {
    theme = new ThemeManager();
  });

  describe('GREEK_THEME constant', () => {
    it('should have mappings for all piece types', () => {
      expect(GREEK_THEME[PieceType.KING]).toBeDefined();
      expect(GREEK_THEME[PieceType.QUEEN]).toBeDefined();
      expect(GREEK_THEME[PieceType.ROOK]).toBeDefined();
      expect(GREEK_THEME[PieceType.BISHOP]).toBeDefined();
      expect(GREEK_THEME[PieceType.KNIGHT]).toBeDefined();
      expect(GREEK_THEME[PieceType.PAWN]).toBeDefined();
    });

    it('should have white and black variants for each piece', () => {
      for (const pieceType of Object.values(PieceType)) {
        expect(GREEK_THEME[pieceType].white).toBeDefined();
        expect(GREEK_THEME[pieceType].black).toBeDefined();
      }
    });

    it('should have required properties for each theme', () => {
      for (const pieceType of Object.values(PieceType)) {
        const whiteTheme = GREEK_THEME[pieceType].white;
        const blackTheme = GREEK_THEME[pieceType].black;

        expect(whiteTheme.name).toBeTruthy();
        expect(whiteTheme.symbol).toBeTruthy();
        expect(whiteTheme.description).toBeTruthy();

        expect(blackTheme.name).toBeTruthy();
        expect(blackTheme.symbol).toBeTruthy();
        expect(blackTheme.description).toBeTruthy();
      }
    });
  });

  describe('getPieceName', () => {
    it('should return Zeus for white king', () => {
      const piece = new Piece(PieceType.KING, Color.WHITE);
      expect(theme.getPieceName(piece)).toBe('Zeus');
    });

    it('should return Hades for black king', () => {
      const piece = new Piece(PieceType.KING, Color.BLACK);
      expect(theme.getPieceName(piece)).toBe('Hades');
    });

    it('should return Hera for white queen', () => {
      const piece = new Piece(PieceType.QUEEN, Color.WHITE);
      expect(theme.getPieceName(piece)).toBe('Hera');
    });

    it('should return Persephone for black queen', () => {
      const piece = new Piece(PieceType.QUEEN, Color.BLACK);
      expect(theme.getPieceName(piece)).toBe('Persephone');
    });

    it('should return Poseidon for white rook', () => {
      const piece = new Piece(PieceType.ROOK, Color.WHITE);
      expect(theme.getPieceName(piece)).toBe('Poseidon');
    });

    it('should return Ares for black rook', () => {
      const piece = new Piece(PieceType.ROOK, Color.BLACK);
      expect(theme.getPieceName(piece)).toBe('Ares');
    });

    it('should return Apollo for white bishop', () => {
      const piece = new Piece(PieceType.BISHOP, Color.WHITE);
      expect(theme.getPieceName(piece)).toBe('Apollo');
    });

    it('should return Artemis for black bishop', () => {
      const piece = new Piece(PieceType.BISHOP, Color.BLACK);
      expect(theme.getPieceName(piece)).toBe('Artemis');
    });

    it('should return Hermes for white knight', () => {
      const piece = new Piece(PieceType.KNIGHT, Color.WHITE);
      expect(theme.getPieceName(piece)).toBe('Hermes');
    });

    it('should return Athena for black knight', () => {
      const piece = new Piece(PieceType.KNIGHT, Color.BLACK);
      expect(theme.getPieceName(piece)).toBe('Athena');
    });

    it('should return Olympian for white pawn', () => {
      const piece = new Piece(PieceType.PAWN, Color.WHITE);
      expect(theme.getPieceName(piece)).toBe('Olympian');
    });

    it('should return Titan for black pawn', () => {
      const piece = new Piece(PieceType.PAWN, Color.BLACK);
      expect(theme.getPieceName(piece)).toBe('Titan');
    });
  });

  describe('getPieceSymbol', () => {
    it('should return Unicode symbols for all pieces', () => {
      const whiteKing = new Piece(PieceType.KING, Color.WHITE);
      const blackKing = new Piece(PieceType.KING, Color.BLACK);

      expect(theme.getPieceSymbol(whiteKing)).toBe('♔');
      expect(theme.getPieceSymbol(blackKing)).toBe('♚');
    });

    it('should return different symbols for white and black', () => {
      const whiteQueen = new Piece(PieceType.QUEEN, Color.WHITE);
      const blackQueen = new Piece(PieceType.QUEEN, Color.BLACK);

      const whiteSymbol = theme.getPieceSymbol(whiteQueen);
      const blackSymbol = theme.getPieceSymbol(blackQueen);

      expect(whiteSymbol).not.toBe(blackSymbol);
      expect(whiteSymbol).toBe('♕');
      expect(blackSymbol).toBe('♛');
    });
  });

  describe('getPieceDescription', () => {
    it('should return descriptions for all pieces', () => {
      const whiteKing = new Piece(PieceType.KING, Color.WHITE);
      const description = theme.getPieceDescription(whiteKing);

      expect(description).toContain('King of the Gods');
    });

    it('should return different descriptions for white and black', () => {
      const whiteKing = new Piece(PieceType.KING, Color.WHITE);
      const blackKing = new Piece(PieceType.KING, Color.BLACK);

      const whiteDesc = theme.getPieceDescription(whiteKing);
      const blackDesc = theme.getPieceDescription(blackKing);

      expect(whiteDesc).not.toBe(blackDesc);
    });
  });

  describe('getPieceRealm', () => {
    it('should return realm for pieces', () => {
      const whiteKing = new Piece(PieceType.KING, Color.WHITE);
      const realm = theme.getPieceRealm(whiteKing);

      expect(realm).toBeDefined();
      expect(realm).toContain('Thunder');
    });

    it('should return different realms for different pieces', () => {
      const whiteKing = new Piece(PieceType.KING, Color.WHITE);
      const whiteRook = new Piece(PieceType.ROOK, Color.WHITE);

      const kingRealm = theme.getPieceRealm(whiteKing);
      const rookRealm = theme.getPieceRealm(whiteRook);

      expect(kingRealm).not.toBe(rookRealm);
    });
  });

  describe('getTheme', () => {
    it('should return complete theme object', () => {
      const whiteKing = new Piece(PieceType.KING, Color.WHITE);
      const themeObj = theme.getTheme(whiteKing);

      expect(themeObj.name).toBe('Zeus');
      expect(themeObj.symbol).toBe('♔');
      expect(themeObj.description).toBeDefined();
      expect(themeObj.realm).toBeDefined();
    });
  });

  describe('getDisplayString', () => {
    it('should return formatted display string', () => {
      const whiteKing = new Piece(PieceType.KING, Color.WHITE);
      const display = theme.getDisplayString(whiteKing);

      expect(display).toContain('Zeus');
      expect(display).toContain('♔');
      expect(display).toContain('King of the Gods');
    });
  });

  describe('getWhiteTheme', () => {
    it('should return all white piece themes', () => {
      const whiteTheme = theme.getWhiteTheme();

      expect(whiteTheme[PieceType.KING].name).toBe('Zeus');
      expect(whiteTheme[PieceType.QUEEN].name).toBe('Hera');
      expect(whiteTheme[PieceType.ROOK].name).toBe('Poseidon');
      expect(whiteTheme[PieceType.BISHOP].name).toBe('Apollo');
      expect(whiteTheme[PieceType.KNIGHT].name).toBe('Hermes');
      expect(whiteTheme[PieceType.PAWN].name).toBe('Olympian');
    });
  });

  describe('getBlackTheme', () => {
    it('should return all black piece themes', () => {
      const blackTheme = theme.getBlackTheme();

      expect(blackTheme[PieceType.KING].name).toBe('Hades');
      expect(blackTheme[PieceType.QUEEN].name).toBe('Persephone');
      expect(blackTheme[PieceType.ROOK].name).toBe('Ares');
      expect(blackTheme[PieceType.BISHOP].name).toBe('Artemis');
      expect(blackTheme[PieceType.KNIGHT].name).toBe('Athena');
      expect(blackTheme[PieceType.PAWN].name).toBe('Titan');
    });
  });

  describe('getAllCharacters', () => {
    it('should return list of all god names', () => {
      const characters = theme.getAllCharacters();

      expect(characters).toContain('Zeus');
      expect(characters).toContain('Hades');
      expect(characters).toContain('Hera');
      expect(characters).toContain('Persephone');
      expect(characters).toContain('Poseidon');
      expect(characters).toContain('Ares');
      expect(characters).toContain('Apollo');
      expect(characters).toContain('Artemis');
      expect(characters).toContain('Hermes');
      expect(characters).toContain('Athena');
      expect(characters).toContain('Olympian');
      expect(characters).toContain('Titan');
    });

    it('should return 12 characters (6 types × 2 colors)', () => {
      const characters = theme.getAllCharacters();
      expect(characters.length).toBe(12);
    });
  });

  describe('getGameDescription', () => {
    it('should return game description', () => {
      const description = theme.getGameDescription();

      expect(description).toContain('Greek Gods Chess');
      expect(description).toContain('Zeus');
      expect(description).toContain('Hades');
      expect(description).toContain('Olympus');
    });
  });

  describe('Singleton instance', () => {
    it('should export a singleton themeManager', () => {
      expect(themeManager).toBeInstanceOf(ThemeManager);

      const whiteKing = new Piece(PieceType.KING, Color.WHITE);
      expect(themeManager.getPieceName(whiteKing)).toBe('Zeus');
    });
  });

  describe('Theme consistency', () => {
    it('should have unique names for all pieces', () => {
      const names = new Set<string>();

      for (const pieceType of Object.values(PieceType)) {
        names.add(GREEK_THEME[pieceType].white.name);
        names.add(GREEK_THEME[pieceType].black.name);
      }

      // Should have 12 unique names
      expect(names.size).toBe(12);
    });

    it('should have valid Unicode symbols for all pieces', () => {
      for (const pieceType of Object.values(PieceType)) {
        const whiteSymbol = GREEK_THEME[pieceType].white.symbol;
        const blackSymbol = GREEK_THEME[pieceType].black.symbol;

        expect(whiteSymbol.length).toBeGreaterThan(0);
        expect(blackSymbol.length).toBeGreaterThan(0);
      }
    });
  });
});
