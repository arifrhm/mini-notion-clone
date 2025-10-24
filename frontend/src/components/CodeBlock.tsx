interface CodeBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export const CodeBlock = ({ content, onChange }: CodeBlockProps) => {
  return (
    <div className="code-block">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter code..."
        spellCheck={false}
      />
    </div>
  );
};
