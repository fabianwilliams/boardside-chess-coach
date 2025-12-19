import { render, screen } from '@testing-library/react';
import { AnnotationPanel } from '../AnnotationPanel';
import { EducationalAnnotation } from '@domain/chess/types';
import { Archetype } from '@domain/quiz/types';

// Mock the languageAdapter
jest.mock('@domain/language/languageAdapter', () => ({
  adapt: jest.fn((text: string, archetype: string) => {
    // Simple mock that adds archetype prefix
    return `[${archetype}] ${text}`;
  }),
}));

describe('AnnotationPanel', () => {
  const sampleAnnotation: EducationalAnnotation = {
    principle: 'King Safety',
    principleId: 'king-safety',
    text: 'This move improves king safety by castling.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render annotation with principle badge', () => {
      render(<AnnotationPanel annotation={sampleAnnotation} archetype="TJ" />);

      expect(screen.getByText('King Safety')).toBeInTheDocument();
      expect(screen.getByText(/This move improves king safety/)).toBeInTheDocument();
    });

    it('should render empty state when no annotation', () => {
      render(<AnnotationPanel annotation={null} archetype="TJ" />);

      expect(screen.getByText(/click on a move to see its annotation/i)).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <AnnotationPanel
          annotation={sampleAnnotation}
          archetype="TJ"
          className="custom-class"
        />
      );

      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });
  });

  describe('language adaptation', () => {
    it('should adapt text for TJ archetype', () => {
      render(<AnnotationPanel annotation={sampleAnnotation} archetype="TJ" />);

      expect(screen.getByText(/\[TJ\]/)).toBeInTheDocument();
    });

    it('should adapt text for TP archetype', () => {
      render(<AnnotationPanel annotation={sampleAnnotation} archetype="TP" />);

      expect(screen.getByText(/\[TP\]/)).toBeInTheDocument();
    });

    it('should adapt text for FJ archetype', () => {
      render(<AnnotationPanel annotation={sampleAnnotation} archetype="FJ" />);

      expect(screen.getByText(/\[FJ\]/)).toBeInTheDocument();
    });

    it('should adapt text for FP archetype', () => {
      render(<AnnotationPanel annotation={sampleAnnotation} archetype="FP" />);

      expect(screen.getByText(/\[FP\]/)).toBeInTheDocument();
    });

    it('should adapt text for Neutral archetype', () => {
      render(<AnnotationPanel annotation={sampleAnnotation} archetype="Neutral" />);

      expect(screen.getByText(/\[Neutral\]/)).toBeInTheDocument();
    });

    it('should not adapt text when archetype is null', () => {
      render(<AnnotationPanel annotation={sampleAnnotation} archetype={null} />);

      // Should show original text without adaptation
      expect(screen.getByText('This move improves king safety by castling.')).toBeInTheDocument();
    });
  });

  describe('principle badge', () => {
    it('should display principle name', () => {
      render(<AnnotationPanel annotation={sampleAnnotation} archetype="TJ" />);

      expect(screen.getByText('King Safety')).toBeInTheDocument();
    });

    it('should display badge for different principles', () => {
      const developmentAnnotation: EducationalAnnotation = {
        principle: 'Development',
        principleId: 'development',
        text: 'Develop your pieces quickly.',
      };

      render(<AnnotationPanel annotation={developmentAnnotation} archetype="TJ" />);

      expect(screen.getByText('Development')).toBeInTheDocument();
    });

    it('should handle long principle names', () => {
      const longPrinciple: EducationalAnnotation = {
        principle: 'Advanced Pawn Structure Considerations',
        principleId: 'pawn-structure',
        text: 'This affects the pawn structure.',
      };

      render(<AnnotationPanel annotation={longPrinciple} archetype="TJ" />);

      expect(screen.getByText('Advanced Pawn Structure Considerations')).toBeInTheDocument();
    });
  });

  describe('different annotation types', () => {
    it('should render tactics annotation', () => {
      const tacticsAnnotation: EducationalAnnotation = {
        principle: 'Fork Tactic',
        principleId: 'fork-tactics',
        text: 'This knight move creates a fork attacking two pieces.',
      };

      render(<AnnotationPanel annotation={tacticsAnnotation} archetype="TJ" />);

      expect(screen.getByText('Fork Tactic')).toBeInTheDocument();
    });

    it('should render center control annotation', () => {
      const centerAnnotation: EducationalAnnotation = {
        principle: 'Center Control',
        principleId: 'center-control',
        text: 'Controlling the center gives you more space and flexibility.',
      };

      render(<AnnotationPanel annotation={centerAnnotation} archetype="FJ" />);

      expect(screen.getByText('Center Control')).toBeInTheDocument();
    });

    it('should render pawn structure annotation', () => {
      const pawnAnnotation: EducationalAnnotation = {
        principle: 'Pawn Chain',
        principleId: 'pawn-chain-structure',
        text: 'Creating a strong pawn chain.',
      };

      render(<AnnotationPanel annotation={pawnAnnotation} archetype="FP" />);

      expect(screen.getByText('Pawn Chain')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle annotation with special characters', () => {
      const specialAnnotation: EducationalAnnotation = {
        principle: 'Opening Theory',
        principleId: 'opening',
        text: 'The Ruy López (Spanish Opening) is 1.e4 e5 2.Nf3 Nc6 3.Bb5',
      };

      render(<AnnotationPanel annotation={specialAnnotation} archetype="TJ" />);

      expect(screen.getByText(/Ruy López/)).toBeInTheDocument();
    });

    it('should handle empty text', () => {
      const emptyTextAnnotation: EducationalAnnotation = {
        principle: 'No Comment',
        principleId: 'no-comment',
        text: '',
      };

      render(<AnnotationPanel annotation={emptyTextAnnotation} archetype="TJ" />);

      expect(screen.getByText('No Comment')).toBeInTheDocument();
    });

    it('should handle very long annotation text', () => {
      const longAnnotation: EducationalAnnotation = {
        principle: 'Complex Strategy',
        principleId: 'complex',
        text: 'This is a very long annotation that explains in great detail the strategic considerations behind this move, including various tactical nuances, positional factors, and long-term planning that the player must consider when evaluating this position.',
      };

      render(<AnnotationPanel annotation={longAnnotation} archetype="FP" />);

      expect(screen.getByText(/very long annotation/)).toBeInTheDocument();
    });
  });

  describe('archetype adaptation integration', () => {
    it('should pass correct parameters to adapt function', () => {
      const { adapt } = require('@domain/language/languageAdapter');

      render(<AnnotationPanel annotation={sampleAnnotation} archetype="TJ" />);

      expect(adapt).toHaveBeenCalledWith(
        'This move improves king safety by castling.',
        'TJ'
      );
    });

    it('should not call adapt when archetype is null', () => {
      const { adapt } = require('@domain/language/languageAdapter');

      render(<AnnotationPanel annotation={sampleAnnotation} archetype={null} />);

      expect(adapt).not.toHaveBeenCalled();
    });

    it('should call adapt for each archetype type', () => {
      const { adapt } = require('@domain/language/languageAdapter');
      const archetypes: Archetype[] = ['TJ', 'TP', 'FJ', 'FP', 'Neutral'];

      archetypes.forEach((archetype) => {
        const { rerender } = render(
          <AnnotationPanel annotation={sampleAnnotation} archetype={archetype} />
        );

        expect(adapt).toHaveBeenCalledWith(sampleAnnotation.text, archetype);

        rerender(<div />); // Cleanup
      });

      expect(adapt).toHaveBeenCalledTimes(archetypes.length);
    });
  });
});
