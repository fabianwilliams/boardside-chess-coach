/**
 * URL State Management
 *
 * Utilities for encoding, decoding, and sanitizing game state in URL parameters.
 * Enables shareable game links and browser history navigation.
 */

/**
 * Game state structure for URL encoding
 */
export interface GameState {
  /** Game ID or PGN identifier */
  gameId: string;
  /** Current ply (half-move) position */
  ply: number;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

/**
 * Encode game state into URL-safe string
 * @param state - GameState object to encode
 * @returns Base64-encoded URL-safe string
 */
export function encodeGameState(state: GameState): string {
  try {
    const json = JSON.stringify(state);
    const encoded = btoa(json);
    // Make URL-safe by replacing characters
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    throw new Error(
      `Failed to encode game state: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Decode URL-safe string back to game state
 * @param encoded - Encoded game state string
 * @returns GameState object
 * @throws Error if decoding fails
 */
export function decodeGameState(encoded: string): GameState {
  try {
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = atob(base64);
    const state = JSON.parse(json);

    // Validate required fields
    if (!state.gameId || typeof state.gameId !== 'string') {
      throw new Error('Invalid gameId');
    }

    if (typeof state.ply !== 'number') {
      throw new Error('Invalid ply');
    }

    return state;
  } catch (error) {
    throw new Error(
      `Failed to decode game state: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Sanitize game state to ensure valid values
 * @param state - GameState object to sanitize
 * @returns Sanitized GameState object
 */
export function sanitizeGameState(state: GameState): GameState {
  return {
    gameId: sanitizeString(state.gameId),
    ply: sanitizePly(state.ply),
    metadata: state.metadata
      ? sanitizeMetadata(state.metadata)
      : undefined,
  };
}

/**
 * Sanitize string value
 * @param value - String to sanitize
 * @returns Sanitized string
 */
function sanitizeString(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  // Remove null bytes and control characters
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

/**
 * Sanitize ply number
 * @param ply - Ply number to sanitize
 * @returns Valid ply number (>= -1)
 */
function sanitizePly(ply: number): number {
  const parsed = parseInt(String(ply), 10);
  if (isNaN(parsed)) {
    return -1;
  }
  return Math.max(-1, parsed);
}

/**
 * Sanitize metadata object
 * @param metadata - Metadata to sanitize
 * @returns Sanitized metadata
 */
function sanitizeMetadata(
  metadata: Record<string, string>
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(metadata)) {
    const sanitizedKey = sanitizeString(key);
    const sanitizedValue = sanitizeString(String(value));

    if (sanitizedKey && sanitizedValue) {
      sanitized[sanitizedKey] = sanitizedValue;
    }
  }

  return sanitized;
}

/**
 * Create URL with game state parameter
 * @param baseUrl - Base URL
 * @param state - GameState to encode
 * @param paramName - Name of query parameter (default: 'game')
 * @returns Complete URL with encoded game state
 */
export function createGameUrl(
  baseUrl: string,
  state: GameState,
  paramName: string = 'game'
): string {
  const encoded = encodeGameState(state);
  const url = new URL(baseUrl);
  url.searchParams.set(paramName, encoded);
  return url.toString();
}

/**
 * Extract game state from URL
 * @param url - URL string to parse
 * @param paramName - Name of query parameter (default: 'game')
 * @returns GameState or null if not found
 */
export function extractGameStateFromUrl(
  url: string,
  paramName: string = 'game'
): GameState | null {
  try {
    const urlObj = new URL(url);
    const encoded = urlObj.searchParams.get(paramName);

    if (!encoded) {
      return null;
    }

    return decodeGameState(encoded);
  } catch {
    return null;
  }
}
