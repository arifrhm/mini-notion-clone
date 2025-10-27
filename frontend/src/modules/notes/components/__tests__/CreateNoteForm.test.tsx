import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateNoteForm } from '../CreateNoteForm';

describe('CreateNoteForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render input field', () => {
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      expect(screen.getByPlaceholderText(/note title/i)).toBeInTheDocument();
    });

    it('should render Create button', () => {
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should auto-focus on input field', () => {
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i);
      expect(input).toHaveFocus();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty title', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for whitespace-only title', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i);
      await user.type(input, '   ');
      
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.queryByText(/title is required|title cannot be empty/i)).toBeInTheDocument();
      });
    });

    it('should not show error for valid title', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i);
      await user.type(input, 'Valid Title');
      
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with title when form is valid', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i);
      await user.type(input, 'My New Note');
      
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('My New Note');
      });
    });

    it('should handle long titles', async () => {
      const user = userEvent.setup();
      const longTitle = 'A'.repeat(200);
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i);
      await user.type(input, longTitle);
      
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(longTitle);
      });
    });

    it('should handle special characters in title', async () => {
      const user = userEvent.setup();
      const specialTitle = 'Note with !@#$%^&*() special chars';
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i);
      await user.type(input, specialTitle);
      
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(specialTitle);
      });
    });

    it('should submit on Enter key press', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i);
      await user.type(input, 'Quick Note{Enter}');
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Quick Note');
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should call onCancel even with text in input', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i);
      await user.type(input, 'Some text');
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Experience', () => {
    it('should allow typing in the input field', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const input = screen.getByPlaceholderText(/note title/i) as HTMLInputElement;
      await user.type(input, 'Test');
      
      expect(input.value).toBe('Test');
    });

    it('should clear error message when user starts typing', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      // Submit empty to show error
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
      
      // Start typing
      const input = screen.getByPlaceholderText(/note title/i);
      await user.type(input, 'A');
      
      // Error should disappear when user types
      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const form = screen.getByRole('textbox').closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
      });
    });

    it('should display error messages accessibly', async () => {
      const user = userEvent.setup();
      render(<CreateNoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);
      
      const errorMessage = await screen.findByText(/title is required/i);
      expect(errorMessage).toHaveClass('error');
    });
  });
});
