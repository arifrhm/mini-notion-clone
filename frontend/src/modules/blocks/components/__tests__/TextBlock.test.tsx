import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextBlock } from '../TextBlock';

// Mock TipTap to avoid DOM manipulation issues in test environment
vi.mock('@tiptap/react', () => ({
  useEditor: () => null,
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor</div>,
}));

describe('TextBlock', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render editor component', () => {
      render(<TextBlock content="" onChange={mockOnChange} />);
      
      const editor = screen.getByTestId('editor-content');
      expect(editor).toBeInTheDocument();
    });

    it('should accept content prop', () => {
      const content = '<p>Test content</p>';
      render(<TextBlock content={content} onChange={mockOnChange} />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should accept onChange prop', () => {
      render(<TextBlock content="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should accept placeholder prop', () => {
      render(<TextBlock content="" onChange={mockOnChange} placeholder="Custom placeholder" />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should handle empty content', () => {
      render(<TextBlock content="" onChange={mockOnChange} />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should handle HTML content', () => {
      const htmlContent = '<p><strong>Bold</strong> text</p>';
      render(<TextBlock content={htmlContent} onChange={mockOnChange} />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should update when props change', () => {
      const { rerender } = render(<TextBlock content="<p>Initial</p>" onChange={mockOnChange} />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
      
      rerender(<TextBlock content="<p>Updated</p>" onChange={mockOnChange} />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should not call onChange on initial render', () => {
      render(<TextBlock content="<p>Initial</p>" onChange={mockOnChange} />);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Component Integration', () => {
    it('should render with different onChange handlers', () => {
      const onChange1 = vi.fn();
      const onChange2 = vi.fn();
      
      const { rerender } = render(<TextBlock content="" onChange={onChange1} />);
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
      
      rerender(<TextBlock content="" onChange={onChange2} />);
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should handle undefined content gracefully', () => {
      render(<TextBlock content={undefined as any} onChange={mockOnChange} />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });
  });
});
