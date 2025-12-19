/**
 * MoveNavigator Unit Tests
 */

import { ChessGame } from '../ChessGame';
import { MoveNavigator } from '../MoveNavigator';

const TEST_PGN = `[Event "Test"]
[Site "Test"]
[Date "2025.01.01"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *`;

describe('MoveNavigator', () => {
  let game: ChessGame;
  let navigator: MoveNavigator;

  beforeEach(() => {
    game = new ChessGame(TEST_PGN);
    navigator = new MoveNavigator(game);
  });

  describe('constructor', () => {
    it('should create navigator at starting position by default', () => {
      expect(navigator.getCurrentPly()).toBe(-1);
      expect(navigator.isAtStart()).toBe(true);
    });

    it('should create navigator at specified ply', () => {
      const nav = new MoveNavigator(game, 2);
      expect(nav.getCurrentPly()).toBe(2);
    });
  });

  describe('next', () => {
    it('should move to next ply', () => {
      const result = navigator.next();
      expect(result).toBe(true);
      expect(navigator.getCurrentPly()).toBe(0);
    });

    it('should move through all plies', () => {
      for (let i = 0; i < game.getMoveCount(); i++) {
        expect(navigator.next()).toBe(true);
        expect(navigator.getCurrentPly()).toBe(i);
      }
    });

    it('should return false when at end', () => {
      navigator.last();
      expect(navigator.next()).toBe(false);
      expect(navigator.isAtEnd()).toBe(true);
    });
  });

  describe('previous', () => {
    beforeEach(() => {
      navigator.last();
    });

    it('should move to previous ply', () => {
      const lastPly = navigator.getCurrentPly();
      const result = navigator.previous();
      expect(result).toBe(true);
      expect(navigator.getCurrentPly()).toBe(lastPly - 1);
    });

    it('should return false when at start', () => {
      navigator.first();
      expect(navigator.previous()).toBe(false);
    });

    it('should move back through all plies', () => {
      const totalMoves = game.getMoveCount();
      for (let i = totalMoves - 1; i >= 0; i--) {
        expect(navigator.getCurrentPly()).toBe(i);
        navigator.previous();
      }
      expect(navigator.isAtStart()).toBe(true);
    });
  });

  describe('first', () => {
    it('should jump to starting position', () => {
      navigator.last();
      const result = navigator.first();
      expect(result).toBe(true);
      expect(navigator.getCurrentPly()).toBe(-1);
      expect(navigator.isAtStart()).toBe(true);
    });

    it('should return false if already at start', () => {
      const result = navigator.first();
      expect(result).toBe(false);
    });
  });

  describe('last', () => {
    it('should jump to last position', () => {
      const result = navigator.last();
      expect(result).toBe(true);
      expect(navigator.getCurrentPly()).toBe(game.getMoveCount() - 1);
      expect(navigator.isAtEnd()).toBe(true);
    });

    it('should return false if already at end', () => {
      navigator.last();
      const result = navigator.last();
      expect(result).toBe(false);
    });
  });

  describe('goToMove', () => {
    it('should jump to specified ply', () => {
      const result = navigator.goToMove(3);
      expect(result).toBe(true);
      expect(navigator.getCurrentPly()).toBe(3);
    });

    it('should allow jumping to starting position', () => {
      navigator.last();
      const result = navigator.goToMove(-1);
      expect(result).toBe(true);
      expect(navigator.isAtStart()).toBe(true);
    });

    it('should return false for invalid ply', () => {
      expect(navigator.goToMove(-2)).toBe(false);
      expect(navigator.goToMove(999)).toBe(false);
    });

    it('should allow jumping to any valid ply', () => {
      for (let ply = -1; ply < game.getMoveCount(); ply++) {
        expect(navigator.goToMove(ply)).toBe(true);
        expect(navigator.getCurrentPly()).toBe(ply);
      }
    });
  });

  describe('getCurrentPly', () => {
    it('should return current ply number', () => {
      expect(navigator.getCurrentPly()).toBe(-1);
      navigator.next();
      expect(navigator.getCurrentPly()).toBe(0);
      navigator.next();
      expect(navigator.getCurrentPly()).toBe(1);
    });
  });

  describe('getCurrentMove', () => {
    it('should return undefined at starting position', () => {
      expect(navigator.getCurrentMove()).toBeUndefined();
    });

    it('should return current move after advancing', () => {
      navigator.next();
      const move = navigator.getCurrentMove();
      expect(move).toBeDefined();
      expect(move?.san).toBe('e4');
    });

    it('should return correct move at each position', () => {
      const expectedMoves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'];
      for (let i = 0; i < expectedMoves.length; i++) {
        navigator.next();
        expect(navigator.getCurrentMove()?.san).toBe(expectedMoves[i]);
      }
    });
  });

  describe('getCurrentPosition', () => {
    it('should return position at current ply', () => {
      const position = navigator.getCurrentPosition();
      expect(position).toHaveProperty('fen');
      expect(position).toHaveProperty('turn');
    });

    it('should return starting position initially', () => {
      const position = navigator.getCurrentPosition();
      expect(position.fen).toContain('rnbqkbnr/pppppppp');
    });

    it('should return updated position after move', () => {
      navigator.next();
      const position = navigator.getCurrentPosition();
      expect(position.turn).toBe('b'); // Black's turn after white's e4
    });
  });

  describe('isAtStart', () => {
    it('should return true at starting position', () => {
      expect(navigator.isAtStart()).toBe(true);
    });

    it('should return false after moving forward', () => {
      navigator.next();
      expect(navigator.isAtStart()).toBe(false);
    });
  });

  describe('isAtEnd', () => {
    it('should return false at starting position', () => {
      expect(navigator.isAtEnd()).toBe(false);
    });

    it('should return true at last move', () => {
      navigator.last();
      expect(navigator.isAtEnd()).toBe(true);
    });
  });

  describe('canMoveForward', () => {
    it('should return true when not at end', () => {
      expect(navigator.canMoveForward()).toBe(true);
    });

    it('should return false at end', () => {
      navigator.last();
      expect(navigator.canMoveForward()).toBe(false);
    });
  });

  describe('canMoveBackward', () => {
    it('should return false at start', () => {
      expect(navigator.canMoveBackward()).toBe(false);
    });

    it('should return true after moving forward', () => {
      navigator.next();
      expect(navigator.canMoveBackward()).toBe(true);
    });
  });

  describe('getCurrentMoveNumber', () => {
    it('should return 1 at starting position', () => {
      expect(navigator.getCurrentMoveNumber()).toBe(1);
    });

    it('should return correct move number for each ply', () => {
      navigator.next(); // ply 0, move 1
      expect(navigator.getCurrentMoveNumber()).toBe(1);
      navigator.next(); // ply 1, move 1
      expect(navigator.getCurrentMoveNumber()).toBe(1);
      navigator.next(); // ply 2, move 2
      expect(navigator.getCurrentMoveNumber()).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset to starting position', () => {
      navigator.last();
      navigator.reset();
      expect(navigator.getCurrentPly()).toBe(-1);
      expect(navigator.isAtStart()).toBe(true);
    });

    it('should work from any position', () => {
      navigator.goToMove(3);
      navigator.reset();
      expect(navigator.isAtStart()).toBe(true);
    });
  });

  describe('integration', () => {
    it('should navigate forward and backward correctly', () => {
      // Move forward 3 times
      navigator.next();
      navigator.next();
      navigator.next();
      expect(navigator.getCurrentPly()).toBe(2);

      // Move backward 2 times
      navigator.previous();
      navigator.previous();
      expect(navigator.getCurrentPly()).toBe(0);

      // Jump to end
      navigator.last();
      expect(navigator.isAtEnd()).toBe(true);

      // Jump to start
      navigator.first();
      expect(navigator.isAtStart()).toBe(true);
    });
  });
});
