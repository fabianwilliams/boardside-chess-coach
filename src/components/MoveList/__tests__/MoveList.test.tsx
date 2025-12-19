import { render, screen, fireEvent } from '@testing-library/react';
import { MoveList, Move } from '../MoveList';

describe('MoveList', () => {
  const sampleMoves: Move[] = [
    { ply: 0, san: 'e4', moveNumber: 1, isWhiteMove: true },
    { ply: 1, san: 'e5', moveNumber: 1, isWhiteMove: false },
    { ply: 2, san: 'Nf3', moveNumber: 2, isWhiteMove: true },
    { ply: 3, san: 'Nc6', moveNumber: 2, isWhiteMove: false },
    { ply: 4, san: 'Bc4', moveNumber: 3, isWhiteMove: true },
    { ply: 5, san: 'Bc5', moveNumber: 3, isWhiteMove: false },
  ];

  const mockOnMoveClick = jest.fn();

  beforeEach(() => {
    mockOnMoveClick.mockClear();
  });

  describe('rendering', () => {
    it('should render move list with navigation role', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const nav = screen.getByRole('navigation', { name: /move list/i });
      expect(nav).toBeInTheDocument();
    });

    it('should render all moves', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      expect(screen.getByText('e4')).toBeInTheDocument();
      expect(screen.getByText('e5')).toBeInTheDocument();
      expect(screen.getByText('Nf3')).toBeInTheDocument();
      expect(screen.getByText('Nc6')).toBeInTheDocument();
      expect(screen.getByText('Bc4')).toBeInTheDocument();
      expect(screen.getByText('Bc5')).toBeInTheDocument();
    });

    it('should display move numbers', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('3.')).toBeInTheDocument();
    });

    it('should group white and black moves together', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      // Verify moves are displayed in pairs
      const e4Button = screen.getByLabelText(/move 1, white: e4/i);
      const e5Button = screen.getByLabelText(/move 1, black: e5/i);

      expect(e4Button).toBeInTheDocument();
      expect(e5Button).toBeInTheDocument();
    });

    it('should render empty state when no moves', () => {
      render(<MoveList moves={[]} currentPly={0} onMoveClick={mockOnMoveClick} />);

      expect(screen.getByText(/no moves yet/i)).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <MoveList
          moves={sampleMoves}
          currentPly={0}
          onMoveClick={mockOnMoveClick}
          className="custom-class"
        />
      );

      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });
  });

  describe('current move highlighting', () => {
    it('should highlight current move', () => {
      render(<MoveList moves={sampleMoves} currentPly={2} onMoveClick={mockOnMoveClick} />);

      const nf3Button = screen.getByText('Nf3');
      expect(nf3Button).toHaveClass('current');
    });

    it('should have aria-current on current move', () => {
      render(<MoveList moves={sampleMoves} currentPly={1} onMoveClick={mockOnMoveClick} />);

      const e5Button = screen.getByLabelText(/move 1, black: e5/i);
      expect(e5Button).toHaveAttribute('aria-current', 'step');
    });

    it('should not have aria-current on non-current moves', () => {
      render(<MoveList moves={sampleMoves} currentPly={1} onMoveClick={mockOnMoveClick} />);

      const e4Button = screen.getByLabelText(/move 1, white: e4/i);
      expect(e4Button).not.toHaveAttribute('aria-current');
    });

    it('should update highlight when currentPly changes', () => {
      const { rerender } = render(
        <MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />
      );

      const e4Button = screen.getByText('e4');
      expect(e4Button).toHaveClass('current');

      rerender(<MoveList moves={sampleMoves} currentPly={3} onMoveClick={mockOnMoveClick} />);

      expect(e4Button).not.toHaveClass('current');
      const nc6Button = screen.getByText('Nc6');
      expect(nc6Button).toHaveClass('current');
    });
  });

  describe('move click interaction', () => {
    it('should call onMoveClick when move is clicked', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const nf3Button = screen.getByText('Nf3');
      fireEvent.click(nf3Button);

      expect(mockOnMoveClick).toHaveBeenCalledWith(2);
      expect(mockOnMoveClick).toHaveBeenCalledTimes(1);
    });

    it('should call onMoveClick for both white and black moves', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const e4Button = screen.getByText('e4');
      fireEvent.click(e4Button);
      expect(mockOnMoveClick).toHaveBeenCalledWith(0);

      const e5Button = screen.getByText('e5');
      fireEvent.click(e5Button);
      expect(mockOnMoveClick).toHaveBeenCalledWith(1);
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate to next move with ArrowDown', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const e4Button = screen.getByText('e4');
      fireEvent.keyDown(e4Button, { key: 'ArrowDown' });

      expect(mockOnMoveClick).toHaveBeenCalledWith(1);
    });

    it('should navigate to previous move with ArrowUp', () => {
      render(<MoveList moves={sampleMoves} currentPly={3} onMoveClick={mockOnMoveClick} />);

      const nc6Button = screen.getByText('Nc6');
      fireEvent.keyDown(nc6Button, { key: 'ArrowUp' });

      expect(mockOnMoveClick).toHaveBeenCalledWith(2);
    });

    it('should not navigate before first move with ArrowUp', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const e4Button = screen.getByText('e4');
      fireEvent.keyDown(e4Button, { key: 'ArrowUp' });

      expect(mockOnMoveClick).not.toHaveBeenCalled();
    });

    it('should not navigate after last move with ArrowDown', () => {
      render(<MoveList moves={sampleMoves} currentPly={5} onMoveClick={mockOnMoveClick} />);

      const bc5Button = screen.getByText('Bc5');
      fireEvent.keyDown(bc5Button, { key: 'ArrowDown' });

      expect(mockOnMoveClick).not.toHaveBeenCalled();
    });

    it('should navigate to start with Home key', () => {
      render(<MoveList moves={sampleMoves} currentPly={3} onMoveClick={mockOnMoveClick} />);

      const nc6Button = screen.getByText('Nc6');
      fireEvent.keyDown(nc6Button, { key: 'Home' });

      expect(mockOnMoveClick).toHaveBeenCalledWith(0);
    });

    it('should navigate to end with End key', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const e4Button = screen.getByText('e4');
      fireEvent.keyDown(e4Button, { key: 'End' });

      expect(mockOnMoveClick).toHaveBeenCalledWith(5);
    });

    it('should activate move with Enter key', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const nf3Button = screen.getByText('Nf3');
      fireEvent.keyDown(nf3Button, { key: 'Enter' });

      expect(mockOnMoveClick).toHaveBeenCalledWith(2);
    });

    it('should activate move with Space key', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const nf3Button = screen.getByText('Nf3');
      fireEvent.keyDown(nf3Button, { key: ' ' });

      expect(mockOnMoveClick).toHaveBeenCalledWith(2);
    });
  });

  describe('accessibility', () => {
    it('should have descriptive aria-label for each move', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      expect(screen.getByLabelText(/move 1, white: e4/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/move 1, black: e5/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/move 2, white: nf3/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/move 2, black: nc6/i)).toBeInTheDocument();
    });

    it('should be keyboard focusable', () => {
      render(<MoveList moves={sampleMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      const e4Button = screen.getByText('e4');
      e4Button.focus();

      expect(e4Button).toHaveFocus();
    });
  });

  describe('edge cases', () => {
    it('should handle single move', () => {
      const singleMove: Move[] = [
        { ply: 0, san: 'e4', moveNumber: 1, isWhiteMove: true },
      ];

      render(<MoveList moves={singleMove} currentPly={0} onMoveClick={mockOnMoveClick} />);

      expect(screen.getByText('e4')).toBeInTheDocument();
      expect(screen.getByText('1.')).toBeInTheDocument();
    });

    it('should handle odd number of moves', () => {
      const oddMoves: Move[] = [
        { ply: 0, san: 'e4', moveNumber: 1, isWhiteMove: true },
        { ply: 1, san: 'e5', moveNumber: 1, isWhiteMove: false },
        { ply: 2, san: 'Nf3', moveNumber: 2, isWhiteMove: true },
      ];

      render(<MoveList moves={oddMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      expect(screen.getByText('e4')).toBeInTheDocument();
      expect(screen.getByText('e5')).toBeInTheDocument();
      expect(screen.getByText('Nf3')).toBeInTheDocument();
    });

    it('should handle special chess notation', () => {
      const specialMoves: Move[] = [
        { ply: 0, san: 'O-O', moveNumber: 1, isWhiteMove: true },
        { ply: 1, san: 'O-O-O', moveNumber: 1, isWhiteMove: false },
        { ply: 2, san: 'Nxe5+', moveNumber: 2, isWhiteMove: true },
        { ply: 3, san: 'Qh5#', moveNumber: 2, isWhiteMove: false },
      ];

      render(<MoveList moves={specialMoves} currentPly={0} onMoveClick={mockOnMoveClick} />);

      expect(screen.getByText('O-O')).toBeInTheDocument();
      expect(screen.getByText('O-O-O')).toBeInTheDocument();
      expect(screen.getByText('Nxe5+')).toBeInTheDocument();
      expect(screen.getByText('Qh5#')).toBeInTheDocument();
    });
  });
});
