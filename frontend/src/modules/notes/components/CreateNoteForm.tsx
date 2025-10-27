import { useForm } from 'react-hook-form';

interface CreateNoteFormData {
  title: string;
}

interface CreateNoteFormProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function CreateNoteForm({ onSubmit, onCancel }: CreateNoteFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateNoteFormData>();

  const handleFormSubmit = (data: CreateNoteFormData) => {
    onSubmit(data.title);
  };

  return (
    <div className="create-note-form">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <input
          type="text"
          placeholder="Note title..."
          autoFocus
          {...register('title', {
            required: 'Title is required',
            setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
            validate: (v) => (v && v.length > 0) || 'Title cannot be empty',
          })}
        />
        {errors.title && <span className="error">{errors.title.message}</span>}
        <div className="form-actions">
          <button type="submit" className="btn-primary">Create</button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
