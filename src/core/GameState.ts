/**
 * GameState is the main orchestrator for the chess game
 * It integrates Board, MoveValidator, MoveGenerator, and MoveHistory
 */

import { Position, Color, GameStatus, MoveResult, PieceType, Move, MoveType } from './types';
import { Board } from './Board';
import { Piece } from './Piece';
import { MoveValidator } from './MoveValidator';
import { MoveHistory } from './MoveHistory';
import { getPawnPromotionRow, getOppositeColor, getBackRank } from '../utils/boardHelpers';

export class GameState {
  private board: Board;
  private validator: MoveValidator;
  private history: MoveHistory;
  private currentTurn: Color;
  private status: GameStatus;

  constructor() {
    this.board = new Board();
    this.validator = new MoveValidator(this.board);
    this.history = new MoveHistory();
    this.currentTurn = Color.WHITE; // White always starts
    this.status = GameStatus.ACTIVE;
  }

  /**
   * Make a move on the board
   */
  makeMove(from: Position, to: Position): MoveResult {
    const piece = this.board.getPiece(from);

    // Validate piece exists and belongs to current player
    if (!piece) {
      return {
        success: false,
        error: 'No piece at the starting position',
      };
    }

    if (piece.color !== this.currentTurn) {
      return {
        success: false,
        error: `It's ${this.currentTurn === Color.WHITE ? "White's" : "Black's"} turn`,
      };
    }

    // Check if game is already over
    if (this.status === GameStatus.CHECKMATE || this.status === GameStatus.STALEMATE) {
      return {
        success: false,
        error: 'Game is already over',
      };
    }

    // Validate the move is legal
    const lastMove = this.history.getLastMove();
    if (!this.validator.isLegalMove(from, to, piece, lastMove || undefined)) {
      return {
        success: false,
        error: 'Illegal move',
      };
    }

    // Save board state before move for history
    const boardBeforeMove = this.board.clone();

    // Check for special moves
    const capturedPiece = this.board.getPiece(to);
    let moveType = capturedPiece ? MoveType.CAPTURE : MoveType.NORMAL;

    // Handle castling
    if (piece.type === PieceType.KING && Math.abs(to.col - from.col) === 2) {
      moveType = to.col > from.col ? MoveType.CASTLE_KINGSIDE : MoveType.CASTLE_QUEENSIDE;
      this.executeCastling(from, to, piece.color);
    }
    // Handle en passant
    else if (
      piece.type === PieceType.PAWN &&
      to.col !== from.col &&
      !capturedPiece &&
      lastMove
    ) {
      moveType = MoveType.EN_PASSANT;
      this.executeEnPassant(from, to, lastMove);
    }
    // Handle pawn promotion
    else if (piece.type === PieceType.PAWN && to.row === getPawnPromotionRow(piece.color)) {
      moveType = MoveType.PROMOTION;
      this.executePromotion(from, to);
    }
    // Normal move or capture
    else {
      this.board.movePiece(from, to);
    }

    // Create move record
    const move: Move = {
      from,
      to,
      piece: piece.clone(),
      capturedPiece: capturedPiece ? capturedPiece.clone() : undefined,
      moveType,
      timestamp: Date.now(),
      notation: this.getMoveNotation(from, to, piece, moveType, capturedPiece),
    };

    // Add to history
    this.history.addMove(move, boardBeforeMove);

    // Switch turns
    this.currentTurn = getOppositeColor(this.currentTurn);

    // Update game status
    this.updateStatus();

    return {
      success: true,
      move,
      newStatus: this.status,
      capturedPiece: capturedPiece || undefined,
    };
  }

  /**
   * Execute castling move
   */
  private executeCastling(kingFrom: Position, kingTo: Position, color: Color): void {
    const backRank = getBackRank(color);
    const isKingside = kingTo.col > kingFrom.col;

    // Move king
    this.board.movePiece(kingFrom, kingTo);

    // Move rook
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? 5 : 3;
    this.board.movePiece(new Position(backRank, rookFromCol), new Position(backRank, rookToCol));
  }

  /**
   * Execute en passant capture
   */
  private executeEnPassant(from: Position, to: Position, lastMove: Move): void {
    // Move the pawn
    this.board.movePiece(from, to);

    // Remove the captured pawn (which is on the same rank as 'from', not 'to')
    this.board.setPiece(lastMove.to, null);
  }

