import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await API.post('/auth/login', formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card glass">

        <h1 className="auth-title">Welcome Back 👋</h1>
        <p className="auth-subtitle">Continue your AI resume journey</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <input className="input" name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input className="input" name="password" type="password" placeholder="Password" onChange={handleChange} required />

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Loading...' : '✦ Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/signup">Create one</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;