import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, CreditCard, Lock, CheckCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import './register.css'; // Import the CSS file

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [formData, setFormData] = useState({
    phone_number: '',
    first_name: '',
    last_name: '',
    email: '',
    id_number: '',
    pin: '',
    confirm_pin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.phone_number.startsWith('254')) {
      setError('Phone number must start with 254');
      return false;
    }

    if (formData.phone_number.length !== 12) {
      setError('Phone number must be 12 digits');
      return false;
    }

    if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      setError('PIN must be 4 digits');
      return false;
    }

    if (formData.pin !== formData.confirm_pin) {
      setError('PINs do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      const { user, tokens } = response.data.data;
      
      setAuth(user, tokens);
      
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-card-inner">
          {/* Logo */}
          <div className="register-logo">
            <div className="logo-circle">
              <span>M</span>
            </div>
          </div>

          {/* Header */}
          <div className="register-header">
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">
              Join millions of users managing their money better
            </p>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span>Personal</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span>Security</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span>Verify</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="register-alert">
              <Alert 
                type="error" 
                message={error} 
                onClose={() => setError('')}
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="name-grid">
              <div className="input-wrapper">
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  placeholder="John"
                  className="input-field"
                  required
                />
                <User className="input-icon" size={20} />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  placeholder="Doe"
                  className="input-field"
                  required
                />
                <User className="input-icon" size={20} />
              </div>
            </div>

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
              <label className="input-label">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className="input-field"
              />
              <Mail className="input-icon" size={20} />
              <span className="input-helper">Optional</span>
            </div>

            <div className="input-wrapper">
              <label className="input-label">ID Number</label>
              <input
                type="text"
                value={formData.id_number}
                onChange={(e) => handleChange('id_number', e.target.value)}
                placeholder="12345678"
                className="input-field"
                required
                maxLength={20}
              />
              <CreditCard className="input-icon" size={20} />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Create PIN</label>
              <input
                type="password"
                value={formData.pin}
                onChange={(e) => handleChange('pin', e.target.value)}
                placeholder="4-digit PIN"
                className="input-field"
                required
                maxLength={4}
              />
              <Lock className="input-icon" size={20} />
              <span className="input-helper">4 digits only</span>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Confirm PIN</label>
              <input
                type="password"
                value={formData.confirm_pin}
                onChange={(e) => handleChange('confirm_pin', e.target.value)}
                placeholder="Re-enter PIN"
                className="input-field"
                required
                maxLength={4}
              />
              <Lock className="input-icon" size={20} />
            </div>

            <div className="terms-container">
              <label className="terms-checkbox">
                <input type="checkbox" required />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="terms-link">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="login-section">
            <p className="login-text">
              Already have an account?
              <Link to="/login" className="login-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;