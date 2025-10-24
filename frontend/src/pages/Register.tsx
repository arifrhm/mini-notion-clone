import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch, setError } = useForm<RegisterFormData>();
  const { register: registerUser } = useAuth();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password);
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'Registration failed' 
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: (val: string) => {
                  if (watch('password') != val) {
                    return "Passwords do not match";
                  }
                }
              })}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
          </div>

          {errors.root && <span className="error">{errors.root.message}</span>}

          <button type="submit" className="btn-primary">Register</button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
