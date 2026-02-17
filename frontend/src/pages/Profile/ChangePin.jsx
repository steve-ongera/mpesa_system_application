import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ChangePin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ old_pin: '', new_pin: '', confirm_pin: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setError('');
  };

  const validate = () => {
    if (!formData.old_pin || formData.old_pin.length !== 4) {
      setError('Current PIN must be 4 digits'); return false;
    }
    if (!formData.new_pin || formData.new_pin.length !== 4 || !/^\d{4}$/.test(formData.new_pin)) {
      setError('New PIN must be 4 digits'); return false;
    }
    if (formData.new_pin === formData.old_pin) {
      setError('New PIN must be different from current PIN'); return false;
    }
    if (formData.new_pin !== formData.confirm_pin) {
      setError('New PINs do not match'); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await userAPI.changePin(formData);
      setSuccess(true);
      toast.success('PIN changed successfully!');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PIN Changed!</h2>
        <p className="text-gray-500">Your PIN has been updated successfully. Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/profile')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Change PIN</h1>
          <p className="text-gray-500 mt-1">Update your security PIN</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

      <Card>
        <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-xl">
          <Lock size={22} className="text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Choose a strong 4-digit PIN that you haven't used before.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Current PIN"
            type="password"
            name="old_pin"
            value={formData.old_pin}
            onChange={(v) => handleChange('old_pin', v)}
            placeholder="Enter current PIN"
            icon={<Lock size={18} />}
            maxLength={4}
            required
          />
          <Input
            label="New PIN"
            type="password"
            name="new_pin"
            value={formData.new_pin}
            onChange={(v) => handleChange('new_pin', v)}
            placeholder="Enter new 4-digit PIN"
            icon={<Lock size={18} />}
            maxLength={4}
            required
          />
          <Input
            label="Confirm New PIN"
            type="password"
            name="confirm_pin"
            value={formData.confirm_pin}
            onChange={(v) => handleChange('confirm_pin', v)}
            placeholder="Re-enter new PIN"
            icon={<Lock size={18} />}
            maxLength={4}
            required
          />

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Update PIN
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChangePin;