import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArchetype } from '@providers/ArchetypeContext';
import { Button } from '@components/shared/Button';
import { ArchetypeBadge } from '@components/shared/Badge';
import { QuizEngine } from '@domain/quiz/QuizEngine';
import { calculateArchetype } from '@domain/quiz/ArchetypeCalculator';
import { Question, Answer, QuizResponse, MAXIMUM_QUESTIONS } from '@domain/quiz/types';
import quizQuestionsData from '@data/quiz-questions.json';
import styles from './Quiz.module.css';

export function Quiz() {
  const navigate = useNavigate();
  const { setArchetype, hasArchetype, archetype: existingArchetype } = useArchetype();

  const [quizEngine] = useState(() => new QuizEngine(quizQuestionsData as Question[]));
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(undefined);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateArchetype> | null>(null);

  // Load first question on mount
  useEffect(() => {
    const question = quizEngine.getNextQuestion();
    setCurrentQuestion(question);
  }, [quizEngine]);

  const handleAnswer = (answer: Answer) => {
    if (!currentQuestion) return;

    const response: QuizResponse = {
      questionId: currentQuestion.id,
      answerId: answer.id,
      timestamp: Date.now(),
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);

    quizEngine.answerQuestion(currentQuestion.id, answer.id);

    // Check if quiz should terminate early
    if (quizEngine.shouldTerminateEarly()) {
      completeQuiz(newResponses);
    } else {
      const nextQuestion = quizEngine.getNextQuestion();
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
      } else {
        completeQuiz(newResponses);
      }
    }
  };

  const completeQuiz = (finalResponses: QuizResponse[]) => {
    // Create answer lookup map
    const answerLookup = new Map<string, Answer>();
    quizQuestionsData.forEach((q) => {
      q.answers.forEach((a) => {
        answerLookup.set(a.id, a);
      });
    });

    const archetypeResult = calculateArchetype(finalResponses, answerLookup);
    setResult(archetypeResult);
    setIsComplete(true);

    // Save to context and localStorage
    setArchetype(archetypeResult.archetype, archetypeResult.confidence);
  };

  const handleSkipQuiz = () => {
    // Set neutral archetype with low confidence
    setArchetype('Neutral', 50);
    navigate('/');
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  // Retake quiz (for users who already have an archetype)
  const handleRetakeQuiz = () => {
    window.location.reload();
  };

  if (hasArchetype() && !isComplete && responses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>You've Already Taken the Quiz</h1>
          <p className={styles.subtitle}>
            Your current learning style is:
          </p>
          <div className={styles.currentArchetype}>
            <ArchetypeBadge archetype={existingArchetype!} />
          </div>
          <p className={styles.description}>
            Would you like to retake the quiz to update your learning style?
          </p>
          <div className={styles.actions}>
            <Button variant="primary" onClick={handleRetakeQuiz}>
              Retake Quiz
            </Button>
            <Button variant="secondary" onClick={handleReturnHome}>
              Return to Games
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete && result) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.completionIcon}>✓</div>
          <h1 className={styles.title}>Quiz Complete!</h1>
          <p className={styles.subtitle}>Your learning style is:</p>

          <div className={styles.resultArchetype}>
            <ArchetypeBadge archetype={result.archetype} />
          </div>

          <div className={styles.confidenceBar}>
            <div className={styles.confidenceLabel}>
              Confidence: {Math.round(result.confidence)}%
            </div>
            <div className={styles.confidenceTrack}>
              <div
                className={styles.confidenceFill}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          <p className={styles.explanation}>{result.explanation}</p>

          <div className={styles.resultDetails}>
            <div className={styles.scoreItem}>
              <span className={styles.scoreLabel}>Thinking-Feeling:</span>
              <span className={styles.scoreValue}>
                {result.scoreTF > 0 ? 'Thinking' : result.scoreTF < 0 ? 'Feeling' : 'Balanced'}
                {result.scoreTF !== 0 && ` (${Math.abs(result.scoreTF)})`}
              </span>
            </div>
            <div className={styles.scoreItem}>
              <span className={styles.scoreLabel}>Judging-Perceiving:</span>
              <span className={styles.scoreValue}>
                {result.scoreJP > 0 ? 'Judging' : result.scoreJP < 0 ? 'Perceiving' : 'Balanced'}
                {result.scoreJP !== 0 && ` (${Math.abs(result.scoreJP)})`}
              </span>
            </div>
          </div>

          <div className={styles.whatNext}>
            <h3 className={styles.whatNextTitle}>What happens next?</h3>
            <p className={styles.whatNextText}>
              Game annotations will be adapted to match your learning style.
              {result.archetype === 'TJ' && " You'll see logical, step-by-step analysis."}
              {result.archetype === 'TP' && " You'll see flexible, exploratory explanations."}
              {result.archetype === 'FJ' && " You'll see structured, intuitive guidance."}
              {result.archetype === 'FP' && " You'll see creative, pattern-based insights."}
              {result.archetype === 'Neutral' && " You'll see balanced explanations."}
            </p>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" size="large" onClick={handleReturnHome}>
              Start Learning
            </Button>
            <Button variant="ghost" onClick={handleRetakeQuiz}>
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const progress = responses.length;
  const totalQuestions = MAXIMUM_QUESTIONS;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.quizHeader}>
          <div className={styles.progress}>
            <span className={styles.progressText}>
              Question {progress + 1} of up to {totalQuestions}
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${((progress + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={handleSkipQuiz}
            aria-label="Skip quiz"
          >
            Skip Quiz
          </Button>
        </div>

        <h2 className={styles.questionText}>{currentQuestion.text}</h2>

        <div className={styles.answers}>
          {currentQuestion.answers.map((answer) => (
            <button
              key={answer.id}
              onClick={() => handleAnswer(answer)}
              className={styles.answerButton}
            >
              <span className={styles.answerText}>{answer.text}</span>
            </button>
          ))}
        </div>

        <p className={styles.helpText}>
          Choose the answer that best describes how you approach learning and
          problem-solving.
        </p>
      </div>
    </div>
  );
}
