/**
 * URL State Unit Tests
 */

import {
  encodeGameState,
  decodeGameState,
  sanitizeGameState,
  createGameUrl,
  extractGameStateFromUrl,
} from '../urlState';
import type { GameState } from '../urlState';

describe('urlState', () => {
  const validState: GameState = {
    gameId: 'test-game-123',
    ply: 10,
    metadata: {
      source: 'test',
    },
  };

  describe('encodeGameState', () => {
    it('should encode game state to URL-safe string', () => {
      const encoded = encodeGameState(validState);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should produce URL-safe characters', () => {
      const encoded = encodeGameState(validState);
      // Should not contain +, /, or =
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('should handle state without metadata', () => {
      const state: GameState = { gameId: 'test', ply: 0 };
      const encoded = encodeGameState(state);
      expect(encoded).toBeDefined();
    });

    it('should handle special characters in gameId', () => {
      const state: GameState = {
        gameId: 'test-game_123!@#',
        ply: 5,
      };
      const encoded = encodeGameState(state);
      const decoded = decodeGameState(encoded);
      expect(decoded.gameId).toBe(state.gameId);
    });
  });

  describe('decodeGameState', () => {
    it('should decode encoded game state', () => {
      const encoded = encodeGameState(validState);
      const decoded = decodeGameState(encoded);
      expect(decoded).toEqual(validState);
    });

    it('should throw error for invalid encoded string', () => {
      expect(() => decodeGameState('invalid')).toThrow('Failed to decode');
    });

    it('should throw error for malformed JSON', () => {
      const invalidBase64 = btoa('not json');
      expect(() => decodeGameState(invalidBase64)).toThrow();
    });

    it('should throw error for missing gameId', () => {
      const state = { ply: 0 };
      const encoded = btoa(JSON.stringify(state));
      expect(() => decodeGameState(encoded)).toThrow('Invalid gameId');
    });

    it('should throw error for missing ply', () => {
      const state = { gameId: 'test' };
      const encoded = btoa(JSON.stringify(state));
      expect(() => decodeGameState(encoded)).toThrow('Invalid ply');
    });

    it('should handle metadata correctly', () => {
      const encoded = encodeGameState(validState);
      const decoded = decodeGameState(encoded);
      expect(decoded.metadata).toEqual(validState.metadata);
    });
  });

  describe('sanitizeGameState', () => {
    it('should sanitize valid game state', () => {
      const sanitized = sanitizeGameState(validState);
      expect(sanitized.gameId).toBe(validState.gameId);
      expect(sanitized.ply).toBe(validState.ply);
    });

    it('should remove null bytes from gameId', () => {
      const state: GameState = {
        gameId: 'test\x00game',
        ply: 0,
      };
      const sanitized = sanitizeGameState(state);
      expect(sanitized.gameId).toBe('testgame');
    });

    it('should clamp negative ply to -1', () => {
      const state: GameState = {
        gameId: 'test',
        ply: -100,
      };
      const sanitized = sanitizeGameState(state);
      expect(sanitized.ply).toBe(-1);
    });

    it('should handle invalid ply values', () => {
      const state = {
        gameId: 'test',
        ply: NaN,
      };
      const sanitized = sanitizeGameState(state as GameState);
      expect(sanitized.ply).toBe(-1);
    });

    it('should sanitize metadata', () => {
      const state: GameState = {
        gameId: 'test',
        ply: 0,
        metadata: {
          '\x00bad': 'value',
          'good': '\x00value',
          '': 'empty key',
        },
      };
      const sanitized = sanitizeGameState(state);
      expect(sanitized.metadata).toBeDefined();
      expect(sanitized.metadata).not.toHaveProperty('\x00bad');
      expect(sanitized.metadata).not.toHaveProperty('');
    });

    it('should trim whitespace from gameId', () => {
      const state: GameState = {
        gameId: '  test-game  ',
        ply: 0,
      };
      const sanitized = sanitizeGameState(state);
      expect(sanitized.gameId).toBe('test-game');
    });
  });

  describe('createGameUrl', () => {
    it('should create URL with game state', () => {
      const url = createGameUrl('https://example.com', validState);
      expect(url).toContain('https://example.com');
      expect(url).toContain('?game=');
    });

    it('should use custom parameter name', () => {
      const url = createGameUrl('https://example.com', validState, 'state');
      expect(url).toContain('?state=');
    });

    it('should preserve existing URL structure', () => {
      const url = createGameUrl(
        'https://example.com/path',
        validState
      );
      expect(url).toContain('/path');
    });

    it('should handle URLs with existing params', () => {
      const url = createGameUrl(
        'https://example.com?foo=bar',
        validState
      );
      expect(url).toContain('foo=bar');
      expect(url).toContain('game=');
    });
  });

  describe('extractGameStateFromUrl', () => {
    it('should extract game state from URL', () => {
      const url = createGameUrl('https://example.com', validState);
      const extracted = extractGameStateFromUrl(url);
      expect(extracted).toEqual(validState);
    });

    it('should return null if parameter not found', () => {
      const extracted = extractGameStateFromUrl('https://example.com');
      expect(extracted).toBeNull();
    });

    it('should return null for invalid URL', () => {
      const extracted = extractGameStateFromUrl('not a url');
      expect(extracted).toBeNull();
    });

    it('should use custom parameter name', () => {
      const url = createGameUrl('https://example.com', validState, 'state');
      const extracted = extractGameStateFromUrl(url, 'state');
      expect(extracted).toEqual(validState);
    });

    it('should return null for corrupted game state', () => {
      const url = 'https://example.com?game=corrupted';
      const extracted = extractGameStateFromUrl(url);
      expect(extracted).toBeNull();
    });
  });

  describe('round-trip encoding', () => {
    it('should maintain state through encode/decode cycle', () => {
      const encoded = encodeGameState(validState);
      const decoded = decodeGameState(encoded);
      expect(decoded).toEqual(validState);
    });

    it('should work with minimal state', () => {
      const minimalState: GameState = {
        gameId: 'a',
        ply: 0,
      };
      const encoded = encodeGameState(minimalState);
      const decoded = decodeGameState(encoded);
      expect(decoded).toEqual(minimalState);
    });

    it('should handle complex metadata', () => {
      const complexState: GameState = {
        gameId: 'test',
        ply: 42,
        metadata: {
          key1: 'value1',
          key2: 'value2',
          key3: 'special!@#$%',
        },
      };
      const encoded = encodeGameState(complexState);
      const decoded = decodeGameState(encoded);
      expect(decoded).toEqual(complexState);
    });
  });
});
