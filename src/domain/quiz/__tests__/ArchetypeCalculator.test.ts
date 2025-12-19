/**
 * ArchetypeCalculator Unit Tests
 */

import {
  calculateArchetype,
  calculateConfidence,
  hasClearArchetype,
} from '../ArchetypeCalculator';
import type { QuizResponse, Answer } from '../types';

describe('ArchetypeCalculator', () => {
  // Helper to create answer lookup
  const createAnswerLookup = (answers: Answer[]): Map<string, Answer> => {
    const lookup = new Map<string, Answer>();
    answers.forEach((answer) => lookup.set(answer.id, answer));
    return lookup;
  };

  describe('calculateArchetype', () => {
    it('should return Neutral for empty responses', () => {
      const result = calculateArchetype([], new Map());
      expect(result.archetype).toBe('Neutral');
      expect(result.confidence).toBe(0);
      expect(result.scoreTF).toBe(0);
      expect(result.scoreJP).toBe(0);
    });

    it('should calculate TJ archetype (Tactical-Structured)', () => {
      const answers: Answer[] = [
        { id: 'a1', text: 'Answer 1', scoreTF: 2, scoreJP: 2 },
        { id: 'a2', text: 'Answer 2', scoreTF: 2, scoreJP: 2 },
        { id: 'a3', text: 'Answer 3', scoreTF: 2, scoreJP: 2 },
      ];

      const responses: QuizResponse[] = [
        { questionId: 'q1', answerId: 'a1', timestamp: Date.now() },
        { questionId: 'q2', answerId: 'a2', timestamp: Date.now() },
        { questionId: 'q3', answerId: 'a3', timestamp: Date.now() },
      ];

      const result = calculateArchetype(responses, createAnswerLookup(answers));
      expect(result.archetype).toBe('TJ');
      expect(result.scoreTF).toBe(6);
      expect(result.scoreJP).toBe(6);
    });

    it('should calculate TP archetype (Tactical-Experimental)', () => {
      const answers: Answer[] = [
        { id: 'a1', text: 'Answer 1', scoreTF: 2, scoreJP: -2 },
        { id: 'a2', text: 'Answer 2', scoreTF: 2, scoreJP: -2 },
        { id: 'a3', text: 'Answer 3', scoreTF: 2, scoreJP: -2 },
      ];

      const responses: QuizResponse[] = [
        { questionId: 'q1', answerId: 'a1', timestamp: Date.now() },
        { questionId: 'q2', answerId: 'a2', timestamp: Date.now() },
        { questionId: 'q3', answerId: 'a3', timestamp: Date.now() },
      ];

      const result = calculateArchetype(responses, createAnswerLookup(answers));
      expect(result.archetype).toBe('TP');
      expect(result.scoreTF).toBe(6);
      expect(result.scoreJP).toBe(-6);
    });

    it('should calculate FJ archetype (Strategic-Structured)', () => {
      const answers: Answer[] = [
        { id: 'a1', text: 'Answer 1', scoreTF: -2, scoreJP: 2 },
        { id: 'a2', text: 'Answer 2', scoreTF: -2, scoreJP: 2 },
        { id: 'a3', text: 'Answer 3', scoreTF: -2, scoreJP: 2 },
      ];

      const responses: QuizResponse[] = [
        { questionId: 'q1', answerId: 'a1', timestamp: Date.now() },
        { questionId: 'q2', answerId: 'a2', timestamp: Date.now() },
        { questionId: 'q3', answerId: 'a3', timestamp: Date.now() },
      ];

      const result = calculateArchetype(responses, createAnswerLookup(answers));
      expect(result.archetype).toBe('FJ');
      expect(result.scoreTF).toBe(-6);
      expect(result.scoreJP).toBe(6);
    });

    it('should calculate FP archetype (Strategic-Experimental)', () => {
      const answers: Answer[] = [
        { id: 'a1', text: 'Answer 1', scoreTF: -2, scoreJP: -2 },
        { id: 'a2', text: 'Answer 2', scoreTF: -2, scoreJP: -2 },
        { id: 'a3', text: 'Answer 3', scoreTF: -2, scoreJP: -2 },
      ];

      const responses: QuizResponse[] = [
        { questionId: 'q1', answerId: 'a1', timestamp: Date.now() },
        { questionId: 'q2', answerId: 'a2', timestamp: Date.now() },
        { questionId: 'q3', answerId: 'a3', timestamp: Date.now() },
      ];

      const result = calculateArchetype(responses, createAnswerLookup(answers));
      expect(result.archetype).toBe('FP');
      expect(result.scoreTF).toBe(-6);
      expect(result.scoreJP).toBe(-6);
    });

    it('should return Neutral for weak scores', () => {
      const answers: Answer[] = [
        { id: 'a1', text: 'Answer 1', scoreTF: 1, scoreJP: 1 },
        { id: 'a2', text: 'Answer 2', scoreTF: 0, scoreJP: 0 },
      ];

      const responses: QuizResponse[] = [
        { questionId: 'q1', answerId: 'a1', timestamp: Date.now() },
        { questionId: 'q2', answerId: 'a2', timestamp: Date.now() },
      ];

      const result = calculateArchetype(responses, createAnswerLookup(answers));
      expect(result.archetype).toBe('Neutral');
    });

    it('should include archetype explanation', () => {
      const answers: Answer[] = [
        { id: 'a1', text: 'Answer 1', scoreTF: 2, scoreJP: 2 },
      ];

      const responses: QuizResponse[] = [
        { questionId: 'q1', answerId: 'a1', timestamp: Date.now() },
      ];

      const result = calculateArchetype(responses, createAnswerLookup(answers));
      expect(result.explanation).toBeDefined();
      expect(result.explanation.length).toBeGreaterThan(0);
    });

    it('should handle missing answers gracefully', () => {
      const responses: QuizResponse[] = [
        { questionId: 'q1', answerId: 'missing', timestamp: Date.now() },
      ];

      const result = calculateArchetype(responses, new Map());
      expect(result.scoreTF).toBe(0);
      expect(result.scoreJP).toBe(0);
    });
  });

  describe('calculateConfidence', () => {
    it('should return 0 for no responses', () => {
      const confidence = calculateConfidence(0, 0, 0);
      expect(confidence).toBe(0);
    });

    it('should return higher confidence for stronger scores', () => {
      const weakConfidence = calculateConfidence(2, 2, 5);
      const strongConfidence = calculateConfidence(10, 10, 5);
      expect(strongConfidence).toBeGreaterThan(weakConfidence);
    });

    it('should return higher confidence for more responses with same total', () => {
      // Same average magnitude, more responses
      const fewResponses = calculateConfidence(6, 6, 3);
      const manyResponses = calculateConfidence(10, 10, 5);
      expect(manyResponses).toBeGreaterThan(fewResponses);
    });

    it('should return value between 0 and 100', () => {
      const confidence = calculateConfidence(10, 10, 5);
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should reach high confidence with strong consistent scores', () => {
      // 5 questions with max scores
      const confidence = calculateConfidence(10, 10, 5);
      expect(confidence).toBeGreaterThanOrEqual(70);
    });
  });

  describe('hasClearArchetype', () => {
    it('should return true for strong TF scores', () => {
      expect(hasClearArchetype(4, 0)).toBe(true);
      expect(hasClearArchetype(-4, 0)).toBe(true);
    });

    it('should return true for strong JP scores', () => {
      expect(hasClearArchetype(0, 4)).toBe(true);
      expect(hasClearArchetype(0, -4)).toBe(true);
    });

    it('should return true for strong scores in both dimensions', () => {
      expect(hasClearArchetype(4, 4)).toBe(true);
      expect(hasClearArchetype(-4, -4)).toBe(true);
    });

    it('should return false for weak scores', () => {
      expect(hasClearArchetype(1, 1)).toBe(false);
      expect(hasClearArchetype(0, 0)).toBe(false);
      expect(hasClearArchetype(-1, -1)).toBe(false);
    });

    it('should use threshold of 2', () => {
      expect(hasClearArchetype(2, 0)).toBe(true);
      expect(hasClearArchetype(1, 0)).toBe(false);
    });
  });
});
