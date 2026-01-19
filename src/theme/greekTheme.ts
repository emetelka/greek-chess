/**
 * Greek gods theme for chess pieces
 * Maps traditional chess pieces to Greek mythology characters
 */

import { PieceType, Color } from '../core/types';
import { Piece } from '../core/Piece';

export interface PieceTheme {
  name: string;
  symbol: string;
  description: string;
  realm?: string;
}

/**
 * Greek theme mapping for all pieces
 * White pieces: Olympian gods (Mount Olympus)
 * Black pieces: Underworld/Opposing gods
 */
export const GREEK_THEME: Record<PieceType, { white: PieceTheme; black: PieceTheme }> = {
  [PieceType.KING]: {
    white: {
      name: 'Zeus',
      symbol: '♔',
      description: 'King of the Gods, ruler of Mount Olympus',
      realm: 'Sky & Thunder',
    },
    black: {
      name: 'Hades',
      symbol: '♚',
      description: 'God of the Underworld, lord of the dead',
      realm: 'Underworld',
    },
  },
  [PieceType.QUEEN]: {
    white: {
      name: 'Hera',
      symbol: '♕',
      description: 'Queen of the Gods, goddess of marriage',
      realm: 'Olympus',
    },
    black: {
      name: 'Persephone',
      symbol: '♛',
      description: 'Queen of the Underworld',
      realm: 'Underworld',
    },
  },
  [PieceType.ROOK]: {
    white: {
      name: 'Poseidon',
      symbol: '♖',
      description: 'God of the Sea, wielder of the trident',
      realm: 'Seas & Oceans',
    },
    black: {
      name: 'Ares',
      symbol: '♜',
      description: 'God of War, master of battle',
      realm: 'Warfare',
    },
  },
  [PieceType.BISHOP]: {
    white: {
      name: 'Apollo',
      symbol: '♗',
      description: 'God of Light, music, and prophecy',
      realm: 'Sun & Arts',
    },
    black: {
      name: 'Artemis',
      symbol: '♝',
      description: 'Goddess of the Hunt and Moon',
      realm: 'Moon & Wilderness',
    },
  },
  [PieceType.KNIGHT]: {
    white: {
      name: 'Hermes',
      symbol: '♘',
      description: 'Messenger of the Gods, swift traveler',
      realm: 'Speed & Commerce',
    },
    black: {
      name: 'Athena',
      symbol: '♞',
      description: 'Goddess of Wisdom and Strategic Warfare',
      realm: 'Wisdom & Strategy',
    },
  },
  [PieceType.PAWN]: {
    white: {
      name: 'Olympian',
      symbol: '♙',
      description: 'Mortal hero blessed by the gods',
      realm: 'Mount Olympus',
    },
    black: {
      name: 'Titan',
      symbol: '♟',
      description: 'Ancient Titan, older than the gods',
      realm: 'Primordial Era',
    },
  },
};

/**
 * ThemeManager provides easy access to piece theming
 */
export class ThemeManager {
  /**
   * Get the Greek god name for a piece
   */
  getPieceName(piece: Piece): string {
    return GREEK_THEME[piece.type][piece.color === Color.WHITE ? 'white' : 'black'].name;
  }

  /**
   * Get the Unicode chess symbol for a piece
   */
  getPieceSymbol(piece: Piece): string {
    return GREEK_THEME[piece.type][piece.color === Color.WHITE ? 'white' : 'black'].symbol;
  }

  /**
   * Get the description of the Greek god for a piece
   */
  getPieceDescription(piece: Piece): string {
    return GREEK_THEME[piece.type][piece.color === Color.WHITE ? 'white' : 'black'].description;
  }

  /**
   * Get the realm/domain of the Greek god for a piece
   */
  getPieceRealm(piece: Piece): string | undefined {
    return GREEK_THEME[piece.type][piece.color === Color.WHITE ? 'white' : 'black'].realm;
  }

  /**
   * Get the full theme object for a piece
   */
  getTheme(piece: Piece): PieceTheme {
    return GREEK_THEME[piece.type][piece.color === Color.WHITE ? 'white' : 'black'];
  }

  /**
   * Get a formatted display string for a piece
   * Example: "Zeus (♔) - King of the Gods"
   */
  getDisplayString(piece: Piece): string {
    const theme = this.getTheme(piece);
    return `${theme.name} (${theme.symbol}) - ${theme.description}`;
  }

  /**
   * Get all white pieces in the theme
   */
  getWhiteTheme(): Record<PieceType, PieceTheme> {
    return {
      [PieceType.KING]: GREEK_THEME[PieceType.KING].white,
      [PieceType.QUEEN]: GREEK_THEME[PieceType.QUEEN].white,
      [PieceType.ROOK]: GREEK_THEME[PieceType.ROOK].white,
      [PieceType.BISHOP]: GREEK_THEME[PieceType.BISHOP].white,
      [PieceType.KNIGHT]: GREEK_THEME[PieceType.KNIGHT].white,
      [PieceType.PAWN]: GREEK_THEME[PieceType.PAWN].white,
    };
  }

  /**
   * Get all black pieces in the theme
   */
  getBlackTheme(): Record<PieceType, PieceTheme> {
    return {
      [PieceType.KING]: GREEK_THEME[PieceType.KING].black,
      [PieceType.QUEEN]: GREEK_THEME[PieceType.QUEEN].black,
      [PieceType.ROOK]: GREEK_THEME[PieceType.ROOK].black,
      [PieceType.BISHOP]: GREEK_THEME[PieceType.BISHOP].black,
      [PieceType.KNIGHT]: GREEK_THEME[PieceType.KNIGHT].black,
      [PieceType.PAWN]: GREEK_THEME[PieceType.PAWN].black,
    };
  }

  /**
   * Get a list of all gods/characters in the game
   */
  getAllCharacters(): string[] {
    const characters: string[] = [];
    for (const pieceType of Object.values(PieceType)) {
      characters.push(GREEK_THEME[pieceType].white.name);
      characters.push(GREEK_THEME[pieceType].black.name);
    }
    return characters;
  }

  /**
   * Get thematic description for the game
   */
  getGameDescription(): string {
    return `
Greek Gods Chess - A Battle of Olympus on the Chessboard

White (Olympians):
- King: Zeus, ruler of Mount Olympus
- Queen: Hera, queen of the gods
- Rooks: Poseidon, god of the seas
- Bishops: Apollo, god of light and prophecy
- Knights: Hermes, swift messenger of the gods
- Pawns: Olympian heroes

Black (Underworld):
- King: Hades, lord of the underworld
- Queen: Persephone, queen of the dead
- Rooks: Ares, god of war
- Bishops: Artemis, goddess of the hunt
- Knights: Athena, goddess of wisdom
- Pawns: Ancient Titans
    `.trim();
  }
}

// Export a singleton instance for convenience
export const themeManager = new ThemeManager();
