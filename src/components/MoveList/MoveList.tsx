import { useEffect, useRef, KeyboardEvent } from 'react';
import styles from './MoveList.module.css';

export interface Move {
  /** Ply number (half-move number, starting from 0) */
  ply: number;
  /** Move in SAN notation (e.g., "e4", "Nf3") */
  san: string;
  /** Full move number (e.g., 1, 2, 3) */
  moveNumber: number;
  /** Is this white's move? */
  isWhiteMove: boolean;
}

export interface MoveListProps {
  /** Array of moves */
  moves: Move[];
  /** Current ply (half-move) being displayed */
  currentPly: number;
  /** Callback when a move is clicked */
  onMoveClick: (ply: number) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * MoveList Component
 * Displays chess moves with navigation and highlighting
 */
export function MoveList({
  moves,
  currentPly,
  onMoveClick,
  className = '',
}: MoveListProps) {
  const currentMoveRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to current move
  useEffect(() => {
    if (currentMoveRef.current) {
      currentMoveRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentPly]);

  // Group moves by move number (two plies per move)
  const groupedMoves: Array<{
    moveNumber: number;
    whiteMove: Move | null;
    blackMove: Move | null;
  }> = [];

  moves.forEach((move) => {
    const { moveNumber } = move;
    let group = groupedMoves.find((g) => g.moveNumber === moveNumber);

    if (!group) {
      group = { moveNumber, whiteMove: null, blackMove: null };
      groupedMoves.push(group);
    }

    if (move.isWhiteMove) {
      group.whiteMove = move;
    } else {
      group.blackMove = move;
    }
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, ply: number) => {
    const currentIndex = moves.findIndex((m) => m.ply === currentPly);

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          onMoveClick(moves[currentIndex - 1].ply);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < moves.length - 1) {
          onMoveClick(moves[currentIndex + 1].ply);
        }
        break;
      case 'Home':
        event.preventDefault();
        onMoveClick(0); // Start position
        break;
      case 'End':
        event.preventDefault();
        if (moves.length > 0) {
          onMoveClick(moves[moves.length - 1].ply);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onMoveClick(ply);
        break;
    }
  };

  if (moves.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <p className={styles.emptyState}>No moves yet</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`} role="navigation" aria-label="Move list">
      <div className={styles.moveList}>
        {groupedMoves.map((group) => (
          <div key={group.moveNumber} className={styles.moveRow}>
            <span className={styles.moveNumber}>{group.moveNumber}.</span>

            {group.whiteMove && (
              <button
                ref={group.whiteMove.ply === currentPly ? currentMoveRef : null}
                className={`${styles.move} ${
                  group.whiteMove.ply === currentPly ? styles.current : ''
                }`}
                onClick={() => onMoveClick(group.whiteMove!.ply)}
                onKeyDown={(e) => handleKeyDown(e, group.whiteMove!.ply)}
                aria-current={group.whiteMove.ply === currentPly ? 'step' : undefined}
                aria-label={`Move ${group.moveNumber}, White: ${group.whiteMove.san}`}
              >
                {group.whiteMove.san}
              </button>
            )}

            {group.blackMove && (
              <button
                ref={group.blackMove.ply === currentPly ? currentMoveRef : null}
                className={`${styles.move} ${
                  group.blackMove.ply === currentPly ? styles.current : ''
                }`}
                onClick={() => onMoveClick(group.blackMove!.ply)}
                onKeyDown={(e) => handleKeyDown(e, group.blackMove!.ply)}
                aria-current={group.blackMove.ply === currentPly ? 'step' : undefined}
                aria-label={`Move ${group.moveNumber}, Black: ${group.blackMove.san}`}
              >
                {group.blackMove.san}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
