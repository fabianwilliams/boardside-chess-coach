/**
 * MoveNavigator
 *
 * Handles navigation through chess game move history.
 * Provides methods to move forward, backward, and jump to specific positions.
 */

import type { ChessGame } from './ChessGame';
import type { Move, Position } from './types';

/**
 * MoveNavigator class - manages current position in move history
 */
export class MoveNavigator {
  private game: ChessGame;
  private currentPly: number;

  /**
   * Creates a new MoveNavigator for a chess game
   * @param game - ChessGame instance to navigate
   * @param startingPly - Initial ply position (default: -1, starting position)
   */
  constructor(game: ChessGame, startingPly: number = -1) {
    this.game = game;
    this.currentPly = startingPly;
  }

  /**
   * Move to the next ply
   * @returns true if successful, false if already at end
   */
  next(): boolean {
    const maxPly = this.game.getMoveCount() - 1;
    if (this.currentPly >= maxPly) {
      return false;
    }
    this.currentPly++;
    return true;
  }

  /**
   * Move to the previous ply
   * @returns true if successful, false if already at start
   */
  previous(): boolean {
    if (this.currentPly < 0) {
      return false;
    }
    this.currentPly--;
    return true;
  }

  /**
   * Move to the first position (starting position)
   * @returns true if position changed, false if already at start
   */
  first(): boolean {
    if (this.currentPly === -1) {
      return false;
    }
    this.currentPly = -1;
    return true;
  }

  /**
   * Move to the last position (end of game)
   * @returns true if position changed, false if already at end
   */
  last(): boolean {
    const maxPly = this.game.getMoveCount() - 1;
    if (this.currentPly === maxPly) {
      return false;
    }
    this.currentPly = maxPly;
    return true;
  }

  /**
   * Jump to a specific ply
   * @param ply - Target ply number (-1 for starting position)
   * @returns true if successful, false if ply is out of range
   */
  goToMove(ply: number): boolean {
    const maxPly = this.game.getMoveCount() - 1;
    if (ply < -1 || ply > maxPly) {
      return false;
    }
    this.currentPly = ply;
    return true;
  }

  /**
   * Get the current ply number
   * @returns Current ply (-1 for starting position)
   */
  getCurrentPly(): number {
    return this.currentPly;
  }

  /**
   * Get the current move (if not at starting position)
   * @returns Current Move object or undefined
   */
  getCurrentMove(): Move | undefined {
    if (this.currentPly < 0) {
      return undefined;
    }
    return this.game.getMoveAt(this.currentPly);
  }

  /**
   * Get the current position
   * @returns Position object for current ply
   */
  getCurrentPosition(): Position {
    return this.game.getPositionAtPly(this.currentPly);
  }

  /**
   * Check if at the start of the game
   * @returns true if at starting position
   */
  isAtStart(): boolean {
    return this.currentPly === -1;
  }

  /**
   * Check if at the end of the game
   * @returns true if at last move
   */
  isAtEnd(): boolean {
    return this.currentPly === this.game.getMoveCount() - 1;
  }

  /**
   * Check if can move forward
   * @returns true if not at end
   */
  canMoveForward(): boolean {
    return this.currentPly < this.game.getMoveCount() - 1;
  }

  /**
   * Check if can move backward
   * @returns true if not at start
   */
  canMoveBackward(): boolean {
    return this.currentPly >= 0;
  }

  /**
   * Get the move number for the current position
   * @returns Full move number (1-indexed)
   */
  getCurrentMoveNumber(): number {
    if (this.currentPly < 0) {
      return 1;
    }
    return Math.floor(this.currentPly / 2) + 1;
  }

  /**
   * Reset navigator to starting position
   */
  reset(): void {
    this.currentPly = -1;
  }
}
