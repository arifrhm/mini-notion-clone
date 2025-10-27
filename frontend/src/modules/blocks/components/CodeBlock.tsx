import { useState, useEffect } from 'react';

interface CodeBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export function CodeBlock({ content, onChange }: CodeBlockProps) {
  const [code, setCode] = useState(content);

  useEffect(() => {
    setCode(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setCode(next);
    onChange(next);
  };

  return (
    <div className="code-block">
      <textarea
        value={code}
        onChange={handleChange}
        placeholder="Enter code..."
        spellCheck={false}
      />
    </div>
  );
}
