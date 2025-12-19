/**
 * Language Adapter
 *
 * Adapts chess annotation text to match different learning archetypes.
 * Uses pattern matching and keyword-based transformations to adjust tone and style.
 */

import { Archetype } from '@domain/quiz/types';

/**
 * Adaptation rules for each archetype
 */
const ARCHETYPE_PATTERNS: Record<
  Archetype,
  {
    prefixes: string[];
    connectors: string[];
    style: 'analytical' | 'exploratory' | 'intuitive' | 'creative' | 'balanced';
  }
> = {
  TJ: {
    // Thinking-Judging: Logical, step-by-step, structured
    prefixes: ['Logically,', 'Strategically,', 'Systematically,'],
    connectors: [
      'therefore',
      'consequently',
      'as a result',
      'this leads to',
    ],
    style: 'analytical',
  },
  TP: {
    // Thinking-Perceiving: Tactical, exploratory, flexible
    prefixes: ['Tactically,', 'Consider that', 'Interestingly,'],
    connectors: ['which allows', 'opening up', 'creating options for'],
    style: 'exploratory',
  },
  FJ: {
    // Feeling-Judging: Strategic, intuitive, structured
    prefixes: ['This naturally', 'The position feels', 'Intuitively,'],
    connectors: ['flows into', 'harmonizes with', 'creates a plan for'],
    style: 'intuitive',
  },
  FP: {
    // Feeling-Perceiving: Creative, pattern-based, experimental
    prefixes: ['Notice the pattern:', 'Creatively,', 'This resembles'],
    connectors: [
      'suggesting',
      'hinting at',
      'revealing possibilities for',
    ],
    style: 'creative',
  },
  Neutral: {
    // Neutral: Balanced, clear, direct
    prefixes: ['Note that', 'Here,', 'In this position,'],
    connectors: ['which', 'and', 'leading to'],
    style: 'balanced',
  },
};

/**
 * Adapt annotation text to match user's learning archetype
 *
 * @param text - Original annotation text
 * @param archetype - User's learning archetype
 * @returns Adapted text matching archetype preferences
 */
export function adapt(text: string, archetype: Archetype): string {
  if (!text || archetype === 'Neutral') {
    // No adaptation needed for Neutral or empty text
    return text;
  }

  const patterns = ARCHETYPE_PATTERNS[archetype];

  // For now, we'll do simple adaptations
  // In a full implementation, this would use more sophisticated NLP

  let adapted = text;

  // Add archetype-appropriate prefix for certain patterns
  if (
    !adapted.match(/^(This|The|Here|Note|Logically|Tactically|Intuitively)/)
  ) {
    const prefix = patterns.prefixes[0];
    adapted = `${prefix} ${adapted.charAt(0).toLowerCase()}${adapted.slice(1)}`;
  }

  // Replace generic connectors with archetype-specific ones
  adapted = adapted.replace(/\bwhich\b/i, patterns.connectors[0]);
  adapted = adapted.replace(/\band\b/i, patterns.connectors[1]);

  return adapted;
}

/**
 * Get learning style description for an archetype
 */
export function getArchetypeDescription(archetype: Archetype): string {
  const descriptions: Record<Archetype, string> = {
    TJ: 'You prefer logical, step-by-step analysis with clear structure.',
    TP: 'You enjoy tactical exploration and flexible problem-solving.',
    FJ: 'You learn through intuitive understanding and structured plans.',
    FP: 'You thrive on creative patterns and experimental play.',
    Neutral: 'You benefit from a balanced mix of learning approaches.',
  };

  return descriptions[archetype];
}
