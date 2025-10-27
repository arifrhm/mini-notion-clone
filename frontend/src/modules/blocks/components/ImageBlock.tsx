import { useState, useEffect } from 'react';

interface ImageBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export function ImageBlock({ content, onChange }: ImageBlockProps) {
  const [editing, setEditing] = useState(!content);
  const [url, setUrl] = useState(content);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setUrl(content);
    if (content) {
      setEditing(false);
      setHasError(false);
    }
  }, [content]);

  const handleSave = () => {
    const trimmed = (url || '').trim();
    if (!trimmed) {
      setHasError(true);
      onChange('');
      // Stay in edit mode for user to fix input
      setEditing(true);
      return;
    }

    setHasError(false);
    onChange(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="image-block-edit">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (hasError) setHasError(false);
          }}
          placeholder={hasError ? "URL cannot be empty" : "Enter image URL..."}
          className={hasError ? "input-error" : ""}
          style={hasError ? { borderColor: 'red' } : {}}
        />
        <button onClick={handleSave} className="btn-primary">Save</button>
      </div>
    );
  }

  return (
    <div className="image-block">
      {url ? (
        <img src={url} alt="Block content" onClick={() => setEditing(true)} />
      ) : null}
    </div>
  );
}
