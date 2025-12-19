import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  describe('rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should apply primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('primary');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('secondary');
    });

    it('should apply ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('ghost');
    });

    it('should apply medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('medium');
    });

    it('should apply small size', () => {
      render(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('small');
    });

    it('should apply large size', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('large');
    });

    it('should apply fullWidth class', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('fullWidth');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should be disabled when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show spinner when loading', () => {
      render(<Button isLoading>Loading</Button>);
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    it('should apply loading class', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('loading');
    });

    it('should still show button text when loading', () => {
      render(<Button isLoading>Loading</Button>);
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support keyboard interaction (Enter)', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support keyboard interaction (Space)', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Press Space</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom props', () => {
    it('should forward custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('should forward aria-label', () => {
      render(<Button aria-label="Custom label">Icon</Button>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('should forward type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });
});
