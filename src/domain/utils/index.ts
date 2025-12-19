/**
 * Utility Functions Module
 *
 * Core utilities for state management, persistence, and content adaptation.
 */

export {
  encodeGameState,
  decodeGameState,
  sanitizeGameState,
  createGameUrl,
  extractGameStateFromUrl,
} from './urlState';
export type { GameState } from './urlState';

export {
  savePlayerProfile,
  loadPlayerProfile,
  clearPlayerProfile,
  hasPlayerProfile,
  getPlayerArchetype,
  updatePlayerArchetype,
  isLocalStorageAvailable,
  getStoredVersion,
  needsMigration,
} from './localStorage';
export type { PlayerProfile } from './localStorage';

export {
  adaptAnnotation,
  getRecommendedContentTypes,
  formatMoveExplanation,
  getDifficultyLabel,
} from './languageAdapter';
