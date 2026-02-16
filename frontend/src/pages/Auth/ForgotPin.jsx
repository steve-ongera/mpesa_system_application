import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ArrowLeft } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import toast from 'react-hot-toast';

const ForgotPin = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: Verification, 3: New PIN
  const [formData, setFormData] = useState({
    phone_number: '',
    verification_code: '',
    new_pin: '',
    confirm_pin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.phone_number.startsWith('254') || formData.phone_number.length !== 12) {
      setError('Please enter a valid phone number (254XXXXXXXXX)');
      return;
    }

    setLoading(true);

    try {
      // API call to send verification code
      // await authAPI.requestPinReset(formData.phone_number);
      
      // Simulate API call
      setTimeout(() => {
        setSuccess('Verification code sent to your phone number');
        toast.success('Code sent!');
        setStep(2);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.verification_code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      // API call to verify code
      // await authAPI.verifyResetCode(formData.phone_number, formData.verification_code);
      
      setTimeout(() => {
        setSuccess('Code verified! Please set your new PIN');
        toast.success('Verified!');
        setStep(3);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Invalid verification code');
      setLoading(false);
    }
  };

  const handleResetPin = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.new_pin.length !== 4 || !/^\d+$/.test(formData.new_pin)) {
      setError('PIN must be 4 digits');
      return;
    }

    if (formData.new_pin !== formData.confirm_pin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);

    try {
      // API call to reset PIN
      // await authAPI.resetPin(formData.phone_number, formData.verification_code, formData.new_pin);
      
      setTimeout(() => {
        toast.success('PIN reset successful! Please login with your new PIN');
        window.location.href = '/login';
      }, 1000);
    } catch (err) {
      setError('Failed to reset PIN. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Reset Your PIN
        </h2>
        <p className="text-gray-600">
          {step === 1 && 'Enter your phone number to receive a verification code'}
          {step === 2 && 'Enter the verification code sent to your phone'}
          {step === 3 && 'Create a new 4-digit PIN'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
          className="mb-4"
        />
      )}

      {success && (
        <Alert 
          type="success" 
          message={success} 
          dismissible={false}
          className="mb-4"
        />
      )}

      {/* Step 1: Phone Number */}
      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-4">
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
            helperText="Enter your registered phone number"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Send Verification Code
          </Button>
        </form>
      )}

      {/* Step 2: Verification Code */}
      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            name="verification_code"
            value={formData.verification_code}
            onChange={(value) => handleChange('verification_code', value)}
            placeholder="Enter 6-digit code"
            icon={<Mail size={20} />}
            required
            maxLength={6}
            helperText="Check your phone for the code"
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              Verify Code
            </Button>
          </div>

          <button
            type="button"
            onClick={handleSendCode}
            className="w-full text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Didn't receive code? Resend
          </button>
        </form>
      )}

      {/* Step 3: New PIN */}
      {step === 3 && (
        <form onSubmit={handleResetPin} className="space-y-4">
          <Input
            label="New PIN"
            type="password"
            name="new_pin"
            value={formData.new_pin}
            onChange={(value) => handleChange('new_pin', value)}
            placeholder="Enter 4-digit PIN"
            required
            maxLength={4}
            helperText="Choose a secure 4-digit PIN"
          />

          <Input
            label="Confirm New PIN"
            type="password"
            name="confirm_pin"
            value={formData.confirm_pin}
            onChange={(value) => handleChange('confirm_pin', value)}
            placeholder="Re-enter PIN"
            required
            maxLength={4}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Reset PIN
          </Button>
        </form>
      )}

      {/* Back to Login */}
      <div className="mt-6">
        <Link 
          to="/login" 
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPin;