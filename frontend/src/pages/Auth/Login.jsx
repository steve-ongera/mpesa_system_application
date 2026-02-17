import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import './login.css'; // Import the CSS file

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [formData, setFormData] = useState({
    phone_number: '',
    pin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.phone_number || !formData.pin) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { user, tokens } = response.data.data;
      
      // Save to store and localStorage
      setAuth(user, tokens);
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-inner">
          {/* Logo */}
          <div className="login-logo">
            <div className="logo-circle">
              <span>M</span>
            </div>
          </div>

          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Login to access your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="login-alert">
              <Alert 
                type="error" 
                message={error} 
                onClose={() => setError('')}
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="254712345678"
                className="input-field"
                required
                maxLength={12}
              />
              <Phone className="input-icon" size={20} />
              <span className="input-helper">Format: 254XXXXXXXXX</span>
            </div>

            <div className="input-wrapper">
              <label className="input-label">PIN</label>
              <input
                type="password"
                value={formData.pin}
                onChange={(e) => handleChange('pin', e.target.value)}
                placeholder="Enter your 4-digit PIN"
                className="input-field"
                required
                maxLength={4}
              />
              <Lock className="input-icon" size={20} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-pin" className="forgot-pin">
                Forgot PIN?
              </Link>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="loading-spinner"></span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="register-section">
            <p className="register-text">
              Don't have an account?
              <Link to="/register" className="register-link">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="demo-credentials">
            <p className="demo-title">Demo Credentials</p>
            <p className="demo-phone">254712345678</p>
            <p className="demo-pin">1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;