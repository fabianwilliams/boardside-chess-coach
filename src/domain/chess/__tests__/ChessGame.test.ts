/**
 * ChessGame Unit Tests
 */

import { ChessGame } from '../ChessGame';

const VALID_PGN = `[Event "Test Game"]
[Site "Test"]
[Date "2025.01.01"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`;

const INVALID_PGN = 'This is not a valid PGN';

describe('ChessGame', () => {
  describe('constructor', () => {
    it('should create a ChessGame from valid PGN', () => {
      expect(() => new ChessGame(VALID_PGN)).not.toThrow();
    });

    it('should throw error for invalid PGN', () => {
      expect(() => new ChessGame(INVALID_PGN)).toThrow('Invalid PGN');
    });
  });

  describe('getCurrentPosition', () => {
    it('should return the final position of the game', () => {
      const game = new ChessGame(VALID_PGN);
      const position = game.getCurrentPosition();

      expect(position).toHaveProperty('fen');
      expect(position).toHaveProperty('turn');
      expect(position).toHaveProperty('moveNumber');
      expect(position).toHaveProperty('inCheck');
      expect(position).toHaveProperty('isGameOver');
    });

    it('should have correct turn after moves', () => {
      const game = new ChessGame(VALID_PGN);
      const position = game.getCurrentPosition();

      // After 3 full moves + 3 half-moves, it should be white's turn
      expect(position.turn).toBe('w');
    });
  });

  describe('getMoveAt', () => {
    const game = new ChessGame(VALID_PGN);

    it('should return the first move', () => {
      const move = game.getMoveAt(0);
      expect(move).toBeDefined();
      expect(move?.san).toBe('e4');
      expect(move?.color).toBe('w');
      expect(move?.ply).toBe(0);
    });

    it('should return the second move', () => {
      const move = game.getMoveAt(1);
      expect(move).toBeDefined();
      expect(move?.san).toBe('e5');
      expect(move?.color).toBe('b');
      expect(move?.ply).toBe(1);
    });

    it('should return undefined for negative ply', () => {
      const move = game.getMoveAt(-1);
      expect(move).toBeUndefined();
    });

    it('should return undefined for out of range ply', () => {
      const move = game.getMoveAt(999);
      expect(move).toBeUndefined();
    });
  });

  describe('getAllMoves', () => {
    const game = new ChessGame(VALID_PGN);

    it('should return all moves in the game', () => {
      const moves = game.getAllMoves();
      expect(moves).toHaveLength(6); // 3 moves by white + 3 by black
    });

    it('should return moves in order', () => {
      const moves = game.getAllMoves();
      expect(moves[0].san).toBe('e4');
      expect(moves[1].san).toBe('e5');
      expect(moves[2].san).toBe('Nf3');
    });

    it('should return a copy of the move array', () => {
      const moves1 = game.getAllMoves();
      const moves2 = game.getAllMoves();
      expect(moves1).not.toBe(moves2);
      expect(moves1).toEqual(moves2);
    });
  });

  describe('getMoveCount', () => {
    it('should return correct number of moves', () => {
      const game = new ChessGame(VALID_PGN);
      expect(game.getMoveCount()).toBe(6);
    });

    it('should return 0 for game with no moves', () => {
      const emptyPGN = `[Event "Empty"]
[Site "Test"]
[Date "2025.01.01"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "*"]

*`;
      const game = new ChessGame(emptyPGN);
      expect(game.getMoveCount()).toBe(0);
    });
  });

  describe('getHeaders', () => {
    const game = new ChessGame(VALID_PGN);

    it('should return PGN headers', () => {
      const headers = game.getHeaders();
      expect(headers.Event).toBe('Test Game');
      expect(headers.White).toBe('Player 1');
      expect(headers.Black).toBe('Player 2');
      expect(headers.Result).toBe('1-0');
    });

    it('should return a copy of headers', () => {
      const headers1 = game.getHeaders();
      const headers2 = game.getHeaders();
      expect(headers1).not.toBe(headers2);
      expect(headers1).toEqual(headers2);
    });
  });

  describe('getPGN', () => {
    it('should return the original PGN string', () => {
      const game = new ChessGame(VALID_PGN);
      expect(game.getPGN()).toBe(VALID_PGN);
    });
  });

  describe('getPositionAtPly', () => {
    const game = new ChessGame(VALID_PGN);

    it('should return starting position for ply -1', () => {
      const position = game.getPositionAtPly(-1);
      expect(position.fen).toContain('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    });

    it('should return position after first move', () => {
      const position = game.getPositionAtPly(0);
      // After e4, the pawn should be on the 4th rank
      expect(position.fen).toContain('4P3');
    });

    it('should return correct turn for each position', () => {
      const positionAfterWhite = game.getPositionAtPly(0);
      expect(positionAfterWhite.turn).toBe('b');

      const positionAfterBlack = game.getPositionAtPly(1);
      expect(positionAfterBlack.turn).toBe('w');
    });
  });

  describe('getParsedPGN', () => {
    const game = new ChessGame(VALID_PGN);

    it('should return parsed PGN structure', () => {
      const parsed = game.getParsedPGN();
      expect(parsed).toHaveProperty('headers');
      expect(parsed).toHaveProperty('moves');
      expect(parsed).toHaveProperty('pgn');
    });

    it('should have correct headers in parsed PGN', () => {
      const parsed = game.getParsedPGN();
      expect(parsed.headers.Event).toBe('Test Game');
    });

    it('should have correct moves in parsed PGN', () => {
      const parsed = game.getParsedPGN();
      expect(parsed.moves).toHaveLength(6);
      expect(parsed.moves[0].san).toBe('e4');
    });
  });
});
