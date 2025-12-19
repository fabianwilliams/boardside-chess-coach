/**
 * ChessGame
 *
 * Core chess game representation using chess.js library.
 * Provides access to game state, positions, and move history.
 */

import { Chess } from 'chess.js';
import type { Move, Position, ParsedPGN, PGNHeaders } from './types';

/**
 * ChessGame class - represents a chess game loaded from PGN
 */
export class ChessGame {
  private chess: Chess;
  private moveHistory: Move[];
  private headers: PGNHeaders;
  private rawPGN: string;

  /**
   * Creates a new ChessGame instance from PGN string
   * @param pgn - PGN string of the chess game
   * @throws {Error} If PGN is invalid
   */
  constructor(pgn: string) {
    this.rawPGN = pgn;
    this.chess = new Chess();
    this.headers = {};
    this.moveHistory = [];

    try {
      this.chess.loadPgn(pgn);
      this.headers = this.extractHeaders(pgn);
      this.moveHistory = this.buildMoveHistory();
    } catch (error) {
      throw new Error(
        `Invalid PGN: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get the current position of the game
   * @returns Position object with FEN, turn, and game state
   */
  getCurrentPosition(): Position {
    return {
      fen: this.chess.fen(),
      turn: this.chess.turn(),
      moveNumber: this.chess.moveNumber(),
      inCheck: this.chess.inCheck(),
      isGameOver: this.chess.isGameOver(),
      result: this.headers.Result,
    };
  }

  /**
   * Get a specific move from the game history
   * @param ply - The ply (half-move) number (0-indexed)
   * @returns Move object or undefined if ply is out of range
   */
  getMoveAt(ply: number): Move | undefined {
    if (ply < 0 || ply >= this.moveHistory.length) {
      return undefined;
    }
    return this.moveHistory[ply];
  }

  /**
   * Get all moves in the game
   * @returns Array of all moves
   */
  getAllMoves(): Move[] {
    return [...this.moveHistory];
  }

  /**
   * Get the total number of moves (plies) in the game
   * @returns Number of half-moves
   */
  getMoveCount(): number {
    return this.moveHistory.length;
  }

  /**
   * Get PGN headers
   * @returns PGN headers object
   */
  getHeaders(): PGNHeaders {
    return { ...this.headers };
  }

  /**
   * Get the raw PGN string
   * @returns Original PGN string
   */
  getPGN(): string {
    return this.rawPGN;
  }

  /**
   * Get position after a specific ply
   * @param ply - The ply number (0-indexed, -1 for starting position)
   * @returns Position object
   */
  getPositionAtPly(ply: number): Position {
    // Create a new Chess instance to replay moves
    const tempChess = new Chess();

    // Replay moves up to the specified ply
    for (let i = 0; i <= ply && i < this.moveHistory.length; i++) {
      const move = this.moveHistory[i];
      tempChess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
    }

    return {
      fen: tempChess.fen(),
      turn: tempChess.turn(),
      moveNumber: tempChess.moveNumber(),
      inCheck: tempChess.inCheck(),
      isGameOver: tempChess.isGameOver(),
      result: this.headers.Result,
    };
  }

  /**
   * Extract headers from PGN string
   * @param pgn - PGN string
   * @returns PGN headers object
   */
  private extractHeaders(pgn: string): PGNHeaders {
    const headers: PGNHeaders = {};
    const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
    let match;

    while ((match = headerRegex.exec(pgn)) !== null) {
      headers[match[1]] = match[2];
    }

    return headers;
  }

  /**
   * Build move history from chess.js history
   * @returns Array of Move objects
   */
  private buildMoveHistory(): Move[] {
    const history = this.chess.history({ verbose: true });
    return history.map((move, index) => ({
      san: move.san,
      from: move.from,
      to: move.to,
      captured: move.captured,
      promotion: move.promotion,
      check: move.san.includes('+'),
      checkmate: move.san.includes('#'),
      moveNumber: Math.floor(index / 2) + 1,
      color: move.color,
      ply: index,
      annotation: this.extractAnnotation(move.san),
    }));
  }

  /**
   * Extract annotation from move SAN
   * @param _san - Standard Algebraic Notation string
   * @returns Annotation object if present
   */
  private extractAnnotation(_san: string): undefined {
    // TODO: Implement annotation extraction from comments/NAGs
    // This is a placeholder for future enhancement
    return undefined;
  }

  /**
   * Get parsed PGN structure
   * @returns Parsed PGN object
   */
  getParsedPGN(): ParsedPGN {
    return {
      headers: this.getHeaders(),
      moves: this.getAllMoves(),
      pgn: this.rawPGN,
    };
  }
}
