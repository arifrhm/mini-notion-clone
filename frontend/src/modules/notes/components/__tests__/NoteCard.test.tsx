import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteCard } from '../NoteCard';
import { Note } from '../../types';

describe('NoteCard', () => {
  const mockNote: Note = {
    id: 1,
    user_id: 1,
    title: 'Test Note',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render note title', () => {
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });

    it('should render formatted update date', () => {
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText(/Updated:/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });

    it('should render Edit button', () => {
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should render Delete button', () => {
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onEdit when clicking on card content', async () => {
      const user = userEvent.setup();
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const cardContent = screen.getByText('Test Note').closest('.note-card-content');
      await user.click(cardContent!);
      
      expect(mockOnEdit).toHaveBeenCalledWith(1);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onEdit when clicking Edit button', async () => {
      const user = userEvent.setup();
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledWith(1);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when clicking Delete button', async () => {
      const user = userEvent.setup();
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledWith(1);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation when clicking Edit button', async () => {
      const user = userEvent.setup();
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      // Should only call onEdit once (from button), not twice (button + card)
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation when clicking Delete button', async () => {
      const user = userEvent.setup();
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      
      // Should only call onDelete (from button), onEdit should not be called
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    it('should handle different note IDs', async () => {
      const user = userEvent.setup();
      const noteWithDifferentId: Note = { ...mockNote, id: 999 };
      
      render(<NoteCard note={noteWithDifferentId} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledWith(999);
    });

    it('should handle long note titles', () => {
      const longTitleNote: Note = {
        ...mockNote,
        title: 'This is a very long note title that should still render correctly',
      };
      
      render(<NoteCard note={longTitleNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText(longTitleNote.title)).toBeInTheDocument();
    });

    it('should handle empty note title', () => {
      const emptyTitleNote: Note = { ...mockNote, title: '' };
      
      render(<NoteCard note={emptyTitleNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      // Should still render the structure
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('should have descriptive button text', () => {
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });
});
