import { renderHook, act, waitFor } from '@testing-library/react';
import { ArchetypeProvider, useArchetype } from '../ArchetypeContext';
import * as localStorageUtils from '@domain/utils/localStorage';

// Mock localStorage utilities
jest.mock('@domain/utils/localStorage');

const mockLoadPlayerProfile =
  localStorageUtils.loadPlayerProfile as jest.MockedFunction<
    typeof localStorageUtils.loadPlayerProfile
  >;
const mockSavePlayerProfile =
  localStorageUtils.savePlayerProfile as jest.MockedFunction<
    typeof localStorageUtils.savePlayerProfile
  >;
const mockClearPlayerProfile =
  localStorageUtils.clearPlayerProfile as jest.MockedFunction<
    typeof localStorageUtils.clearPlayerProfile
  >;

describe('ArchetypeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with null archetype when no profile exists', async () => {
      mockLoadPlayerProfile.mockReturnValue(null);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.archetype).toBeNull();
      expect(result.current.confidence).toBeNull();
      expect(result.current.hasArchetype()).toBe(false);
    });

    it('should load existing profile from localStorage on mount', async () => {
      const mockProfile = {
        archetype: 'TJ' as const,
        confidence: 85,
        determinedAt: Date.now(),
      };
      mockLoadPlayerProfile.mockReturnValue(mockProfile);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.archetype).toBe('TJ');
      expect(result.current.confidence).toBe(85);
      expect(result.current.hasArchetype()).toBe(true);
      expect(mockLoadPlayerProfile).toHaveBeenCalledTimes(1);
    });

    it('should set isLoading to false after initialization', async () => {
      mockLoadPlayerProfile.mockReturnValue(null);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      // isLoading may already be false due to fast initialization
      // The important thing is that it ends up false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('setArchetype', () => {
    it('should update archetype and save to localStorage', async () => {
      mockLoadPlayerProfile.mockReturnValue(null);
      mockSavePlayerProfile.mockReturnValue(true);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setArchetype('FP', 90);
      });

      expect(result.current.archetype).toBe('FP');
      expect(result.current.confidence).toBe(90);
      expect(result.current.hasArchetype()).toBe(true);
      expect(mockSavePlayerProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          archetype: 'FP',
          confidence: 90,
          determinedAt: expect.any(Number),
        })
      );
    });

    it('should handle all archetype types', async () => {
      mockLoadPlayerProfile.mockReturnValue(null);
      mockSavePlayerProfile.mockReturnValue(true);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const archetypes: Array<'TJ' | 'TP' | 'FJ' | 'FP' | 'Neutral'> = [
        'TJ',
        'TP',
        'FJ',
        'FP',
        'Neutral',
      ];

      for (const archetype of archetypes) {
        act(() => {
          result.current.setArchetype(archetype, 85);
        });

        expect(result.current.archetype).toBe(archetype);
        expect(result.current.confidence).toBe(85);
      }
    });

    it('should overwrite existing archetype', async () => {
      const mockProfile = {
        archetype: 'TJ' as const,
        confidence: 85,
        determinedAt: Date.now(),
      };
      mockLoadPlayerProfile.mockReturnValue(mockProfile);
      mockSavePlayerProfile.mockReturnValue(true);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.archetype).toBe('TJ');

      act(() => {
        result.current.setArchetype('FP', 92);
      });

      expect(result.current.archetype).toBe('FP');
      expect(result.current.confidence).toBe(92);
    });
  });

  describe('resetArchetype', () => {
    it('should clear archetype and remove from localStorage', async () => {
      const mockProfile = {
        archetype: 'TJ' as const,
        confidence: 85,
        determinedAt: Date.now(),
      };
      mockLoadPlayerProfile.mockReturnValue(mockProfile);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.archetype).toBe('TJ');
      expect(result.current.hasArchetype()).toBe(true);

      act(() => {
        result.current.resetArchetype();
      });

      expect(result.current.archetype).toBeNull();
      expect(result.current.confidence).toBeNull();
      expect(result.current.hasArchetype()).toBe(false);
      expect(mockClearPlayerProfile).toHaveBeenCalledTimes(1);
    });

    it('should be idempotent when called multiple times', async () => {
      mockLoadPlayerProfile.mockReturnValue(null);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.resetArchetype();
        result.current.resetArchetype();
        result.current.resetArchetype();
      });

      expect(result.current.archetype).toBeNull();
      expect(result.current.confidence).toBeNull();
      expect(mockClearPlayerProfile).toHaveBeenCalledTimes(3);
    });
  });

  describe('hasArchetype', () => {
    it('should return false when no archetype is set', async () => {
      mockLoadPlayerProfile.mockReturnValue(null);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasArchetype()).toBe(false);
    });

    it('should return true when archetype is set', async () => {
      mockLoadPlayerProfile.mockReturnValue(null);
      mockSavePlayerProfile.mockReturnValue(true);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setArchetype('TJ', 85);
      });

      expect(result.current.hasArchetype()).toBe(true);
    });

    it('should return false after reset', async () => {
      const mockProfile = {
        archetype: 'TJ' as const,
        confidence: 85,
        determinedAt: Date.now(),
      };
      mockLoadPlayerProfile.mockReturnValue(mockProfile);

      const { result } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasArchetype()).toBe(true);

      act(() => {
        result.current.resetArchetype();
      });

      expect(result.current.hasArchetype()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw error when useArchetype is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useArchetype());
      }).toThrow('useArchetype must be used within an ArchetypeProvider');

      console.error = originalError;
    });
  });

  describe('persistence', () => {
    it('should persist archetype across re-renders', async () => {
      const mockProfile = {
        archetype: 'TJ' as const,
        confidence: 85,
        determinedAt: Date.now(),
      };
      mockLoadPlayerProfile.mockReturnValue(mockProfile);

      const { result, rerender } = renderHook(() => useArchetype(), {
        wrapper: ArchetypeProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.archetype).toBe('TJ');

      rerender();

      expect(result.current.archetype).toBe('TJ');
      expect(result.current.confidence).toBe(85);
    });
  });
});
