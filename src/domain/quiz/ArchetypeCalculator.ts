/**
 * ArchetypeCalculator
 *
 * Calculates player learning archetype based on quiz responses.
 * Uses T/F and J/P dimensions to determine the best learning approach.
 */

import type {
  Archetype,
  ArchetypeResult,
  QuizResponse,
  Answer,
} from './types';
import { ARCHETYPE_DESCRIPTIONS } from './types';

/**
 * Calculate player archetype from quiz responses
 * @param responses - Array of quiz responses
 * @param answerLookup - Map of answer IDs to Answer objects
 * @returns ArchetypeResult with archetype and confidence
 */
export function calculateArchetype(
  responses: QuizResponse[],
  answerLookup: Map<string, Answer>
): ArchetypeResult {
  if (responses.length === 0) {
    return {
      archetype: 'Neutral',
      confidence: 0,
      scoreTF: 0,
      scoreJP: 0,
      explanation: ARCHETYPE_DESCRIPTIONS.Neutral,
    };
  }

  // Sum scores across all responses
  let totalTF = 0;
  let totalJP = 0;

  for (const response of responses) {
    const answer = answerLookup.get(response.answerId);
    if (answer) {
      totalTF += answer.scoreTF;
      totalJP += answer.scoreJP;
    }
  }

  // Determine archetype based on score quadrant
  const archetype = determineArchetype(totalTF, totalJP);

  // Calculate confidence based on score magnitude
  const confidence = calculateConfidence(totalTF, totalJP, responses.length);

  return {
    archetype,
    confidence,
    scoreTF: totalTF,
    scoreJP: totalJP,
    explanation: ARCHETYPE_DESCRIPTIONS[archetype],
  };
}

/**
 * Determine archetype from T/F and J/P scores
 * @param scoreTF - Total T/F score
 * @param scoreJP - Total J/P score
 * @returns Archetype
 */
function determineArchetype(scoreTF: number, scoreJP: number): Archetype {
  const threshold = 2; // Minimum score difference for non-neutral

  // Check if scores are too close to neutral
  if (Math.abs(scoreTF) < threshold && Math.abs(scoreJP) < threshold) {
    return 'Neutral';
  }

  // Determine T/F dimension: positive = Thinking, negative = Feeling
  const isThinking = scoreTF >= 0;

  // Determine J/P dimension: positive = Judging, negative = Perceiving
  const isJudging = scoreJP >= 0;

  // Return appropriate quadrant
  if (isThinking && isJudging) {
    return 'TJ';
  } else if (isThinking && !isJudging) {
    return 'TP';
  } else if (!isThinking && isJudging) {
    return 'FJ';
  } else {
    return 'FP';
  }
}

/**
 * Calculate confidence level based on score magnitude and number of responses
 * @param scoreTF - Total T/F score
 * @param scoreJP - Total J/P score
 * @param responseCount - Number of responses
 * @returns Confidence level (0-100)
 */
export function calculateConfidence(
  scoreTF: number,
  scoreJP: number,
  responseCount: number
): number {
  if (responseCount === 0) {
    return 0;
  }

  // Calculate average magnitude of scores per question
  const avgMagnitude =
    (Math.abs(scoreTF) + Math.abs(scoreJP)) / (responseCount * 2);

  // Maximum possible average magnitude per question is 2
  // (if every answer is max +2 or -2 on both dimensions)
  const maxPossibleAvg = 2;

  // Calculate base confidence from score magnitude
  const baseConfidence = Math.min(avgMagnitude / maxPossibleAvg, 1.0);

  // Boost confidence with more responses (diminishing returns)
  const responseFactor = Math.min(responseCount / 10, 1.0);

  // Combine factors (70% magnitude, 30% response count)
  const confidence = baseConfidence * 0.7 + responseFactor * 0.3;

  // Return as percentage
  return Math.round(confidence * 100);
}

/**
 * Check if scores indicate a clear archetype (not neutral)
 * @param scoreTF - Total T/F score
 * @param scoreJP - Total J/P score
 * @returns true if archetype is clear
 */
export function hasClearArchetype(scoreTF: number, scoreJP: number): boolean {
  const threshold = 2;
  return Math.abs(scoreTF) >= threshold || Math.abs(scoreJP) >= threshold;
}
