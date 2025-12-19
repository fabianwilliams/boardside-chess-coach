/**
 * Language Adapter Unit Tests
 */

import {
  adaptAnnotation,
  getRecommendedContentTypes,
  formatMoveExplanation,
  getDifficultyLabel,
} from '../languageAdapter';
import type { Archetype } from '../../quiz/types';

describe('languageAdapter', () => {
  describe('adaptAnnotation', () => {
    const testText = 'This move improves piece activity and creates a positional advantage.';

    it('should return text unchanged for empty input', () => {
      expect(adaptAnnotation('', 'TJ')).toBe('');
      expect(adaptAnnotation('   ', 'TJ')).toBe('   ');
    });

    it('should adapt text for TJ archetype', () => {
      const adapted = adaptAnnotation(testText, 'TJ');
      expect(typeof adapted).toBe('string');
      expect(adapted.length).toBeGreaterThan(0);
    });

    it('should adapt text for TP archetype', () => {
      const adapted = adaptAnnotation(testText, 'TP');
      expect(adapted).toBeDefined();
    });

    it('should adapt text for FJ archetype', () => {
      const adapted = adaptAnnotation(testText, 'FJ');
      expect(adapted).toBeDefined();
    });

    it('should adapt text for FP archetype', () => {
      const adapted = adaptAnnotation(testText, 'FP');
      expect(adapted).toBeDefined();
    });

    it('should handle Neutral archetype', () => {
      const adapted = adaptAnnotation(testText, 'Neutral');
      expect(adapted).toBe(testText); // Neutral should not change much
    });

    it('should apply vocabulary mapping for tactical archetype', () => {
      const strategicText = 'Focus on positional advantage';
      const adapted = adaptAnnotation(strategicText, 'TJ');
      // Should transform strategic terms to tactical
      expect(adapted).toContain('material or tactical advantage');
    });

    it('should apply vocabulary mapping for strategic archetype', () => {
      const tacticalText = 'Calculate the tactics carefully';
      const adapted = adaptAnnotation(tacticalText, 'FJ');
      // Should transform tactical terms to strategic
      expect(adapted).toContain('concrete advantages');
    });

    it('should handle long text', () => {
      const longText = 'A'.repeat(1000);
      const adapted = adaptAnnotation(longText, 'TJ');
      expect(adapted.length).toBe(1000);
    });
  });

  describe('getRecommendedContentTypes', () => {
    it('should return recommendations for TJ', () => {
      const types = getRecommendedContentTypes('TJ');
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
      expect(types).toContain('tactical_puzzles');
      expect(types).toContain('systematic_training');
    });

    it('should return recommendations for TP', () => {
      const types = getRecommendedContentTypes('TP');
      expect(types).toContain('tactical_puzzles');
      expect(types).toContain('creative_combinations');
    });

    it('should return recommendations for FJ', () => {
      const types = getRecommendedContentTypes('FJ');
      expect(types).toContain('strategic_concepts');
      expect(types).toContain('structured_study');
    });

    it('should return recommendations for FP', () => {
      const types = getRecommendedContentTypes('FP');
      expect(types).toContain('strategic_ideas');
      expect(types).toContain('creative_play');
    });

    it('should return recommendations for Neutral', () => {
      const types = getRecommendedContentTypes('Neutral');
      expect(types).toContain('mixed_content');
    });

    it('should return unique recommendations for each archetype', () => {
      const archetypes: Archetype[] = ['TJ', 'TP', 'FJ', 'FP', 'Neutral'];
      const allRecommendations = archetypes.map((a) =>
        getRecommendedContentTypes(a)
      );

      // Each archetype should have different recommendations
      expect(allRecommendations[0]).not.toEqual(allRecommendations[2]);
      expect(allRecommendations[1]).not.toEqual(allRecommendations[3]);
    });
  });

  describe('formatMoveExplanation', () => {
    const move = 'Nf3';
    const explanation = 'Develops the knight and controls the center';

    it('should format for concrete structure (TJ/TP)', () => {
      const formatted = formatMoveExplanation(move, explanation, 'TJ');
      expect(formatted).toContain(move);
      expect(formatted).toContain(explanation);
      expect(formatted.startsWith(move)).toBe(true);
    });

    it('should format for abstract structure (FJ/FP)', () => {
      const formatted = formatMoveExplanation(move, explanation, 'FJ');
      expect(formatted).toContain(move);
      expect(formatted).toContain(explanation);
      expect(formatted.startsWith(explanation)).toBe(true);
    });

    it('should format for Neutral', () => {
      const formatted = formatMoveExplanation(move, explanation, 'Neutral');
      expect(formatted).toContain(move);
      expect(formatted).toContain(explanation);
    });

    it('should handle empty explanation', () => {
      const formatted = formatMoveExplanation(move, '', 'TJ');
      expect(formatted).toContain(move);
    });

    it('should handle special characters in move', () => {
      const formatted = formatMoveExplanation('O-O-O', explanation, 'TJ');
      expect(formatted).toContain('O-O-O');
    });
  });

  describe('getDifficultyLabel', () => {
    it('should return beginner label for easy difficulty (concrete)', () => {
      const label = getDifficultyLabel(2, 'TJ');
      expect(label).toContain('Beginner');
    });

    it('should return intermediate label for medium difficulty (concrete)', () => {
      const label = getDifficultyLabel(5, 'TJ');
      expect(label).toContain('Intermediate');
    });

    it('should return advanced label for hard difficulty (concrete)', () => {
      const label = getDifficultyLabel(8, 'TJ');
      expect(label).toContain('Advanced');
    });

    it('should return conceptual labels for abstract structure', () => {
      const easyLabel = getDifficultyLabel(2, 'FJ');
      const mediumLabel = getDifficultyLabel(5, 'FJ');
      const hardLabel = getDifficultyLabel(8, 'FJ');

      expect(easyLabel).toContain('Accessible');
      expect(mediumLabel).toContain('Moderate');
      expect(hardLabel).toContain('Complex');
    });

    it('should handle boundary values', () => {
      expect(getDifficultyLabel(1, 'TJ')).toContain('Beginner');
      expect(getDifficultyLabel(3, 'TJ')).toContain('Beginner');
      expect(getDifficultyLabel(4, 'TJ')).toContain('Intermediate');
      expect(getDifficultyLabel(6, 'TJ')).toContain('Intermediate');
      expect(getDifficultyLabel(7, 'TJ')).toContain('Advanced');
      expect(getDifficultyLabel(10, 'TJ')).toContain('Advanced');
    });

    it('should handle edge case difficulty values', () => {
      expect(getDifficultyLabel(0, 'TJ')).toBeDefined();
      expect(getDifficultyLabel(11, 'TJ')).toBeDefined();
    });

    it('should differentiate between concrete and abstract styles', () => {
      const concreteLabel = getDifficultyLabel(5, 'TJ');
      const abstractLabel = getDifficultyLabel(5, 'FJ');
      expect(concreteLabel).not.toBe(abstractLabel);
    });
  });

  describe('integration', () => {
    it('should provide consistent experience for TJ archetype', () => {
      const annotation = adaptAnnotation('Focus on tactics', 'TJ');
      const types = getRecommendedContentTypes('TJ');
      const format = formatMoveExplanation('e4', 'Good opening', 'TJ');
      const difficulty = getDifficultyLabel(5, 'TJ');

      expect(annotation).toBeDefined();
      expect(types).toContain('tactical_puzzles');
      expect(format.startsWith('e4')).toBe(true);
      expect(difficulty).toContain('Intermediate');
    });

    it('should provide consistent experience for FP archetype', () => {
      const annotation = adaptAnnotation('Strategic play', 'FP');
      const types = getRecommendedContentTypes('FP');
      const format = formatMoveExplanation('d4', 'Solid move', 'FP');
      const difficulty = getDifficultyLabel(5, 'FP');

      expect(annotation).toBeDefined();
      expect(types).toContain('strategic_ideas');
      expect(format.startsWith('Solid move')).toBe(true);
      expect(difficulty).toContain('Moderate');
    });
  });
});
