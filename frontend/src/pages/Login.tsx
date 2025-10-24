import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

interface LoginFormData {
  email: string;
  password: string;
}

export const Login = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>();
  const { login } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'Login failed' 
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
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
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          {errors.root && <span className="error">{errors.root.message}</span>}

          <button type="submit" className="btn-primary">Login</button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};
