/**
 * Quiz Questions Data Tests
 *
 * Validates quiz-questions.json structure and ensures all archetypes are reachable.
 */

import quizQuestionsData from '../quiz-questions.json';
import { QuizEngine } from '../../domain/quiz/QuizEngine';
import type { Question, Archetype } from '../../domain/quiz/types';

describe('quiz-questions.json', () => {
  const questions: Question[] = quizQuestionsData as Question[];

  describe('structure validation', () => {
    it('should have 10 questions', () => {
      expect(questions).toHaveLength(10);
    });

    it('should have valid question structure', () => {
      questions.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('text');
        expect(q).toHaveProperty('dimension');
        expect(q).toHaveProperty('answers');
      });
    });

    it('should have 5 answers per question', () => {
      questions.forEach((q) => {
        expect(q.answers).toHaveLength(5);
      });
    });

    it('should have valid answer structure', () => {
      questions.forEach((q) => {
        q.answers.forEach((a) => {
          expect(a).toHaveProperty('id');
          expect(a).toHaveProperty('text');
          expect(a).toHaveProperty('scoreTF');
          expect(a).toHaveProperty('scoreJP');
          expect(typeof a.scoreTF).toBe('number');
          expect(typeof a.scoreJP).toBe('number');
        });
      });
    });

    it('should have scores in valid range (-2 to +2)', () => {
      questions.forEach((q) => {
        q.answers.forEach((a) => {
          expect(a.scoreTF).toBeGreaterThanOrEqual(-2);
          expect(a.scoreTF).toBeLessThanOrEqual(2);
          expect(a.scoreJP).toBeGreaterThanOrEqual(-2);
          expect(a.scoreJP).toBeLessThanOrEqual(2);
        });
      });
    });

    it('should have "I\'m not sure" option with zero scores', () => {
      questions.forEach((q) => {
        const neutralAnswer = q.answers.find(
          (a) => a.text.toLowerCase() === "i'm not sure"
        );
        expect(neutralAnswer).toBeDefined();
        expect(neutralAnswer?.scoreTF).toBe(0);
        expect(neutralAnswer?.scoreJP).toBe(0);
      });
    });

    it('should have valid dimensions', () => {
      questions.forEach((q) => {
        expect(['T-F', 'J-P']).toContain(q.dimension);
      });
    });

    it('should have unique question IDs', () => {
      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique answer IDs across all questions', () => {
      const answerIds: string[] = [];
      questions.forEach((q) => {
        q.answers.forEach((a) => {
          answerIds.push(a.id);
        });
      });
      const uniqueIds = new Set(answerIds);
      expect(uniqueIds.size).toBe(answerIds.length);
    });
  });

  describe('archetype reachability', () => {
    const targetArchetypes: Archetype[] = ['TJ', 'TP', 'FJ', 'FP'];

    targetArchetypes.forEach((targetArchetype) => {
      it(`should be able to reach ${targetArchetype} archetype`, () => {
        const engine = new QuizEngine(questions);

        // Select answers that lead to target archetype
        questions.forEach((q) => {
          let selectedAnswer = q.answers[0];

          if (targetArchetype === 'TJ') {
            // Tactical + Judging: high TF, high JP
            if (q.dimension === 'T-F') {
              selectedAnswer = q.answers.reduce((best, current) =>
                current.scoreTF > best.scoreTF ? current : best
              );
            } else {
              selectedAnswer = q.answers.reduce((best, current) =>
                current.scoreJP > best.scoreJP ? current : best
              );
            }
          } else if (targetArchetype === 'TP') {
            // Tactical + Perceiving: high TF, low JP
            if (q.dimension === 'T-F') {
              selectedAnswer = q.answers.reduce((best, current) =>
                current.scoreTF > best.scoreTF ? current : best
              );
            } else {
              selectedAnswer = q.answers.reduce((best, current) =>
                current.scoreJP < best.scoreJP ? current : best
              );
            }
          } else if (targetArchetype === 'FJ') {
            // Strategic + Judging: low TF, high JP
            if (q.dimension === 'T-F') {
              selectedAnswer = q.answers.reduce((best, current) =>
                current.scoreTF < best.scoreTF ? current : best
              );
            } else {
              selectedAnswer = q.answers.reduce((best, current) =>
                current.scoreJP > best.scoreJP ? current : best
              );
            }
          } else if (targetArchetype === 'FP') {
            // Strategic + Perceiving: low TF, low JP
            if (q.dimension === 'T-F') {
              selectedAnswer = q.answers.reduce((best, current) =>
                current.scoreTF < best.scoreTF ? current : best
              );
            } else {
              selectedAnswer = q.answers.reduce((best, current) =>
                current.scoreJP < best.scoreJP ? current : best
              );
            }
          }

          engine.answerQuestion(q.id, selectedAnswer.id);
        });

        expect(engine.isComplete()).toBe(true);
        expect(engine.getArchetype()).toBe(targetArchetype);
      });
    });

    it('should reach Neutral with all neutral answers', () => {
      const engine = new QuizEngine(questions);

      questions.forEach((q) => {
        const neutralAnswer = q.answers.find(
          (a) => a.scoreTF === 0 && a.scoreJP === 0
        );
        if (neutralAnswer) {
          engine.answerQuestion(q.id, neutralAnswer.id);
        }
      });

      expect(engine.isComplete()).toBe(true);
      expect(engine.getArchetype()).toBe('Neutral');
    });
  });

  describe('content quality', () => {
    it('should have questions covering T-F dimension', () => {
      const tfQuestions = questions.filter((q) => q.dimension === 'T-F');
      expect(tfQuestions.length).toBeGreaterThanOrEqual(4);
    });

    it('should have questions covering J-P dimension', () => {
      const jpQuestions = questions.filter((q) => q.dimension === 'J-P');
      expect(jpQuestions.length).toBeGreaterThanOrEqual(4);
    });

    it('should have balanced distribution of dimensions', () => {
      const tfQuestions = questions.filter((q) => q.dimension === 'T-F');
      const jpQuestions = questions.filter((q) => q.dimension === 'J-P');
      const diff = Math.abs(tfQuestions.length - jpQuestions.length);
      expect(diff).toBeLessThanOrEqual(2);
    });

    it('should have varied score ranges', () => {
      const maxScores = new Set<number>();
      questions.forEach((q) => {
        q.answers.forEach((a) => {
          if (a.scoreTF !== 0) maxScores.add(Math.abs(a.scoreTF));
          if (a.scoreJP !== 0) maxScores.add(Math.abs(a.scoreJP));
        });
      });
      expect(maxScores.has(2)).toBe(true); // Has strong preferences
      expect(maxScores.has(1)).toBe(true); // Has moderate preferences
    });
  });
});
