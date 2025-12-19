import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useArchetype } from '@providers/ArchetypeContext';
import { ChessGame } from '@domain/chess/ChessGame';
import { MoveNavigator } from '@domain/chess/MoveNavigator';
import { ChessBoard } from '@components/ChessBoard/ChessBoard';
import { MoveList, Move as MoveListMove } from '@components/MoveList/MoveList';
import { AnnotationPanel } from '@components/Annotation/AnnotationPanel';
import { Button } from '@components/shared/Button';
import { EducationalAnnotation } from '@domain/chess/types';
import sampleGamesData from '@data/sample-games.json';
import styles from './GameViewer.module.css';

interface GameData {
  id: string;
  title: string;
  opening: string;
  sides: {
    [key: string]: {
      label: string;
      result: string;
      pgn: string;
      annotations: Array<{
        ply: number;
        san: string;
        principle: string;
        text: string;
      }>;
    };
  };
}

export function GameViewer() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { archetype } = useArchetype();

  // URL params
  const side = searchParams.get('side') || 'A';
  const moveParam = searchParams.get('move');

  // Game state
  const [game, setGame] = useState<ChessGame | null>(null);
  const [navigator, setNavigator] = useState<MoveNavigator | null>(null);
  const [currentPly, setCurrentPly] = useState<number>(-1);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load game data
  useEffect(() => {
    if (!gameId) {
      setError('No game ID provided');
      return;
    }

    const foundGame = sampleGamesData.games.find((g) => g.id === gameId) as GameData | undefined;

    if (!foundGame) {
      setError(`Game not found: ${gameId}`);
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    if (!foundGame.sides[side]) {
      setError(`Side ${side} not found for this game`);
      return;
    }

    try {
      const sideData = foundGame.sides[side];
      const chessGame = new ChessGame(sideData.pgn);
      const initialPly = moveParam ? parseInt(moveParam, 10) : -1;
      const nav = new MoveNavigator(chessGame, initialPly);

      setGameData(foundGame);
      setGame(chessGame);
      setNavigator(nav);
      setCurrentPly(initialPly);
      setError(null);
    } catch (err) {
      setError(`Failed to load game: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [gameId, side, moveParam, navigate]);

  // Update URL when ply changes
  const updateURL = useCallback(
    (newPly: number) => {
      const params = new URLSearchParams();
      params.set('side', side);
      if (newPly >= 0) {
        params.set('move', newPly.toString());
      }
      setSearchParams(params, { replace: true });
    },
    [side, setSearchParams]
  );

  // Navigation handlers
  const handleMoveClick = useCallback(
    (ply: number) => {
      if (!navigator) return;
      navigator.goToMove(ply);
      setCurrentPly(ply);
      updateURL(ply);
    },
    [navigator, updateURL]
  );

  const handleNext = useCallback(() => {
    if (!navigator) return;
    if (navigator.next()) {
      const newPly = navigator.getCurrentPly();
      setCurrentPly(newPly);
      updateURL(newPly);
    }
  }, [navigator, updateURL]);

  const handlePrevious = useCallback(() => {
    if (!navigator) return;
    if (navigator.previous()) {
      const newPly = navigator.getCurrentPly();
      setCurrentPly(newPly);
      updateURL(newPly);
    }
  }, [navigator, updateURL]);

  const handleFirst = useCallback(() => {
    if (!navigator) return;
    if (navigator.first()) {
      setCurrentPly(-1);
      updateURL(-1);
    }
  }, [navigator, updateURL]);

  const handleLast = useCallback(() => {
    if (!navigator) return;
    if (navigator.last()) {
      const newPly = navigator.getCurrentPly();
      setCurrentPly(newPly);
      updateURL(newPly);
    }
  }, [navigator, updateURL]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'Home':
          event.preventDefault();
          handleFirst();
          break;
        case 'End':
          event.preventDefault();
          handleLast();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, handleFirst, handleLast]);

  // Switch side handler
  const handleSwitchSide = useCallback(() => {
    const newSide = side === 'A' ? 'B' : 'A';
    const params = new URLSearchParams();
    params.set('side', newSide);
    setSearchParams(params);
  }, [side, setSearchParams]);

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <h2>Error</h2>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return to Games
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!game || !navigator || !gameData) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Get current position and move list
  const position = navigator.getCurrentPosition();
  const moves: MoveListMove[] = game.getAllMoves().map((move) => ({
    ply: move.ply,
    san: move.san,
    moveNumber: move.moveNumber,
    isWhiteMove: move.color === 'w',
  }));

  // Get annotation for current move
  const sideData = gameData.sides[side];
  const currentAnnotation =
    currentPly >= 0
      ? sideData.annotations.find((ann) => ann.ply === currentPly + 1)
      : null;

  // Convert annotation to EducationalAnnotation format
  const educationalAnnotation: EducationalAnnotation | null = currentAnnotation
    ? {
        principle: currentAnnotation.principle,
        principleId: currentAnnotation.principle
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        text: currentAnnotation.text,
      }
    : null;

  const hasOtherSide = gameData.sides[side === 'A' ? 'B' : 'A'] !== undefined;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{gameData.title}</h1>
          <p className={styles.subtitle}>
            {gameData.opening} • {sideData.label}
          </p>
        </div>
        {hasOtherSide && (
          <Button variant="secondary" onClick={handleSwitchSide}>
            Switch to Side {side === 'A' ? 'B' : 'A'}
          </Button>
        )}
      </div>

      <div className={styles.content}>
        {/* Left column: Board and controls */}
        <div className={styles.leftColumn}>
          <ChessBoard position={position.fen} orientation="white" />

          <div className={styles.controls}>
            <Button variant="ghost" size="small" onClick={handleFirst} disabled={currentPly === -1}>
              ⏮ Start
            </Button>
            <Button variant="ghost" size="small" onClick={handlePrevious} disabled={currentPly === -1}>
              ← Previous
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={handleNext}
              disabled={currentPly >= moves.length - 1}
            >
              Next →
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={handleLast}
              disabled={currentPly >= moves.length - 1}
            >
              End ⏭
            </Button>
          </div>
        </div>

        {/* Right column: Moves and annotations */}
        <div className={styles.rightColumn}>
          <MoveList moves={moves} currentPly={currentPly} onMoveClick={handleMoveClick} />
          <AnnotationPanel annotation={educationalAnnotation} archetype={archetype} />
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.keyboardHints}>
          Keyboard shortcuts: ← Previous | → Next | Home | End
        </p>
      </div>
    </div>
  );
}
