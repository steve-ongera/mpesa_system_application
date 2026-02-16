import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

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
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600">
          Login to access your account
        </p>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Phone Number"
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={(value) => handleChange('phone_number', value)}
          placeholder="254712345678"
          icon={<Phone size={20} />}
          required
          maxLength={12}
          helperText="Format: 254XXXXXXXXX"
        />

        <Input
          label="PIN"
          type="password"
          name="pin"
          value={formData.pin}
          onChange={(value) => handleChange('pin', value)}
          placeholder="Enter your 4-digit PIN"
          icon={<Lock size={20} />}
          required
          maxLength={4}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>

          <Link 
            to="/forgot-pin" 
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Forgot PIN?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Register here
          </Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 font-medium mb-2">Demo Credentials:</p>
        <p className="text-xs text-blue-600">Phone: 254712345678</p>
        <p className="text-xs text-blue-600">PIN: 1234</p>
      </div>
    </div>
  );
};

export default Login;