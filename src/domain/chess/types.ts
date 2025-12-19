/**
 * Chess Domain Types
 *
 * Core type definitions for chess game representation,
 * move navigation, and PGN parsing.
 */

/**
 * Represents a chess square coordinate
 */
export type Square = string; // e.g., "e4", "d5"

/**
 * Represents a single chess move with metadata
 */
export interface Move {
  /** Square-Algebraic Notation of the move (e.g., "Nf3", "e4") */
  san: string;
  /** From square */
  from: Square;
  /** To square */
  to: Square;
  /** Captured piece, if any */
  captured?: string;
  /** Promotion piece, if any */
  promotion?: string;
  /** Check flag */
  check?: boolean;
  /** Checkmate flag */
  checkmate?: boolean;
  /** Move number (full move) */
  moveNumber: number;
  /** Color of the player making the move */
  color: 'w' | 'b';
  /** Ply (half-move) number */
  ply: number;
  /** Move annotation, if present */
  annotation?: Annotation;
}

/**
 * Chess move annotation symbols and text
 */
export interface Annotation {
  /** NAG (Numeric Annotation Glyph) code */
  nag?: number;
  /** Symbolic annotation (e.g., "!", "?", "!?") */
  symbol?: string;
  /** Text comment */
  comment?: string;
}

/**
 * Represents the current board position
 */
export interface Position {
  /** FEN string of the current position */
  fen: string;
  /** Whose turn it is */
  turn: 'w' | 'b';
  /** Current move number */
  moveNumber: number;
  /** Is the current player in check? */
  inCheck: boolean;
  /** Is the game over? */
  isGameOver: boolean;
  /** Result of the game if over */
  result?: GameResult;
}

/**
 * Game result enumeration
 */
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';

/**
 * PGN metadata (headers)
 */
export interface PGNHeaders {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: GameResult;
  [key: string]: string | undefined;
}

/**
 * Parsed PGN game structure
 */
export interface ParsedPGN {
  /** PGN headers */
  headers: PGNHeaders;
  /** Moves in the game */
  moves: Move[];
  /** Raw PGN string */
  pgn: string;
}

/**
 * Chess piece representation
 */
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

/**
 * Chess piece with color
 */
export interface Piece {
  type: PieceType;
  color: PieceColor;
}

/**
 * Board state represented as a map of squares to pieces
 */
export type Board = Map<Square, Piece>;

/**
 * Navigation direction
 */
export type NavigationDirection = 'forward' | 'backward';

/**
 * Educational annotation for a move
 * Used for teaching chess principles and concepts
 */
export interface EducationalAnnotation {
  /** Chess principle being illustrated */
  principle: string;
  /** Principle identifier (kebab-case) */
  principleId: string;
  /** Educational explanation text */
  text: string;
}
