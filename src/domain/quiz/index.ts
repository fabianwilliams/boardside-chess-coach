/**
 * Quiz Domain Module
 *
 * Adaptive quiz system for determining player learning archetype.
 */

export { QuizEngine } from './QuizEngine';
export {
  calculateArchetype,
  calculateConfidence,
  hasClearArchetype,
} from './ArchetypeCalculator';
export type {
  Question,
  Answer,
  QuizResponse,
  QuizSession,
  ArchetypeResult,
  Archetype,
  QuestionDimension,
} from './types';
export {
  CONFIDENCE_THRESHOLD,
  MINIMUM_QUESTIONS,
  MAXIMUM_QUESTIONS,
  ARCHETYPE_DESCRIPTIONS,
} from './types';
