import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChecklistBlock } from '../ChecklistBlock';

describe('ChecklistBlock', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render empty checklist', () => {
      render(<ChecklistBlock content="[]" onChange={mockOnChange} />);
      
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });

    it('should render checklist items', () => {
      const items = JSON.stringify([
        { id: '1', text: 'Task 1', checked: false },
        { id: '2', text: 'Task 2', checked: true },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      expect(screen.getByDisplayValue('Task 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Task 2')).toBeInTheDocument();
    });

    it('should render checkboxes for each item', () => {
      const items = JSON.stringify([
        { id: '1', text: 'Task 1', checked: false },
        { id: '2', text: 'Task 2', checked: true },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });

    it('should handle malformed JSON gracefully', () => {
      render(<ChecklistBlock content="invalid json" onChange={mockOnChange} />);
      
      // Should still render add button
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });
  });

  describe('Adding Items', () => {
    it('should add new item when clicking Add button', async () => {
      const user = userEvent.setup();
      render(<ChecklistBlock content="[]" onChange={mockOnChange} />);
      
      const addButton = screen.getByRole('button', { name: /add item/i });
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
      
      // Should have an empty text input
      const inputs = screen.getAllByPlaceholderText(/task/i);
      expect(inputs).toHaveLength(1);
    });

    it('should add multiple items', async () => {
      const user = userEvent.setup();
      render(<ChecklistBlock content="[]" onChange={mockOnChange} />);
      
      const addButton = screen.getByRole('button', { name: /add item/i });
      
      await user.click(addButton);
      await user.click(addButton);
      
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/task/i);
        expect(inputs).toHaveLength(2);
      });
    });
  });

  describe('Updating Items', () => {
    it('should update item text', async () => {
      const user = userEvent.setup();
      const items = JSON.stringify([
        { id: '1', text: '', checked: false },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/task/i);
      await user.type(input, 'New task');
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should toggle checkbox', async () => {
      const user = userEvent.setup();
      const items = JSON.stringify([
        { id: '1', text: 'Task 1', checked: false },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        const updatedItems = JSON.parse(lastCall);
        expect(updatedItems[0].checked).toBe(true);
      });
    });

    it('should uncheck checked item', async () => {
      const user = userEvent.setup();
      const items = JSON.stringify([
        { id: '1', text: 'Task 1', checked: true },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      await waitFor(() => {
        const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        const updatedItems = JSON.parse(lastCall);
        expect(updatedItems[0].checked).toBe(false);
      });
    });
  });

  describe('Removing Items', () => {
    it('should remove item when clicking remove button', async () => {
      const user = userEvent.setup();
      const items = JSON.stringify([
        { id: '1', text: 'Task 1', checked: false },
        { id: '2', text: 'Task 2', checked: false },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const removeButtons = screen.getAllByText('×');
      await user.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        const updatedItems = JSON.parse(lastCall);
        expect(updatedItems).toHaveLength(1);
        expect(updatedItems[0].text).toBe('Task 2');
      });
    });

    it('should remove all items one by one', async () => {
      const user = userEvent.setup();
      const items = JSON.stringify([
        { id: '1', text: 'Task 1', checked: false },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const removeButton = screen.getByText('×');
      await user.click(removeButton);
      
      await waitFor(() => {
        const inputs = screen.queryAllByPlaceholderText(/task/i);
        expect(inputs).toHaveLength(0);
      });
    });
  });

  describe('Content Persistence', () => {
    it('should maintain item order', () => {
      const items = JSON.stringify([
        { id: '1', text: 'First', checked: false },
        { id: '2', text: 'Second', checked: false },
        { id: '3', text: 'Third', checked: false },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const inputs = screen.getAllByPlaceholderText(/task/i);
      expect((inputs[0] as HTMLInputElement).value).toBe('First');
      expect((inputs[1] as HTMLInputElement).value).toBe('Second');
      expect((inputs[2] as HTMLInputElement).value).toBe('Third');
    });

    it('should preserve checked state across updates', async () => {
      const user = userEvent.setup();
      const items = JSON.stringify([
        { id: '1', text: 'Task', checked: true },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const input = screen.getByDisplayValue('Task');
      await user.type(input, ' updated');
      
      await waitFor(() => {
        const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        const updatedItems = JSON.parse(lastCall);
        expect(updatedItems[0].checked).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible checkboxes', () => {
      const items = JSON.stringify([
        { id: '1', text: 'Task 1', checked: false },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('should have accessible text inputs', () => {
      const items = JSON.stringify([
        { id: '1', text: '', checked: false },
      ]);
      
      render(<ChecklistBlock content={items} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText(/task/i);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should have accessible add button', () => {
      render(<ChecklistBlock content="[]" onChange={mockOnChange} />);
      
      const addButton = screen.getByRole('button', { name: /add item/i });
      expect(addButton).toBeInTheDocument();
    });
  });
});
