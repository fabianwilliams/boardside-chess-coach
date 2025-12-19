import { render, screen } from '@testing-library/react';
import { Badge, ArchetypeBadge } from '../Badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should apply default variant by default', () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('default');
    });

    it('should apply primary variant', () => {
      const { container } = render(<Badge variant="primary">Primary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('primary');
    });

    it('should apply secondary variant', () => {
      const { container } = render(
        <Badge variant="secondary">Secondary</Badge>
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('secondary');
    });

    it('should apply success variant', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('success');
    });

    it('should apply warning variant', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('warning');
    });

    it('should apply error variant', () => {
      const { container } = render(<Badge variant="error">Error</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('error');
    });

    it('should apply info variant', () => {
      const { container } = render(<Badge variant="info">Info</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('info');
    });
  });

  describe('custom props', () => {
    it('should forward custom className', () => {
      const { container } = render(
        <Badge className="custom-class">Custom</Badge>
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('custom-class');
    });

    it('should forward aria-label', () => {
      render(<Badge aria-label="Custom label">Badge</Badge>);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });
  });
});

describe('ArchetypeBadge', () => {
  describe('rendering', () => {
    it('should render TJ archetype with default label', () => {
      render(<ArchetypeBadge archetype="TJ" />);
      expect(screen.getByText('Thinking-Judging')).toBeInTheDocument();
    });

    it('should render TP archetype with default label', () => {
      render(<ArchetypeBadge archetype="TP" />);
      expect(screen.getByText('Thinking-Perceiving')).toBeInTheDocument();
    });

    it('should render FJ archetype with default label', () => {
      render(<ArchetypeBadge archetype="FJ" />);
      expect(screen.getByText('Feeling-Judging')).toBeInTheDocument();
    });

    it('should render FP archetype with default label', () => {
      render(<ArchetypeBadge archetype="FP" />);
      expect(screen.getByText('Feeling-Perceiving')).toBeInTheDocument();
    });

    it('should render Neutral archetype with default label', () => {
      render(<ArchetypeBadge archetype="Neutral" />);
      expect(screen.getByText('Neutral')).toBeInTheDocument();
    });

    it('should use custom children text', () => {
      render(<ArchetypeBadge archetype="TJ">Custom TJ</ArchetypeBadge>);
      expect(screen.getByText('Custom TJ')).toBeInTheDocument();
      expect(screen.queryByText('Thinking-Judging')).not.toBeInTheDocument();
    });
  });

  describe('variant mapping', () => {
    it('should apply primary variant for TJ', () => {
      const { container } = render(<ArchetypeBadge archetype="TJ" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('primary');
    });

    it('should apply info variant for TP', () => {
      const { container } = render(<ArchetypeBadge archetype="TP" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('info');
    });

    it('should apply success variant for FJ', () => {
      const { container } = render(<ArchetypeBadge archetype="FJ" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('success');
    });

    it('should apply secondary variant for FP', () => {
      const { container } = render(<ArchetypeBadge archetype="FP" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('secondary');
    });

    it('should apply default variant for Neutral', () => {
      const { container } = render(<ArchetypeBadge archetype="Neutral" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('default');
    });
  });
});
