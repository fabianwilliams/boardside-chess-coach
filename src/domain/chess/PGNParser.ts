/**
 * PGNParser
 *
 * Utility functions for parsing and validating PGN (Portable Game Notation).
 * Provides validation and extraction of PGN components.
 */

import { Chess } from 'chess.js';
import type { PGNHeaders, ParsedPGN, Move } from './types';

/**
 * Parse a PGN string into structured data
 * @param pgn - PGN string to parse
 * @returns Parsed PGN object
 * @throws {Error} If PGN is invalid
 */
export function parsePGN(pgn: string): ParsedPGN {
  if (!isValidPGN(pgn)) {
    throw new Error('Invalid PGN format');
  }

  const headers = extractHeaders(pgn);
  const moves = extractMoves(pgn);

  return {
    headers,
    moves,
    pgn,
  };
}

/**
 * Validate a PGN string
 * @param pgn - PGN string to validate
 * @returns true if valid, false otherwise
 */
export function isValidPGN(pgn: string): boolean {
  if (!pgn || typeof pgn !== 'string' || pgn.trim().length === 0) {
    return false;
  }

  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract headers from PGN string
 * @param pgn - PGN string
 * @returns PGN headers object
 */
export function extractHeaders(pgn: string): PGNHeaders {
  const headers: PGNHeaders = {};
  const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
  let match;

  while ((match = headerRegex.exec(pgn)) !== null) {
    headers[match[1]] = match[2];
  }

  return headers;
}

/**
 * Extract moves from PGN string
 * @param pgn - PGN string
 * @returns Array of Move objects
 */
export function extractMoves(pgn: string): Move[] {
  const chess = new Chess();
  chess.loadPgn(pgn);

  const history = chess.history({ verbose: true });
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
  }));
}

/**
 * Validate PGN headers
 * @param headers - PGN headers object
 * @returns true if headers contain minimum required fields
 */
export function hasRequiredHeaders(headers: PGNHeaders): boolean {
  const requiredFields = ['Event', 'Site', 'Date', 'White', 'Black', 'Result'];
  return requiredFields.every((field) => field in headers);
}

/**
 * Validate PGN result tag
 * @param result - Result string from PGN
 * @returns true if result is valid
 */
export function isValidResult(result: string): boolean {
  const validResults = ['1-0', '0-1', '1/2-1/2', '*'];
  return validResults.includes(result);
}

/**
 * Clean PGN string (remove comments and variations)
 * @param pgn - PGN string
 * @returns Cleaned PGN string
 */
export function cleanPGN(pgn: string): string {
  // Remove comments in braces
  let cleaned = pgn.replace(/\{[^}]*\}/g, '');

  // Remove comments in semicolons
  cleaned = cleaned.replace(/;[^\n]*\n/g, '\n');

  // Remove variations in parentheses
  cleaned = cleaned.replace(/\([^)]*\)/g, '');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Extract game result from PGN
 * @param pgn - PGN string
 * @returns Game result or undefined
 */
export function extractResult(pgn: string): string | undefined {
  const headers = extractHeaders(pgn);
  return headers.Result;
}

/**
 * Check if PGN represents a complete game
 * @param pgn - PGN string
 * @returns true if game is complete (has result other than '*')
 */
export function isCompleteGame(pgn: string): boolean {
  const result = extractResult(pgn);
  return result !== undefined && result !== '*';
}

/**
 * Normalize PGN string to standard format
 * @param pgn - PGN string
 * @returns Normalized PGN string
 */
export function normalizePGN(pgn: string): string {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return chess.pgn();
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid PGN: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Count moves in a PGN string
 * @param pgn - PGN string
 * @returns Number of half-moves (plies)
 */
export function countMoves(pgn: string): number {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return chess.history().length;
  } catch {
    return 0;
  }
}
