/**
 * LocalStorage Unit Tests
 */

import {
  savePlayerProfile,
  loadPlayerProfile,
  clearPlayerProfile,
  hasPlayerProfile,
  getPlayerArchetype,
  updatePlayerArchetype,
  isLocalStorageAvailable,
  getStoredVersion,
  needsMigration,
} from '../localStorage';
import type { PlayerProfile } from '../localStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('localStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const validProfile: PlayerProfile = {
    archetype: 'TJ',
    determinedAt: Date.now(),
    confidence: 85,
  };

  describe('savePlayerProfile', () => {
    it('should save player profile to localStorage', () => {
      const result = savePlayerProfile(validProfile);
      expect(result).toBe(true);

      const stored = localStorage.getItem('boardside_player_profile');
      expect(stored).toBeDefined();
    });

    it('should save all profile fields', () => {
      savePlayerProfile(validProfile);
      const stored = localStorage.getItem('boardside_player_profile');
      const parsed = JSON.parse(stored!);

      expect(parsed.archetype).toBe(validProfile.archetype);
      expect(parsed.determinedAt).toBe(validProfile.determinedAt);
      expect(parsed.confidence).toBe(validProfile.confidence);
    });

    it('should save app version', () => {
      savePlayerProfile(validProfile);
      const version = localStorage.getItem('boardside_app_version');
      expect(version).toBeDefined();
    });
  });

  describe('loadPlayerProfile', () => {
    it('should load saved profile', () => {
      savePlayerProfile(validProfile);
      const loaded = loadPlayerProfile();
      expect(loaded).toEqual(validProfile);
    });

    it('should return null if no profile exists', () => {
      const loaded = loadPlayerProfile();
      expect(loaded).toBeNull();
    });

    it('should return null for corrupted data', () => {
      localStorage.setItem('boardside_player_profile', 'corrupted json');
      const loaded = loadPlayerProfile();
      expect(loaded).toBeNull();
    });

    it('should clear corrupted data', () => {
      localStorage.setItem('boardside_player_profile', 'corrupted');
      loadPlayerProfile();
      const stored = localStorage.getItem('boardside_player_profile');
      expect(stored).toBeNull();
    });

    it('should validate profile structure', () => {
      const invalidProfile = {
        archetype: 'TJ',
        // Missing determinedAt and confidence
      };
      localStorage.setItem(
        'boardside_player_profile',
        JSON.stringify(invalidProfile)
      );

      const loaded = loadPlayerProfile();
      expect(loaded).toBeNull();
    });

    it('should reject invalid archetype values', () => {
      const invalidProfile = {
        archetype: 'INVALID',
        determinedAt: Date.now(),
        confidence: 80,
      };
      localStorage.setItem(
        'boardside_player_profile',
        JSON.stringify(invalidProfile)
      );

      const loaded = loadPlayerProfile();
      expect(loaded).toBeNull();
    });
  });

  describe('clearPlayerProfile', () => {
    it('should remove profile from localStorage', () => {
      savePlayerProfile(validProfile);
      clearPlayerProfile();
      const stored = localStorage.getItem('boardside_player_profile');
      expect(stored).toBeNull();
    });

    it('should not throw if profile does not exist', () => {
      expect(() => clearPlayerProfile()).not.toThrow();
    });
  });

  describe('hasPlayerProfile', () => {
    it('should return false initially', () => {
      expect(hasPlayerProfile()).toBe(false);
    });

    it('should return true after saving profile', () => {
      savePlayerProfile(validProfile);
      expect(hasPlayerProfile()).toBe(true);
    });

    it('should return false for invalid profile', () => {
      localStorage.setItem('boardside_player_profile', 'invalid');
      expect(hasPlayerProfile()).toBe(false);
    });
  });

  describe('getPlayerArchetype', () => {
    it('should return archetype from saved profile', () => {
      savePlayerProfile(validProfile);
      const archetype = getPlayerArchetype();
      expect(archetype).toBe('TJ');
    });

    it('should return null if no profile exists', () => {
      const archetype = getPlayerArchetype();
      expect(archetype).toBeNull();
    });
  });

  describe('updatePlayerArchetype', () => {
    it('should update archetype', () => {
      const result = updatePlayerArchetype('FP', 90);
      expect(result).toBe(true);

      const profile = loadPlayerProfile();
      expect(profile?.archetype).toBe('FP');
      expect(profile?.confidence).toBe(90);
    });

    it('should set determinedAt timestamp', () => {
      const before = Date.now();
      updatePlayerArchetype('TJ', 80);
      const after = Date.now();

      const profile = loadPlayerProfile();
      expect(profile?.determinedAt).toBeGreaterThanOrEqual(before);
      expect(profile?.determinedAt).toBeLessThanOrEqual(after);
    });

    it('should overwrite existing profile', () => {
      savePlayerProfile(validProfile);
      updatePlayerArchetype('TP', 75);

      const profile = loadPlayerProfile();
      expect(profile?.archetype).toBe('TP');
      expect(profile?.confidence).toBe(75);
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true with working localStorage', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false if localStorage throws', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      expect(isLocalStorageAvailable()).toBe(false);

      localStorage.setItem = originalSetItem;
    });
  });

  describe('getStoredVersion', () => {
    it('should return null initially', () => {
      expect(getStoredVersion()).toBeNull();
    });

    it('should return version after saving profile', () => {
      savePlayerProfile(validProfile);
      const version = getStoredVersion();
      expect(version).toBeDefined();
    });
  });

  describe('needsMigration', () => {
    it('should return false initially', () => {
      expect(needsMigration()).toBe(false);
    });

    it('should return false for current version', () => {
      savePlayerProfile(validProfile);
      expect(needsMigration()).toBe(false);
    });

    it('should return true for different version', () => {
      localStorage.setItem('boardside_app_version', '0.9.0');
      expect(needsMigration()).toBe(true);
    });
  });

  describe('validation edge cases', () => {
    it('should reject profile with invalid confidence', () => {
      const profile = {
        archetype: 'TJ',
        determinedAt: Date.now(),
        confidence: NaN,
      };
      localStorage.setItem(
        'boardside_player_profile',
        JSON.stringify(profile)
      );

      expect(loadPlayerProfile()).toBeNull();
    });

    it('should reject profile with invalid determinedAt', () => {
      const profile = {
        archetype: 'TJ',
        determinedAt: NaN,
        confidence: 80,
      };
      localStorage.setItem(
        'boardside_player_profile',
        JSON.stringify(profile)
      );

      expect(loadPlayerProfile()).toBeNull();
    });

    it('should reject non-object profile', () => {
      localStorage.setItem('boardside_player_profile', JSON.stringify('string'));
      expect(loadPlayerProfile()).toBeNull();
    });

    it('should reject null profile', () => {
      localStorage.setItem('boardside_player_profile', JSON.stringify(null));
      expect(loadPlayerProfile()).toBeNull();
    });
  });
});
