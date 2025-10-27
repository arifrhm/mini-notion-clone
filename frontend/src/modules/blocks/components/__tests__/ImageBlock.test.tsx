import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageBlock } from '../ImageBlock';

describe('ImageBlock', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should show input mode when content is empty', () => {
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      expect(screen.getByPlaceholderText(/enter image url/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should show image when content is provided', () => {
      const imageUrl = 'https://example.com/image.jpg';
      render(<ImageBlock content={imageUrl} onChange={mockOnChange} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', imageUrl);
    });

    it('should have proper alt text', () => {
      render(<ImageBlock content="https://example.com/image.jpg" onChange={mockOnChange} />);
      
      const image = screen.getByAltText('Block content');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Input Mode', () => {
    it('should allow typing URL', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/enter image url/i);
      await user.type(input, 'https://example.com/test.jpg');
      
      expect(input).toHaveValue('https://example.com/test.jpg');
    });

    it('should save URL when clicking Save button', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/enter image url/i);
      await user.type(input, 'https://example.com/image.jpg');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(mockOnChange).toHaveBeenCalledWith('https://example.com/image.jpg');
    });

    it('should switch to display mode after saving', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/enter image url/i);
      await user.type(input, 'https://example.com/image.jpg');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/enter image url/i)).not.toBeInTheDocument();
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle empty URL submission', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(mockOnChange).toHaveBeenCalledWith('');
      
      // Should show error placeholder and red border
      const input = screen.getByPlaceholderText('URL cannot be empty');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('input-error');
      // Check that border color is set (browser converts 'red' to rgb values)
      expect(input.style.borderColor).toBe('red');
      
      // Should remain in edit mode
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  describe('Display Mode', () => {
    it('should switch to edit mode when clicking image', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="https://example.com/image.jpg" onChange={mockOnChange} />);
      
      const image = screen.getByRole('img');
      await user.click(image);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter image url/i)).toBeInTheDocument();
      });
    });

    it('should preserve URL when switching to edit mode', async () => {
      const user = userEvent.setup();
      const imageUrl = 'https://example.com/image.jpg';
      render(<ImageBlock content={imageUrl} onChange={mockOnChange} />);
      
      const image = screen.getByRole('img');
      await user.click(image);
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/enter image url/i);
        expect(input).toHaveValue(imageUrl);
      });
    });

    it('should update image when URL changes', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="https://example.com/old.jpg" onChange={mockOnChange} />);
      
      const image = screen.getByRole('img');
      await user.click(image);
      
      const input = await screen.findByPlaceholderText(/enter image url/i);
      await user.clear(input);
      await user.type(input, 'https://example.com/new.jpg');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(mockOnChange).toHaveBeenCalledWith('https://example.com/new.jpg');
    });
  });

  describe('URL Validation', () => {
    it('should handle various image URL formats', async () => {
      const user = userEvent.setup();
      const urls = [
        'https://example.com/image.jpg',
        'http://example.com/photo.png',
        'https://cdn.example.com/assets/img/picture.gif',
      ];
      
      for (const url of urls) {
        mockOnChange.mockClear();
        const { unmount } = render(<ImageBlock content="" onChange={mockOnChange} />);
        
        const input = screen.getByPlaceholderText(/enter image url/i);
        await user.type(input, url);
        
        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);
        
        expect(mockOnChange).toHaveBeenCalledWith(url);
        unmount();
      }
    });

    it('should handle relative URLs', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/enter image url/i);
      await user.type(input, '/images/photo.jpg');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(mockOnChange).toHaveBeenCalledWith('/images/photo.jpg');
    });
  });

  describe('State Management', () => {
    it('should maintain editing state', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      // Should start in editing mode
      expect(screen.getByPlaceholderText(/enter image url/i)).toBeInTheDocument();
      
      const input = screen.getByPlaceholderText(/enter image url/i);
      await user.type(input, 'https://example.com/image.jpg');
      
      // Should still be in editing mode
      expect(screen.getByPlaceholderText(/enter image url/i)).toBeInTheDocument();
    });

    it('should handle rapid mode switching', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="https://example.com/image.jpg" onChange={mockOnChange} />);
      
      // Click to edit
      const image = screen.getByRole('img');
      await user.click(image);
      
      // Save immediately
      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Should be back in display mode
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });
  });

  describe('Props Handling', () => {
    it('should handle content prop updates', () => {
      const { rerender } = render(<ImageBlock content="" onChange={mockOnChange} />);
      
      expect(screen.getByPlaceholderText(/enter image url/i)).toBeInTheDocument();
      
      rerender(<ImageBlock content="https://example.com/image.jpg" onChange={mockOnChange} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should not call onChange on initial render', () => {
      render(<ImageBlock content="https://example.com/image.jpg" onChange={mockOnChange} />);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible input field', () => {
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/enter image url/i);
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should have accessible save button', () => {
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should have alt text for image', () => {
      render(<ImageBlock content="https://example.com/image.jpg" onChange={mockOnChange} />);
      
      const image = screen.getByAltText('Block content');
      expect(image).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      // Tab to input
      await user.tab();
      expect(screen.getByPlaceholderText(/enter image url/i)).toHaveFocus();
      
      // Tab to button
      await user.tab();
      expect(screen.getByRole('button', { name: /save/i })).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long URLs', async () => {
      const user = userEvent.setup();
      const longUrl = 'https://example.com/' + 'a'.repeat(500) + '.jpg';
      
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/enter image url/i);
      await user.type(input, longUrl);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(mockOnChange).toHaveBeenCalledWith(longUrl);
    });

    it('should handle URLs with special characters', async () => {
      const user = userEvent.setup();
      const specialUrl = 'https://example.com/image%20with%20spaces.jpg?param=value&other=123';
      
      render(<ImageBlock content="" onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/enter image url/i);
      await user.type(input, specialUrl);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(mockOnChange).toHaveBeenCalledWith(specialUrl);
    });
  });
});
