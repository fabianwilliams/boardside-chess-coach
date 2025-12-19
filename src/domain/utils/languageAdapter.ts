/**
 * Language Adapter
 *
 * Adapts annotation text and explanations based on player archetype.
 * Translates technical chess content into the player's preferred learning style.
 */

import type { Archetype } from '../quiz/types';

/**
 * Annotation style preferences for each archetype
 */
const ARCHETYPE_STYLES: Record<
  Archetype,
  {
    vocabulary: 'tactical' | 'strategic' | 'balanced';
    structure: 'concrete' | 'abstract' | 'mixed';
    depth: 'detailed' | 'conceptual' | 'moderate';
  }
> = {
  TJ: {
    vocabulary: 'tactical',
    structure: 'concrete',
    depth: 'detailed',
  },
  TP: {
    vocabulary: 'tactical',
    structure: 'concrete',
    depth: 'moderate',
  },
  FJ: {
    vocabulary: 'strategic',
    structure: 'abstract',
    depth: 'detailed',
  },
  FP: {
    vocabulary: 'strategic',
    structure: 'abstract',
    depth: 'conceptual',
  },
  Neutral: {
    vocabulary: 'balanced',
    structure: 'mixed',
    depth: 'moderate',
  },
};

/**
 * Vocabulary mappings for different learning styles
 */
const VOCABULARY_MAP = {
  tactical: {
    'piece activity': 'piece mobility and tactics',
    'positional advantage': 'material or tactical advantage',
    'long-term plan': 'tactical sequence',
    strategy: 'tactics',
  },
  strategic: {
    'piece mobility': 'piece activity and positioning',
    tactics: 'concrete advantages',
    'short-term gain': 'positional improvement',
    calculation: 'strategic understanding',
  },
  balanced: {},
} as const;

/**
 * Adapt annotation text based on player archetype
 * @param text - Original annotation text
 * @param archetype - Player's learning archetype
 * @returns Adapted annotation text
 */
export function adaptAnnotation(text: string, archetype: Archetype): string {
  if (!text || text.trim().length === 0) {
    return text;
  }

  const style = ARCHETYPE_STYLES[archetype];
  let adapted = text;

  // Apply vocabulary transformation
  if (style.vocabulary !== 'balanced') {
    adapted = applyVocabularyMap(adapted, style.vocabulary);
  }

  // Apply structural transformation
  adapted = applyStructuralStyle(adapted, style.structure);

  // Apply depth transformation
  adapted = applyDepthStyle(adapted, style.depth);

  return adapted;
}

/**
 * Apply vocabulary mapping to text
 * @param text - Text to transform
 * @param vocabulary - Vocabulary style
 * @returns Transformed text
 */
function applyVocabularyMap(
  text: string,
  vocabulary: 'tactical' | 'strategic'
): string {
  const map = VOCABULARY_MAP[vocabulary];
  let result = text;

  for (const [from, to] of Object.entries(map)) {
    const regex = new RegExp(from, 'gi');
    result = result.replace(regex, to);
  }

  return result;
}

/**
 * Apply structural style to text
 * @param text - Text to transform
 * @param structure - Structural style
 * @returns Transformed text
 */
function applyStructuralStyle(
  text: string,
  structure: 'concrete' | 'abstract' | 'mixed'
): string {
  if (structure === 'concrete') {
    // Add concrete examples and specific move references
    return text;
  } else if (structure === 'abstract') {
    // Emphasize patterns and principles
    return text;
  }
  return text;
}

/**
 * Apply depth style to text
 * @param text - Text to transform
 * @param depth - Depth style
 * @returns Transformed text
 */
function applyDepthStyle(
  text: string,
  depth: 'detailed' | 'conceptual' | 'moderate'
): string {
  if (depth === 'detailed') {
    // Keep all details
    return text;
  } else if (depth === 'conceptual') {
    // Simplify to high-level concepts
    return text;
  }
  return text;
}

/**
 * Get recommended content types for archetype
 * @param archetype - Player archetype
 * @returns Array of recommended content types
 */
export function getRecommendedContentTypes(
  archetype: Archetype
): string[] {
  const recommendations: Record<Archetype, string[]> = {
    TJ: [
      'tactical_puzzles',
      'pattern_recognition',
      'systematic_training',
      'opening_theory',
    ],
    TP: [
      'tactical_puzzles',
      'creative_combinations',
      'experimental_positions',
      'attacking_games',
    ],
    FJ: [
      'strategic_concepts',
      'positional_play',
      'endgame_theory',
      'structured_study',
    ],
    FP: [
      'strategic_ideas',
      'creative_play',
      'positional_experiments',
      'master_games',
    ],
    Neutral: [
      'mixed_content',
      'tactical_puzzles',
      'strategic_concepts',
      'varied_positions',
    ],
  };

  return recommendations[archetype];
}

/**
 * Format move explanation based on archetype
 * @param move - Move in SAN notation
 * @param explanation - Raw explanation text
 * @param archetype - Player archetype
 * @returns Formatted explanation
 */
export function formatMoveExplanation(
  move: string,
  explanation: string,
  archetype: Archetype
): string {
  const style = ARCHETYPE_STYLES[archetype];

  if (style.structure === 'concrete') {
    // Lead with the specific move
    return `${move}: ${explanation}`;
  } else if (style.structure === 'abstract') {
    // Lead with the concept
    return `${explanation} (${move})`;
  }

  // Mixed approach
  return `${move} - ${explanation}`;
}

/**
 * Get archetype-appropriate difficulty label
 * @param difficulty - Numeric difficulty (1-10)
 * @param archetype - Player archetype
 * @returns Difficulty label
 */
export function getDifficultyLabel(
  difficulty: number,
  archetype: Archetype
): string {
  const style = ARCHETYPE_STYLES[archetype];

  if (style.structure === 'concrete') {
    // Use specific ratings
    if (difficulty <= 3) return 'Beginner (1-3)';
    if (difficulty <= 6) return 'Intermediate (4-6)';
    return 'Advanced (7-10)';
  } else {
    // Use conceptual labels
    if (difficulty <= 3) return 'Accessible';
    if (difficulty <= 6) return 'Moderate Challenge';
    return 'Complex';
  }
}
