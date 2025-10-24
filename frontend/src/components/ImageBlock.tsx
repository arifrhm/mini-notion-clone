import { useState } from 'react';

interface ImageBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export const ImageBlock = ({ content, onChange }: ImageBlockProps) => {
  const [editing, setEditing] = useState(!content);
  const [url, setUrl] = useState(content);

  const handleSave = () => {
    onChange(url);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="image-block-edit">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter image URL..."
        />
        <button onClick={handleSave} className="btn-primary">Save</button>
      </div>
    );
  }

  return (
    <div className="image-block">
      <img src={content} alt="Block content" onClick={() => setEditing(true)} />
    </div>
  );
};