  /**
   * Execute pawn promotion (default to queen)
   */
  private executePromotion(from: Position, to: Position, promoteTo?: PieceType): void {
    const piece = this.board.getPiece(from);
    if (!piece) return;

    // Default promotion to queen
    const promotionType = promoteTo || PieceType.QUEEN;
    const promotedPiece = new Piece(promotionType, piece.color, true);

    this.board.setPiece(from, null);
    this.board.setPiece(to, promotedPiece);
  }

  /**
   * Undo the last move
   */
  undoMove(): boolean {
    const entry = this.history.undo();
    if (!entry) {
      return false;
    }

    // Restore board state
    this.board = entry.boardBeforeMove.clone() as Board;
    this.validator = new MoveValidator(this.board);

    // Switch turn back
    this.currentTurn = getOppositeColor(this.currentTurn);

    // Update status
    this.updateStatus();

    return true;
  }

  /**
   * Get all legal moves for a piece at a position
   */
  getLegalMoves(position: Position): Position[] {
    const piece = this.board.getPiece(position);
    if (!piece || piece.color !== this.currentTurn) {
      return [];
    }

    const lastMove = this.history.getLastMove();
    return this.validator.getLegalMoves(position, piece as Piece, lastMove || undefined);
  }

  /**
   * Update the game status (check, checkmate, stalemate)
   */
  private updateStatus(): void {
    const lastMove = this.history.getLastMove();

    // Check for checkmate
    if (this.validator.isCheckmate(this.currentTurn, lastMove || undefined)) {
      this.status = GameStatus.CHECKMATE;
      return;
    }

    // Check for stalemate
    if (this.validator.isStalemate(this.currentTurn, lastMove || undefined)) {
      this.status = GameStatus.STALEMATE;
      return;
    }

    // Check for check
    if (this.validator.isKingInCheck(this.board, this.currentTurn)) {
      this.status = GameStatus.CHECK;
      return;
    }

    // Game is active
    this.status = GameStatus.ACTIVE;
  }

  /**
   * Get the current game status
   */
  getStatus(): GameStatus {
    return this.status;
  }

  /**
   * Get the current turn color
   */
  getCurrentTurn(): Color {
    return this.currentTurn;
  }

  /**
   * Get the board
   */
  getBoard(): Board {
    return this.board;
  }

  /**
   * Get move history
   */
  getMoveHistory(): Move[] {
    return this.history.getAllMoves();
  }

  /**
   * Get the last move
   */
  getLastMove(): Move | null {
    return this.history.getLastMove();
  }

  /**
   * Get the number of moves made
   */
  getMoveCount(): number {
    return this.history.getMoveCount();
  }

  /**
   * Check if the current player is in check
   */
  isInCheck(): boolean {
    return this.validator.isKingInCheck(this.board, this.currentTurn);
  }

  /**
   * Reset the game to initial state
   */
  reset(): void {
    this.board = new Board();
    this.validator = new MoveValidator(this.board);
    this.history = new MoveHistory();
    this.currentTurn = Color.WHITE;
    this.status = GameStatus.ACTIVE;
  }

  /**
   * Generate algebraic notation for a move
   */
  private getMoveNotation(
    from: Position,
    to: Position,
    piece: Piece,
    moveType: MoveType,
    capturedPiece?: Piece | null
  ): string {
    // Castling
    if (moveType === MoveType.CASTLE_KINGSIDE) {
      return 'O-O';
    }
    if (moveType === MoveType.CASTLE_QUEENSIDE) {
      return 'O-O-O';
    }

    let notation = '';

    // Piece letter (except pawns)
    if (piece.type !== PieceType.PAWN) {
      const pieceLetters: Record<PieceType, string> = {
        [PieceType.KING]: 'K',
        [PieceType.QUEEN]: 'Q',
        [PieceType.ROOK]: 'R',
        [PieceType.BISHOP]: 'B',
        [PieceType.KNIGHT]: 'N',
        [PieceType.PAWN]: '',
      };
      notation += pieceLetters[piece.type];
    }

    // For pawn captures, include the starting file
    if (piece.type === PieceType.PAWN && capturedPiece) {
      notation += from.toAlgebraic()[0]; // Just the file letter
    }

    // Capture indicator
    if (capturedPiece || moveType === MoveType.EN_PASSANT) {
      notation += 'x';
    }

    // Destination square
    notation += to.toAlgebraic();

    // Promotion
    if (moveType === MoveType.PROMOTION) {
      notation += '=Q'; // Default to queen
    }

    return notation;
  }
}
