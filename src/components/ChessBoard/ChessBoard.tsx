import { useMemo } from 'react';
import styles from './ChessBoard.module.css';

export interface ChessBoardProps {
  /** FEN string representing the position */
  position: string;
  /** Board orientation - which side is at bottom */
  orientation?: 'white' | 'black';
  /** Optional CSS class name */
  className?: string;
}

interface Square {
  file: string;
  rank: number;
  piece: string | null;
  squareColor: 'light' | 'dark';
}

/**
 * Unicode chess piece symbols
 */
const PIECE_SYMBOLS: Record<string, string> = {
  K: '♔', // White King
  Q: '♕', // White Queen
  R: '♖', // White Rook
  B: '♗', // White Bishop
  N: '♘', // White Knight
  P: '♙', // White Pawn
  k: '♚', // Black King
  q: '♛', // Black Queen
  r: '♜', // Black Rook
  b: '♝', // Black Bishop
  n: '♞', // Black Knight
  p: '♟', // Black Pawn
};

/**
 * Piece names for accessibility
 */
const PIECE_NAMES: Record<string, string> = {
  K: 'White King',
  Q: 'White Queen',
  R: 'White Rook',
  B: 'White Bishop',
  N: 'White Knight',
  P: 'White Pawn',
  k: 'Black King',
  q: 'Black Queen',
  r: 'Black Rook',
  b: 'Black Bishop',
  n: 'Black Knight',
  p: 'Black Pawn',
};

/**
 * Parse FEN string and return board squares
 */
function parseFEN(fen: string): Square[] {
  const [position] = fen.split(' '); // Only care about piece placement
  const ranks = position.split('/');
  const squares: Square[] = [];

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Iterate through ranks (8 to 1)
  ranks.forEach((rankStr, rankIndex) => {
    const rank = 8 - rankIndex;
    let fileIndex = 0;

    for (const char of rankStr) {
      if (/\d/.test(char)) {
        // Number represents empty squares
        const emptyCount = parseInt(char, 10);
        for (let i = 0; i < emptyCount; i++) {
          const file = files[fileIndex];
          const squareColor = (fileIndex + rank) % 2 === 0 ? 'dark' : 'light';
          squares.push({
            file,
            rank,
            piece: null,
            squareColor,
          });
          fileIndex++;
        }
      } else {
        // Letter represents a piece
        const file = files[fileIndex];
        const squareColor = (fileIndex + rank) % 2 === 0 ? 'dark' : 'light';
        squares.push({
          file,
          rank,
          piece: char,
          squareColor,
        });
        fileIndex++;
      }
    }
  });

  return squares;
}

/**
 * ChessBoard Component
 * Displays a read-only chess position with accessibility features
 */
export function ChessBoard({
  position,
  orientation = 'white',
  className = '',
}: ChessBoardProps) {
  const squares = useMemo(() => parseFEN(position), [position]);

  // Reverse squares if showing from black's perspective
  const displaySquares = useMemo(() => {
    return orientation === 'black' ? [...squares].reverse() : squares;
  }, [squares, orientation]);

  const files = orientation === 'white'
    ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  const ranks = orientation === 'white'
    ? [8, 7, 6, 5, 4, 3, 2, 1]
    : [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div
      className={`${styles.board} ${className}`}
      role="grid"
      aria-label={`Chess board, ${orientation} perspective`}
    >
      {/* Rank labels (left side) */}
      <div className={styles.rankLabels}>
        {ranks.map((rank) => (
          <div key={rank} className={styles.rankLabel}>
            {rank}
          </div>
        ))}
      </div>

      {/* Board squares */}
      <div className={styles.squares}>
        {displaySquares.map((square, index) => {
          const squareId = `${square.file}${square.rank}`;
          const piece = square.piece;
          const ariaLabel = piece
            ? `${PIECE_NAMES[piece]} on ${squareId}`
            : `Empty square ${squareId}`;

          return (
            <div
              key={index}
              className={`${styles.square} ${
                square.squareColor === 'light' ? styles.light : styles.dark
              }`}
              role="gridcell"
              aria-label={ariaLabel}
              data-square={squareId}
            >
              {piece && (
                <span className={styles.piece} aria-hidden="true">
                  {PIECE_SYMBOLS[piece]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* File labels (bottom) */}
      <div className={styles.fileLabels}>
        {files.map((file) => (
          <div key={file} className={styles.fileLabel}>
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}
