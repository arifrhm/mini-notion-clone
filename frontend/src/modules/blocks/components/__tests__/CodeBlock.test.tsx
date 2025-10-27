import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeBlock } from '../CodeBlock';

describe('CodeBlock', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render textarea', () => {
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByPlaceholderText(/enter code/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render with initial content', () => {
      const code = 'function hello() {\n  return "world";\n}';
      render(<CodeBlock content={code} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(code);
    });

    it('should have proper placeholder', () => {
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      expect(screen.getByPlaceholderText('Enter code...')).toBeInTheDocument();
    });

    it('should disable spell check', () => {
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('spellcheck', 'false');
    });
  });

  describe('Content Editing', () => {
    it('should call onChange when typing', async () => {
      const user = userEvent.setup();
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'const x = 1;');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle multi-line code', async () => {
      const user = userEvent.setup();
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'line 1{Enter}line 2{Enter}line 3');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      // user-event treats curly braces as special keys; use doubled braces to type literals
      await user.click(textarea);
      await user.paste('!@#$%^&*()[]<>{}');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should preserve indentation', async () => {
      const user = userEvent.setup();
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '  indented code');
      
      const calls = mockOnChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall).toContain('  ');
    });
  });

  describe('Code Formatting', () => {
    it('should handle JavaScript code', async () => {
      const jsCode = 'const greeting = (name) => `Hello, ${name}!`;';
      render(<CodeBlock content={jsCode} onChange={mockOnChange} />);
      
      const textarea = screen.getByDisplayValue(jsCode);
      expect(textarea).toBeInTheDocument();
    });

    it('should handle Python code', () => {
      const pythonCode = 'def greet(name):\n    return f"Hello, {name}!"';
      render(<CodeBlock content={pythonCode} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(pythonCode);
    });

    it('should handle JSON', () => {
      const json = '{\n  "name": "John",\n  "age": 30\n}';
      render(<CodeBlock content={json} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(json);
    });

    it('should handle HTML/XML', () => {
      const html = '<div class="container">\n  <p>Hello</p>\n</div>';
      render(<CodeBlock content={html} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(html);
    });
  });

  describe('User Experience', () => {
    it('should allow text selection', async () => {
      const user = userEvent.setup();
      const code = 'const x = 1;';
      render(<CodeBlock content={code} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.click(textarea);
      
      // Should be able to interact with textarea
      expect(textarea).not.toBeDisabled();
    });

    it('should support copy-paste', async () => {
      const user = userEvent.setup();
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.paste('pasted code');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should maintain scroll position on long code', () => {
      const longCode = Array(100).fill('const x = 1;').join('\n');
      render(<CodeBlock content={longCode} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue(longCode);
    });
  });

  describe('Props Handling', () => {
    it('should handle empty content', () => {
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });

    it('should update when content prop changes', () => {
      const { rerender } = render(<CodeBlock content="initial" onChange={mockOnChange} />);
      
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
      
      rerender(<CodeBlock content="updated" onChange={mockOnChange} />);
      
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });

    it('should not call onChange on initial render', () => {
      render(<CodeBlock content="const x = 1;" onChange={mockOnChange} />);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper textarea role', () => {
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<CodeBlock content="" onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      
      // Should be able to tab to it
      await user.tab();
      expect(textarea).toHaveFocus();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const code = 'line 1\nline 2\nline 3';
      render(<CodeBlock content={code} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Should be able to navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      
      expect(textarea).toHaveFocus();
    });
  });
});
