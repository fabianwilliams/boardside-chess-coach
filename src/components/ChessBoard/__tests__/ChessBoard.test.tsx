import { render, screen } from '@testing-library/react';
import { ChessBoard } from '../ChessBoard';

describe('ChessBoard', () => {
  const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  describe('rendering', () => {
    it('should render board with starting position', () => {
      render(<ChessBoard position={startingPosition} />);

      const board = screen.getByRole('grid', {
        name: /chess board, white perspective/i,
      });
      expect(board).toBeInTheDocument();
    });

    it('should render 64 squares', () => {
      render(<ChessBoard position={startingPosition} />);

      const squares = screen.getAllByRole('gridcell');
      expect(squares).toHaveLength(64);
    });

    it('should render file labels (a-h)', () => {
      render(<ChessBoard position={startingPosition} />);

      expect(screen.getByText('a')).toBeInTheDocument();
      expect(screen.getByText('b')).toBeInTheDocument();
      expect(screen.getByText('c')).toBeInTheDocument();
      expect(screen.getByText('d')).toBeInTheDocument();
      expect(screen.getByText('e')).toBeInTheDocument();
      expect(screen.getByText('f')).toBeInTheDocument();
      expect(screen.getByText('g')).toBeInTheDocument();
      expect(screen.getByText('h')).toBeInTheDocument();
    });

    it('should render rank labels (1-8)', () => {
      render(<ChessBoard position={startingPosition} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  describe('FEN parsing', () => {
    it('should place pieces correctly from starting position', () => {
      render(<ChessBoard position={startingPosition} />);

      // Check white pieces
      expect(screen.getByLabelText(/white king on e1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/white queen on d1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/white rook on a1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/white rook on h1/i)).toBeInTheDocument();

      // Check black pieces
      expect(screen.getByLabelText(/black king on e8/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/black queen on d8/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/black rook on a8/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/black rook on h8/i)).toBeInTheDocument();
    });

    it('should handle empty squares', () => {
      render(<ChessBoard position={startingPosition} />);

      // d4 should be empty in starting position
      expect(screen.getByLabelText(/empty square d4/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/empty square e5/i)).toBeInTheDocument();
    });

    it('should parse custom position correctly', () => {
      // Position after 1. e4
      const customPosition = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      render(<ChessBoard position={customPosition} />);

      expect(screen.getByLabelText(/white pawn on e4/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/empty square e2/i)).toBeInTheDocument();
    });

    it('should handle endgame position with few pieces', () => {
      // King and pawn endgame
      const endgame = '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1';
      render(<ChessBoard position={endgame} />);

      expect(screen.getByLabelText(/white king on e3/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/white pawn on e2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/black king on e5/i)).toBeInTheDocument();

      // Most squares should be empty
      const emptySquares = screen.getAllByLabelText(/empty square/i);
      expect(emptySquares.length).toBeGreaterThan(50);
    });
  });

  describe('orientation', () => {
    it('should display white perspective by default', () => {
      render(<ChessBoard position={startingPosition} />);

      const board = screen.getByRole('grid');
      expect(board).toHaveAccessibleName(/white perspective/i);
    });

    it('should display black perspective when specified', () => {
      render(<ChessBoard position={startingPosition} orientation="black" />);

      const board = screen.getByRole('grid');
      expect(board).toHaveAccessibleName(/black perspective/i);
    });

    it('should have same pieces regardless of orientation', () => {
      const { rerender } = render(
        <ChessBoard position={startingPosition} orientation="white" />
      );

      const whiteKingWhitePerspective = screen.getByLabelText(/white king on e1/i);
      expect(whiteKingWhitePerspective).toBeInTheDocument();

      rerender(<ChessBoard position={startingPosition} orientation="black" />);

      const whiteKingBlackPerspective = screen.getByLabelText(/white king on e1/i);
      expect(whiteKingBlackPerspective).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have grid role for screen readers', () => {
      render(<ChessBoard position={startingPosition} />);

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should have gridcell role for each square', () => {
      render(<ChessBoard position={startingPosition} />);

      const cells = screen.getAllByRole('gridcell');
      expect(cells.length).toBe(64);
    });

    it('should have aria-label for each square with piece', () => {
      render(<ChessBoard position={startingPosition} />);

      // All 32 pieces should have descriptive labels
      expect(screen.getByLabelText(/white king on e1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/white pawn on a2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/black knight on b8/i)).toBeInTheDocument();
    });

    it('should have aria-label for empty squares', () => {
      render(<ChessBoard position={startingPosition} />);

      expect(screen.getByLabelText(/empty square d4/i)).toBeInTheDocument();
    });

    it('should mark piece symbols as aria-hidden', () => {
      const { container } = render(<ChessBoard position={startingPosition} />);

      const pieceSpans = container.querySelectorAll('[aria-hidden="true"]');
      expect(pieceSpans.length).toBeGreaterThan(0);
    });
  });

  describe('styling', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <ChessBoard position={startingPosition} className="custom-class" />
      );

      const board = container.querySelector('.custom-class');
      expect(board).toBeInTheDocument();
    });

    it('should have data-square attribute on each square', () => {
      render(<ChessBoard position={startingPosition} />);

      const e4Square = screen.getByLabelText(/empty square e4/i);
      expect(e4Square).toHaveAttribute('data-square', 'e4');

      const e1Square = screen.getByLabelText(/white king on e1/i);
      expect(e1Square).toHaveAttribute('data-square', 'e1');
    });
  });

  describe('edge cases', () => {
    it('should handle FEN with only position part', () => {
      const positionOnly = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
      render(<ChessBoard position={positionOnly} />);

      expect(screen.getByLabelText(/white king on e1/i)).toBeInTheDocument();
    });

    it('should handle complex FEN with castling and en passant', () => {
      const complexFen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
      render(<ChessBoard position={complexFen} />);

      expect(screen.getByLabelText(/white king on e1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/white bishop on c4/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/black knight on c6/i)).toBeInTheDocument();
    });
  });
});
