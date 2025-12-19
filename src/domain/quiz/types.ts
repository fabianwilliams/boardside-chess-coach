/**
 * Quiz Domain Types
 *
 * Type definitions for the adaptive chess learning quiz,
 * player archetype calculation, and question management.
 */

/**
 * Player learning archetype based on Myers-Briggs dimensions
 * T/F: Thinking (tactical) vs Feeling (strategic)
 * J/P: Judging (structured) vs Perceiving (experimental)
 */
export type Archetype = 'TJ' | 'TP' | 'FJ' | 'FP' | 'Neutral';

/**
 * Dimension being measured by a question
 */
export type QuestionDimension = 'T-F' | 'J-P';

/**
 * Quiz question with answers
 */
export interface Question {
  /** Unique question identifier */
  id: string;
  /** Question text */
  text: string;
  /** Dimension being measured */
  dimension: QuestionDimension;
  /** Available answer options */
  answers: Answer[];
}

/**
 * Answer option for a question
 */
export interface Answer {
  /** Unique answer identifier */
  id: string;
  /** Answer text */
  text: string;
  /** Score for T/F dimension (-2 to +2, 0 for neutral) */
  scoreTF: number;
  /** Score for J/P dimension (-2 to +2, 0 for neutral) */
  scoreJP: number;
}

/**
 * User's answer to a question
 */
export interface QuizResponse {
  /** Question ID */
  questionId: string;
  /** Selected answer ID */
  answerId: string;
  /** Timestamp of response */
  timestamp: number;
}

/**
 * Quiz session state
 */
export interface QuizSession {
  /** Questions already answered */
  responses: QuizResponse[];
  /** Current T/F score */
  currentScoreTF: number;
  /** Current J/P score */
  currentScoreJP: number;
  /** Is quiz complete? */
  isComplete: boolean;
  /** Calculated archetype (if complete) */
  archetype?: Archetype;
  /** Confidence level (0-100) */
  confidence: number;
}

/**
 * Archetype calculation result
 */
export interface ArchetypeResult {
  /** Calculated archetype */
  archetype: Archetype;
  /** Confidence level (0-100) */
  confidence: number;
  /** T/F dimension score */
  scoreTF: number;
  /** J/P dimension score */
  scoreJP: number;
  /** Explanation of the archetype */
  explanation: string;
}

/**
 * Confidence thresholds for early termination
 */
export const CONFIDENCE_THRESHOLD = 80;
export const MINIMUM_QUESTIONS = 5;
export const MAXIMUM_QUESTIONS = 10;

/**
 * Archetype descriptions
 */
export const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  TJ: 'Tactical-Structured: You learn best through systematic tactical training with clear patterns and rules.',
  TP: 'Tactical-Experimental: You learn best through tactical puzzles and experimentation with different combinations.',
  FJ: 'Strategic-Structured: You learn best through positional understanding and structured study of strategic principles.',
  FP: 'Strategic-Experimental: You learn best through exploring creative strategic ideas and playing various positions.',
  Neutral:
    'Balanced: You benefit from a mix of tactical and strategic content with varied learning approaches.',
};
