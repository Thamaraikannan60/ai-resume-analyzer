import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/auth/signup', formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card glass">

        <h1 className="auth-title">Create Your Account ✨</h1>
        <p className="auth-subtitle">Start analyzing your resume with AI</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <input className="input" name="name" placeholder="Full Name" onChange={handleChange} required />
          <input className="input" name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input className="input" name="password" type="password" placeholder="Password (min 6 chars)" onChange={handleChange} required />

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Loading...' : '✦ Get Started'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;