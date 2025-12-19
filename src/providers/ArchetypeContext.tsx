import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  loadPlayerProfile,
  savePlayerProfile,
  clearPlayerProfile,
  PlayerProfile,
} from '@domain/utils/localStorage';
import { Archetype } from '@domain/quiz/types';

interface ArchetypeContextValue {
  archetype: Archetype | null;
  confidence: number | null;
  isLoading: boolean;
  setArchetype: (archetype: Archetype, confidence: number) => void;
  resetArchetype: () => void;
  hasArchetype: () => boolean;
}

const ArchetypeContext = createContext<ArchetypeContextValue | undefined>(
  undefined
);

interface ArchetypeProviderProps {
  children: ReactNode;
}

export function ArchetypeProvider({ children }: ArchetypeProviderProps) {
  const [archetype, setArchetypeState] = useState<Archetype | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load player profile from localStorage on mount
  useEffect(() => {
    const profile = loadPlayerProfile();
    if (profile) {
      setArchetypeState(profile.archetype);
      setConfidence(profile.confidence);
    }
    setIsLoading(false);
  }, []);

  const setArchetype = (newArchetype: Archetype, newConfidence: number) => {
    setArchetypeState(newArchetype);
    setConfidence(newConfidence);

    const profile: PlayerProfile = {
      archetype: newArchetype,
      confidence: newConfidence,
      determinedAt: Date.now(),
    };

    savePlayerProfile(profile);
  };

  const resetArchetype = () => {
    setArchetypeState(null);
    setConfidence(null);
    clearPlayerProfile();
  };

  const hasArchetype = () => {
    return archetype !== null;
  };

  const value: ArchetypeContextValue = {
    archetype,
    confidence,
    isLoading,
    setArchetype,
    resetArchetype,
    hasArchetype,
  };

  return (
    <ArchetypeContext.Provider value={value}>
      {children}
    </ArchetypeContext.Provider>
  );
}

export function useArchetype(): ArchetypeContextValue {
  const context = useContext(ArchetypeContext);
  if (context === undefined) {
    throw new Error('useArchetype must be used within an ArchetypeProvider');
  }
  return context;
}
