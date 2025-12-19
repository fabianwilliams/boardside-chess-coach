/**
 * QuizEngine
 *
 * Manages quiz flow, question selection, and early termination logic.
 * Implements adaptive quiz behavior based on confidence levels.
 */

import type {
  Question,
  QuizResponse,
  QuizSession,
  Answer,
} from './types';
import {
  CONFIDENCE_THRESHOLD,
  MINIMUM_QUESTIONS,
  MAXIMUM_QUESTIONS,
} from './types';
import {
  calculateArchetype,
  calculateConfidence,
} from './ArchetypeCalculator';

/**
 * QuizEngine class - manages quiz session and question flow
 */
export class QuizEngine {
  private questions: Question[];
  private session: QuizSession;
  private answerLookup: Map<string, Answer>;

  /**
   * Create a new QuizEngine instance
   * @param questions - Array of available questions
   */
  constructor(questions: Question[]) {
    this.questions = questions;
    this.answerLookup = this.buildAnswerLookup(questions);
    this.session = this.initializeSession();
  }

  /**
   * Get the next question to present to the user
   * @returns Next Question or undefined if quiz is complete
   */
  getNextQuestion(): Question | undefined {
    if (this.session.isComplete) {
      return undefined;
    }

    // Check if we should terminate early
    if (this.shouldTerminateEarly()) {
      this.completeQuiz();
      return undefined;
    }

    // Find next unanswered question
    const answeredIds = new Set(
      this.session.responses.map((r) => r.questionId)
    );

    return this.questions.find((q) => !answeredIds.has(q.id));
  }

  /**
   * Record a user's answer to a question
   * @param questionId - ID of the answered question
   * @param answerId - ID of the selected answer
   */
  answerQuestion(questionId: string, answerId: string): void {
    if (this.session.isComplete) {
      throw new Error('Quiz is already complete');
    }

    // Verify the answer belongs to the question
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    const answer = question.answers.find((a) => a.id === answerId);
    if (!answer) {
      throw new Error(`Answer ${answerId} not found for question ${questionId}`);
    }

    // Add response
    const response: QuizResponse = {
      questionId,
      answerId,
      timestamp: Date.now(),
    };

    this.session.responses.push(response);

    // Update scores
    this.session.currentScoreTF += answer.scoreTF;
    this.session.currentScoreJP += answer.scoreJP;

    // Update confidence
    this.session.confidence = calculateConfidence(
      this.session.currentScoreTF,
      this.session.currentScoreJP,
      this.session.responses.length
    );

    // Check if quiz should complete
    if (
      this.session.responses.length >= MAXIMUM_QUESTIONS ||
      this.shouldTerminateEarly()
    ) {
      this.completeQuiz();
    }
  }

  /**
   * Determine if quiz should terminate early
   * @returns true if early termination criteria met
   */
  shouldTerminateEarly(): boolean {
    const responseCount = this.session.responses.length;

    // Must have minimum number of questions
    if (responseCount < MINIMUM_QUESTIONS) {
      return false;
    }

    // Check if confidence threshold met
    return this.session.confidence >= CONFIDENCE_THRESHOLD;
  }

  /**
   * Get current quiz session state
   * @returns QuizSession object
   */
  getSession(): QuizSession {
    return { ...this.session };
  }

  /**
   * Check if quiz is complete
   * @returns true if quiz is finished
   */
  isComplete(): boolean {
    return this.session.isComplete;
  }

  /**
   * Get the calculated archetype (only if quiz is complete)
   * @returns Archetype or undefined
   */
  getArchetype(): string | undefined {
    return this.session.archetype;
  }

  /**
   * Get current confidence level
   * @returns Confidence percentage (0-100)
   */
  getConfidence(): number {
    return this.session.confidence;
  }

  /**
   * Reset quiz session
   */
  reset(): void {
    this.session = this.initializeSession();
  }

  /**
   * Initialize a new quiz session
   * @returns Initial QuizSession state
   */
  private initializeSession(): QuizSession {
    return {
      responses: [],
      currentScoreTF: 0,
      currentScoreJP: 0,
      isComplete: false,
      confidence: 0,
    };
  }

  /**
   * Complete the quiz and calculate final archetype
   */
  private completeQuiz(): void {
    const result = calculateArchetype(this.session.responses, this.answerLookup);
    this.session.isComplete = true;
    this.session.archetype = result.archetype;
    this.session.confidence = result.confidence;
  }

  /**
   * Build lookup map of answer IDs to Answer objects
   * @param questions - Array of questions
   * @returns Map of answer IDs to Answers
   */
  private buildAnswerLookup(questions: Question[]): Map<string, Answer> {
    const lookup = new Map<string, Answer>();

    for (const question of questions) {
      for (const answer of question.answers) {
        lookup.set(answer.id, answer);
      }
    }

    return lookup;
  }

  /**
   * Get number of questions answered so far
   * @returns Response count
   */
  getResponseCount(): number {
    return this.session.responses.length;
  }

  /**
   * Get progress percentage
   * @returns Progress (0-100)
   */
  getProgress(): number {
    return Math.round(
      (this.session.responses.length / MAXIMUM_QUESTIONS) * 100
    );
  }
}
