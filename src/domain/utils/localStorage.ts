/**
 * LocalStorage Management
 *
 * Utilities for persisting player profile and archetype data.
 * Handles corrupted data and provides fallback defaults.
 */

import type { Archetype } from '../quiz/types';

/**
 * Player profile stored in localStorage
 */
export interface PlayerProfile {
  /** Player learning archetype */
  archetype: Archetype;
  /** When the archetype was determined */
  determinedAt: number;
  /** Confidence level when archetype was determined */
  confidence: number;
}

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  PLAYER_PROFILE: 'boardside_player_profile',
  APP_VERSION: 'boardside_app_version',
} as const;

/**
 * Current app version for data migration
 */
const APP_VERSION = '1.0.0';

/**
 * Save player profile to localStorage
 * @param profile - PlayerProfile to save
 * @returns true if successful, false otherwise
 */
export function savePlayerProfile(profile: PlayerProfile): boolean {
  try {
    const data = JSON.stringify(profile);
    localStorage.setItem(STORAGE_KEYS.PLAYER_PROFILE, data);
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, APP_VERSION);
    return true;
  } catch (error) {
    console.error('Failed to save player profile:', error);
    return false;
  }
}

/**
 * Load player profile from localStorage
 * @returns PlayerProfile or null if not found or corrupted
 */
export function loadPlayerProfile(): PlayerProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);

    if (!data) {
      return null;
    }

    const profile = JSON.parse(data);

    // Validate profile structure
    if (!isValidPlayerProfile(profile)) {
      console.warn('Invalid player profile found, clearing...');
      clearPlayerProfile();
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Failed to load player profile:', error);
    // Clear corrupted data
    clearPlayerProfile();
    return null;
  }
}

/**
 * Clear player profile from localStorage
 */
export function clearPlayerProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PLAYER_PROFILE);
  } catch (error) {
    console.error('Failed to clear player profile:', error);
  }
}

/**
 * Check if player profile exists
 * @returns true if profile exists and is valid
 */
export function hasPlayerProfile(): boolean {
  return loadPlayerProfile() !== null;
}

/**
 * Get player archetype from profile
 * @returns Archetype or null if not found
 */
export function getPlayerArchetype(): Archetype | null {
  const profile = loadPlayerProfile();
  return profile ? profile.archetype : null;
}

/**
 * Update player archetype
 * @param archetype - New archetype
 * @param confidence - Confidence level
 * @returns true if successful
 */
export function updatePlayerArchetype(
  archetype: Archetype,
  confidence: number
): boolean {
  const profile: PlayerProfile = {
    archetype,
    confidence,
    determinedAt: Date.now(),
  };

  return savePlayerProfile(profile);
}

/**
 * Validate player profile structure
 * @param profile - Object to validate
 * @returns true if valid
 */
function isValidPlayerProfile(profile: unknown): profile is PlayerProfile {
  if (!profile || typeof profile !== 'object') {
    return false;
  }

  const p = profile as Partial<PlayerProfile>;

  // Check required fields
  if (!p.archetype || typeof p.archetype !== 'string') {
    return false;
  }

  if (typeof p.determinedAt !== 'number' || isNaN(p.determinedAt)) {
    return false;
  }

  if (typeof p.confidence !== 'number' || isNaN(p.confidence)) {
    return false;
  }

  // Validate archetype value
  const validArchetypes: Archetype[] = ['TJ', 'TP', 'FJ', 'FP', 'Neutral'];
  if (!validArchetypes.includes(p.archetype as Archetype)) {
    return false;
  }

  return true;
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is supported and accessible
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__boardside_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get stored app version
 * @returns Version string or null
 */
export function getStoredVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.APP_VERSION);
  } catch {
    return null;
  }
}

/**
 * Check if data migration is needed
 * @returns true if migration needed
 */
export function needsMigration(): boolean {
  const storedVersion = getStoredVersion();
  return storedVersion !== null && storedVersion !== APP_VERSION;
}
