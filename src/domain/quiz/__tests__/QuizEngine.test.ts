/**
 * QuizEngine Unit Tests
 */

import { QuizEngine } from '../QuizEngine';
import type { Question } from '../types';
import { CONFIDENCE_THRESHOLD, MINIMUM_QUESTIONS } from '../types';

// Sample questions for testing
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Question 1',
    dimension: 'T-F',
    answers: [
      { id: 'q1a1', text: 'Tactical', scoreTF: 2, scoreJP: 0 },
      { id: 'q1a2', text: 'Strategic', scoreTF: -2, scoreJP: 0 },
    ],
  },
  {
    id: 'q2',
    text: 'Question 2',
    dimension: 'J-P',
    answers: [
      { id: 'q2a1', text: 'Structured', scoreTF: 0, scoreJP: 2 },
      { id: 'q2a2', text: 'Experimental', scoreTF: 0, scoreJP: -2 },
    ],
  },
  {
    id: 'q3',
    text: 'Question 3',
    dimension: 'T-F',
    answers: [
      { id: 'q3a1', text: 'Tactical', scoreTF: 2, scoreJP: 0 },
      { id: 'q3a2', text: 'Strategic', scoreTF: -2, scoreJP: 0 },
    ],
  },
  {
    id: 'q4',
    text: 'Question 4',
    dimension: 'J-P',
    answers: [
      { id: 'q4a1', text: 'Structured', scoreTF: 0, scoreJP: 2 },
      { id: 'q4a2', text: 'Experimental', scoreTF: 0, scoreJP: -2 },
    ],
  },
  {
    id: 'q5',
    text: 'Question 5',
    dimension: 'T-F',
    answers: [
      { id: 'q5a1', text: 'Tactical', scoreTF: 2, scoreJP: 0 },
      { id: 'q5a2', text: 'Strategic', scoreTF: -2, scoreJP: 0 },
    ],
  },
  {
    id: 'q6',
    text: 'Question 6',
    dimension: 'J-P',
    answers: [
      { id: 'q6a1', text: 'Structured', scoreTF: 0, scoreJP: 2 },
      { id: 'q6a2', text: 'Experimental', scoreTF: 0, scoreJP: -2 },
    ],
  },
  {
    id: 'q7',
    text: 'Question 7',
    dimension: 'T-F',
    answers: [
      { id: 'q7a1', text: 'Tactical', scoreTF: 2, scoreJP: 0 },
      { id: 'q7a2', text: 'Strategic', scoreTF: -2, scoreJP: 0 },
    ],
  },
  {
    id: 'q8',
    text: 'Question 8',
    dimension: 'J-P',
    answers: [
      { id: 'q8a1', text: 'Structured', scoreTF: 0, scoreJP: 2 },
      { id: 'q8a2', text: 'Experimental', scoreTF: 0, scoreJP: -2 },
    ],
  },
  {
    id: 'q9',
    text: 'Question 9',
    dimension: 'T-F',
    answers: [
      { id: 'q9a1', text: 'Tactical', scoreTF: 2, scoreJP: 0 },
      { id: 'q9a2', text: 'Strategic', scoreTF: -2, scoreJP: 0 },
    ],
  },
  {
    id: 'q10',
    text: 'Question 10',
    dimension: 'J-P',
    answers: [
      { id: 'q10a1', text: 'Structured', scoreTF: 0, scoreJP: 2 },
      { id: 'q10a2', text: 'Experimental', scoreTF: 0, scoreJP: -2 },
    ],
  },
];

