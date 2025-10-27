import { useState, useEffect } from 'react';

interface ImageBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export function ImageBlock({ content, onChange }: ImageBlockProps) {
  const [editing, setEditing] = useState(!content);
  const [url, setUrl] = useState(content);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setUrl(content);
    if (content) {
      setEditing(false);
      setHasError(false);
      setErrorMessage(null);
    }
  }, [content]);

  // Simple but practical URL validator for image sources
  const isValidImageUrl = (u: string) => {
    const s = (u || '').trim();
    if (!s) return false;
    // Absolute HTTP(S)
    if (/^https?:\/\/.+/i.test(s)) return true;
    // Relative paths
    if (/^\/.+/.test(s)) return true;
    if(/^\.{1,2}\/./.test(s)) return true;
    // Data URL (base64 images)
    if (/^data:image\/[a-zA-Z]+;base64,/.test(s)) return true;
    // Blob URLs
    if (/^blob:/.test(s)) return true;
    return false;
  };

  const handleSave = () => {
    const trimmed = (url || '').trim();
    if (!trimmed) {
      setHasError(true);
      setErrorMessage('URL cannot be empty');
      onChange('');
      setEditing(true);
      return;
    }

    if (!isValidImageUrl(trimmed)) {
      setHasError(true);
      setErrorMessage('Invalid image URL');
      setEditing(true);
      return;
    }

    setHasError(false);
    setErrorMessage(null);
    onChange(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="image-block-edit"
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}
      >
        {hasError && (
          <div
            className="image-error-tooltip"
            role="alert"
            style={{
              color: 'red',
              fontSize: '0.9rem',
            }}
          >
            {errorMessage || 'Invalid image URL'}
          </div>
        )}
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (hasError) {
              setHasError(false);
              setErrorMessage(null);
            }
          }}
          placeholder={hasError ? (errorMessage || 'Invalid image URL') : 'Enter image URL...'}
          className={hasError ? 'input-error' : ''}
          style={{ width: '100%', ...(hasError ? { borderColor: 'red' } : {}) }}
        />
        <button onClick={handleSave} className="btn-primary">Save</button>
      </div>
    );
  }

  return (
    <div className="image-block">
      {url ? (
        <img
          src={url}
          alt="Block content"
          onClick={() => setEditing(true)}
          onError={() => {
            setHasError(true);
            setErrorMessage('Image failed to load');
            setEditing(true);
          }}
        />
      ) : null}
    </div>
  );
}
