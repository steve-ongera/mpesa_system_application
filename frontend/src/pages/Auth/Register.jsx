import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, CreditCard, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

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
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h2>
        <p className="text-gray-600">
          Join thousands of users managing their money better
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={(value) => handleChange('first_name', value)}
            placeholder="John"
            icon={<User size={20} />}
            required
          />

          <Input
            label="Last Name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={(value) => handleChange('last_name', value)}
            placeholder="Doe"
            icon={<User size={20} />}
            required
          />
        </div>

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
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={(value) => handleChange('email', value)}
          placeholder="john@example.com"
          icon={<Mail size={20} />}
          helperText="Optional"
        />

        <Input
          label="ID Number"
          type="text"
          name="id_number"
          value={formData.id_number}
          onChange={(value) => handleChange('id_number', value)}
          placeholder="12345678"
          icon={<CreditCard size={20} />}
          required
          maxLength={20}
        />

        <Input
          label="Create PIN"
          type="password"
          name="pin"
          value={formData.pin}
          onChange={(value) => handleChange('pin', value)}
          placeholder="4-digit PIN"
          icon={<Lock size={20} />}
          required
          maxLength={4}
          helperText="4 digits only"
        />

        <Input
          label="Confirm PIN"
          type="password"
          name="confirm_pin"
          value={formData.confirm_pin}
          onChange={(value) => handleChange('confirm_pin', value)}
          placeholder="Re-enter PIN"
          icon={<Lock size={20} />}
          required
          maxLength={4}
        />

        <div className="flex items-start">
          <input
            type="checkbox"
            required
            className="w-4 h-4 mt-1 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <Link to="/terms" className="text-green-600 hover:text-green-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-green-600 hover:text-green-700">
              Privacy Policy
            </Link>
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;