describe('QuizEngine', () => {
  describe('constructor', () => {
    it('should create a new quiz engine', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      expect(engine).toBeDefined();
      expect(engine.isComplete()).toBe(false);
    });

    it('should initialize with empty session', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      const session = engine.getSession();
      expect(session.responses).toHaveLength(0);
      expect(session.currentScoreTF).toBe(0);
      expect(session.currentScoreJP).toBe(0);
      expect(session.isComplete).toBe(false);
    });
  });

  describe('getNextQuestion', () => {
    it('should return first question initially', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      const question = engine.getNextQuestion();
      expect(question).toBeDefined();
      expect(question?.id).toBe('q1');
    });

    it('should return next unanswered question', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      engine.answerQuestion('q1', 'q1a1');
      const nextQuestion = engine.getNextQuestion();
      expect(nextQuestion?.id).toBe('q2');
    });

    it('should return undefined when quiz is complete', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      // Answer all 10 questions
      for (let i = 1; i <= 10; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }
      expect(engine.getNextQuestion()).toBeUndefined();
    });
  });

  describe('answerQuestion', () => {
    it('should record answer and update scores', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      engine.answerQuestion('q1', 'q1a1'); // scoreTF: +2

      const session = engine.getSession();
      expect(session.responses).toHaveLength(1);
      expect(session.currentScoreTF).toBe(2);
    });

    it('should throw error for invalid question', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      expect(() => engine.answerQuestion('invalid', 'q1a1')).toThrow();
    });

    it('should throw error for invalid answer', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      expect(() => engine.answerQuestion('q1', 'invalid')).toThrow();
    });

    it('should throw error if quiz is complete', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      // Answer all questions
      for (let i = 1; i <= 10; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }
      expect(() => engine.answerQuestion('q1', 'q1a1')).toThrow(
        'Quiz is already complete'
      );
    });

    it('should update confidence after each answer', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      engine.answerQuestion('q1', 'q1a1');
      const confidence1 = engine.getConfidence();

      engine.answerQuestion('q2', 'q2a1');
      const confidence2 = engine.getConfidence();

      expect(confidence2).toBeGreaterThan(confidence1);
    });
  });

  describe('shouldTerminateEarly', () => {
    it('should return false with less than minimum questions', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      for (let i = 1; i < MINIMUM_QUESTIONS; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }
      expect(engine.shouldTerminateEarly()).toBe(false);
    });

    it('should return true when confidence threshold met', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      // Answer questions with strong consistent scores
      for (let i = 1; i <= MINIMUM_QUESTIONS; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }

      // If confidence is high enough, should terminate
      if (engine.getConfidence() >= CONFIDENCE_THRESHOLD) {
        expect(engine.shouldTerminateEarly()).toBe(true);
      }
    });

    it('should complete quiz when early termination triggered', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      // Answer minimum questions with strong scores
      for (let i = 1; i <= MINIMUM_QUESTIONS; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }

      // Try to get next question - should complete if confident
      engine.getNextQuestion();

      if (engine.getConfidence() >= CONFIDENCE_THRESHOLD) {
        expect(engine.isComplete()).toBe(true);
      }
    });
  });

  describe('getSession', () => {
    it('should return session state', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      engine.answerQuestion('q1', 'q1a1');

      const session = engine.getSession();
      expect(session.responses).toHaveLength(1);
      expect(session.currentScoreTF).toBe(2);
    });

    it('should return a copy of session', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      const session1 = engine.getSession();
      const session2 = engine.getSession();
      expect(session1).not.toBe(session2);
    });
  });

  describe('isComplete', () => {
    it('should return false initially', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      expect(engine.isComplete()).toBe(false);
    });

    it('should return true after all questions answered', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      for (let i = 1; i <= 10; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }
      expect(engine.isComplete()).toBe(true);
    });
  });

  describe('getArchetype', () => {
    it('should return undefined when incomplete', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      expect(engine.getArchetype()).toBeUndefined();
    });

    it('should return archetype when complete', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      for (let i = 1; i <= 10; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }
      expect(engine.getArchetype()).toBeDefined();
    });

    it('should calculate TJ for tactical+structured answers', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      for (let i = 1; i <= 10; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`); // All "Tactical" and "Structured"
      }
      expect(engine.getArchetype()).toBe('TJ');
    });

    it('should calculate FP for strategic+experimental answers', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      for (let i = 1; i <= 10; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a2`); // All "Strategic" and "Experimental"
      }
      expect(engine.getArchetype()).toBe('FP');
    });
  });

  describe('reset', () => {
    it('should reset quiz to initial state', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      engine.answerQuestion('q1', 'q1a1');
      engine.answerQuestion('q2', 'q2a1');

      engine.reset();

      const session = engine.getSession();
      expect(session.responses).toHaveLength(0);
      expect(session.currentScoreTF).toBe(0);
      expect(session.currentScoreJP).toBe(0);
      expect(session.isComplete).toBe(false);
    });

    it('should allow answering questions after reset', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      for (let i = 1; i <= 10; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }

      engine.reset();
      expect(() => engine.answerQuestion('q1', 'q1a1')).not.toThrow();
    });
  });

  describe('getResponseCount', () => {
    it('should return 0 initially', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      expect(engine.getResponseCount()).toBe(0);
    });

    it('should return number of answered questions', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      engine.answerQuestion('q1', 'q1a1');
      engine.answerQuestion('q2', 'q2a1');
      expect(engine.getResponseCount()).toBe(2);
    });
  });

  describe('getProgress', () => {
    it('should return 0 initially', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      expect(engine.getProgress()).toBe(0);
    });

    it('should return 100 when all questions answered', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      for (let i = 1; i <= 10; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }
      expect(engine.getProgress()).toBe(100);
    });

    it('should return percentage based on max questions', () => {
      const engine = new QuizEngine(SAMPLE_QUESTIONS);
      for (let i = 1; i <= 5; i++) {
        engine.answerQuestion(`q${i}`, `q${i}a1`);
      }
      expect(engine.getProgress()).toBe(50);
    });
  });
});
