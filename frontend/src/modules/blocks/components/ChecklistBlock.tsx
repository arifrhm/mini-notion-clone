import { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ChecklistBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export function ChecklistBlock({ content, onChange }: ChecklistBlockProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content || '[]');
      setItems(parsed);
    } catch {
      setItems([]);
    }
  }, [content]);

  const updateItems = (newItems: ChecklistItem[]) => {
    setItems(newItems);
    onChange(JSON.stringify(newItems));
  };

  const addItem = () => {
    updateItems([...items, { id: Date.now().toString(), text: '', checked: false }]);
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    updateItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    updateItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="checklist-block">
      {items.map(item => (
        <div key={item.id} className="checklist-item">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) => updateItem(item.id, { checked: e.target.checked })}
          />
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateItem(item.id, { text: e.target.value })}
            placeholder="Task..."
          />
          <button onClick={() => removeItem(item.id)} className="btn-icon">×</button>
        </div>
      ))}
      <button onClick={addItem} className="btn-add-item">+ Add item</button>
    </div>
  );
}
