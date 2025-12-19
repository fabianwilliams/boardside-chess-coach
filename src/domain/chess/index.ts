/**
 * Chess Domain Module
 *
 * Core chess logic and utilities for the Boardside Chess Coach.
 */

export { ChessGame } from './ChessGame';
export { MoveNavigator } from './MoveNavigator';
export * as PGNParser from './PGNParser';
export type {
  Move,
  Position,
  Annotation,
  PGNHeaders,
  ParsedPGN,
  Square,
  Piece,
  PieceType,
  PieceColor,
  Board,
  GameResult,
  NavigationDirection,
} from './types';
