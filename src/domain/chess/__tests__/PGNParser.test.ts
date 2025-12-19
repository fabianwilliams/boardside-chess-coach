/**
 * PGNParser Unit Tests
 */

import * as PGNParser from '../PGNParser';

const VALID_PGN = `[Event "Test Game"]
[Site "Test Site"]
[Date "2025.01.01"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`;

const MINIMAL_PGN = `[Event "Minimal"]
[Site "Test"]
[Date "2025.01.01"]
[Round "1"]
[White "A"]
[Black "B"]
[Result "*"]

*`;

const INVALID_PGN = 'This is not valid PGN';

describe('PGNParser', () => {
  describe('parsePGN', () => {
    it('should parse valid PGN', () => {
      const parsed = PGNParser.parsePGN(VALID_PGN);
      expect(parsed).toHaveProperty('headers');
      expect(parsed).toHaveProperty('moves');
      expect(parsed).toHaveProperty('pgn');
    });

    it('should extract headers correctly', () => {
      const parsed = PGNParser.parsePGN(VALID_PGN);
      expect(parsed.headers.Event).toBe('Test Game');
      expect(parsed.headers.White).toBe('Player 1');
      expect(parsed.headers.Black).toBe('Player 2');
      expect(parsed.headers.Result).toBe('1-0');
    });

    it('should extract moves correctly', () => {
      const parsed = PGNParser.parsePGN(VALID_PGN);
      expect(parsed.moves).toHaveLength(6);
      expect(parsed.moves[0].san).toBe('e4');
      expect(parsed.moves[1].san).toBe('e5');
    });

    it('should throw error for invalid PGN', () => {
      expect(() => PGNParser.parsePGN(INVALID_PGN)).toThrow('Invalid PGN');
    });

    it('should include original PGN string', () => {
      const parsed = PGNParser.parsePGN(VALID_PGN);
      expect(parsed.pgn).toBe(VALID_PGN);
    });
  });

  describe('isValidPGN', () => {
    it('should return true for valid PGN', () => {
      expect(PGNParser.isValidPGN(VALID_PGN)).toBe(true);
    });

    it('should return true for minimal valid PGN', () => {
      expect(PGNParser.isValidPGN(MINIMAL_PGN)).toBe(true);
    });

    it('should return false for invalid PGN', () => {
      expect(PGNParser.isValidPGN(INVALID_PGN)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(PGNParser.isValidPGN('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(PGNParser.isValidPGN('   \n  ')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(PGNParser.isValidPGN(null as unknown as string)).toBe(false);
      expect(PGNParser.isValidPGN(undefined as unknown as string)).toBe(false);
    });
  });

  describe('extractHeaders', () => {
    it('should extract all headers', () => {
      const headers = PGNParser.extractHeaders(VALID_PGN);
      expect(headers.Event).toBe('Test Game');
      expect(headers.Site).toBe('Test Site');
      expect(headers.Date).toBe('2025.01.01');
      expect(headers.Round).toBe('1');
      expect(headers.White).toBe('Player 1');
      expect(headers.Black).toBe('Player 2');
      expect(headers.Result).toBe('1-0');
    });

    it('should return empty object for PGN without headers', () => {
      const headers = PGNParser.extractHeaders('1. e4 e5');
      expect(Object.keys(headers)).toHaveLength(0);
    });

    it('should handle custom headers', () => {
      const customPGN = `[Event "Test"]
[CustomHeader "Custom Value"]

*`;
      const headers = PGNParser.extractHeaders(customPGN);
      expect(headers.CustomHeader).toBe('Custom Value');
    });
  });

  describe('extractMoves', () => {
    it('should extract all moves', () => {
      const moves = PGNParser.extractMoves(VALID_PGN);
      expect(moves).toHaveLength(6);
    });

    it('should extract move details', () => {
      const moves = PGNParser.extractMoves(VALID_PGN);
      expect(moves[0]).toMatchObject({
        san: 'e4',
        from: 'e2',
        to: 'e4',
        color: 'w',
        ply: 0,
      });
    });

    it('should return empty array for game with no moves', () => {
      const moves = PGNParser.extractMoves(MINIMAL_PGN);
      expect(moves).toHaveLength(0);
    });

    it('should track ply numbers correctly', () => {
      const moves = PGNParser.extractMoves(VALID_PGN);
      moves.forEach((move, index) => {
        expect(move.ply).toBe(index);
      });
    });
  });

  describe('hasRequiredHeaders', () => {
    it('should return true for complete headers', () => {
      const headers = PGNParser.extractHeaders(VALID_PGN);
      expect(PGNParser.hasRequiredHeaders(headers)).toBe(true);
    });

    it('should return false for incomplete headers', () => {
      const incompleteHeaders = {
        Event: 'Test',
        Site: 'Test',
      };
      expect(PGNParser.hasRequiredHeaders(incompleteHeaders)).toBe(false);
    });

    it('should require all six standard tags', () => {
      const almostComplete = {
        Event: 'Test',
        Site: 'Test',
        Date: '2025.01.01',
        White: 'A',
        Result: '*' as const,
        // Missing Black
      };
      expect(PGNParser.hasRequiredHeaders(almostComplete)).toBe(false);
    });
  });

  describe('isValidResult', () => {
    it('should return true for valid results', () => {
      expect(PGNParser.isValidResult('1-0')).toBe(true);
      expect(PGNParser.isValidResult('0-1')).toBe(true);
      expect(PGNParser.isValidResult('1/2-1/2')).toBe(true);
      expect(PGNParser.isValidResult('*')).toBe(true);
    });

    it('should return false for invalid results', () => {
      expect(PGNParser.isValidResult('2-0')).toBe(false);
      expect(PGNParser.isValidResult('draw')).toBe(false);
      expect(PGNParser.isValidResult('')).toBe(false);
    });
  });

  describe('cleanPGN', () => {
    it('should remove comments in braces', () => {
      const pgnWithComments = '1. e4 {good move} e5';
      const cleaned = PGNParser.cleanPGN(pgnWithComments);
      expect(cleaned).not.toContain('{');
      expect(cleaned).not.toContain('good move');
    });

    it('should remove variations in parentheses', () => {
      const pgnWithVariations = '1. e4 (1. d4) e5';
      const cleaned = PGNParser.cleanPGN(pgnWithVariations);
      expect(cleaned).not.toContain('(');
      expect(cleaned).not.toContain('1. d4');
    });

    it('should normalize whitespace', () => {
      const messyPgn = '1.  e4   e5\n\n2. Nf3';
      const cleaned = PGNParser.cleanPGN(messyPgn);
      expect(cleaned).not.toContain('  ');
    });

    it('should preserve move text', () => {
      const pgn = '1. e4 e5 2. Nf3';
      const cleaned = PGNParser.cleanPGN(pgn);
      expect(cleaned).toContain('e4');
      expect(cleaned).toContain('e5');
      expect(cleaned).toContain('Nf3');
    });
  });

  describe('extractResult', () => {
    it('should extract result from headers', () => {
      const result = PGNParser.extractResult(VALID_PGN);
      expect(result).toBe('1-0');
    });

    it('should return undefined if no result header', () => {
      const pgnNoResult = '1. e4 e5';
      const result = PGNParser.extractResult(pgnNoResult);
      expect(result).toBeUndefined();
    });
  });

  describe('isCompleteGame', () => {
    it('should return true for completed game', () => {
      expect(PGNParser.isCompleteGame(VALID_PGN)).toBe(true);
    });

    it('should return false for ongoing game', () => {
      expect(PGNParser.isCompleteGame(MINIMAL_PGN)).toBe(false);
    });

    it('should return false for game without result', () => {
      const noResultPGN = '1. e4 e5';
      expect(PGNParser.isCompleteGame(noResultPGN)).toBe(false);
    });
  });

  describe('normalizePGN', () => {
    it('should normalize valid PGN', () => {
      const normalized = PGNParser.normalizePGN(VALID_PGN);
      expect(typeof normalized).toBe('string');
      expect(normalized.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid PGN', () => {
      expect(() => PGNParser.normalizePGN(INVALID_PGN)).toThrow(
        'Cannot normalize invalid PGN'
      );
    });

    it('should produce consistent output', () => {
      const normalized1 = PGNParser.normalizePGN(VALID_PGN);
      const normalized2 = PGNParser.normalizePGN(VALID_PGN);
      expect(normalized1).toBe(normalized2);
    });
  });

  describe('countMoves', () => {
    it('should count moves in valid PGN', () => {
      const count = PGNParser.countMoves(VALID_PGN);
      expect(count).toBe(6);
    });

    it('should return 0 for game with no moves', () => {
      const count = PGNParser.countMoves(MINIMAL_PGN);
      expect(count).toBe(0);
    });

    it('should return 0 for invalid PGN', () => {
      const count = PGNParser.countMoves(INVALID_PGN);
      expect(count).toBe(0);
    });

    it('should count half-moves (plies)', () => {
      const threeMovesPGN = `[Event "Test"]
[Site "Test"]
[Date "2025.01.01"]
[Round "1"]
[White "A"]
[Black "B"]
[Result "*"]

1. e4 e5 2. Nf3 *`;
      const count = PGNParser.countMoves(threeMovesPGN);
      expect(count).toBe(3); // e4, e5, Nf3
    });
  });
});
