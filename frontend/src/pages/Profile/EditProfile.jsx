import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Save } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.data);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 mt-1">Update your personal information</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

      <Card>
        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow">
            <span className="text-white font-bold text-3xl">
              {formData.first_name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {formData.first_name} {formData.last_name}
            </p>
            <p className="text-sm text-gray-400">{user?.phone_number}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={(v) => handleChange('first_name', v)}
              placeholder="John"
              icon={<User size={18} />}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={(v) => handleChange('last_name', v)}
              placeholder="Doe"
              icon={<User size={18} />}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={(v) => handleChange('email', v)}
            placeholder="john@example.com"
            icon={<Mail size={18} />}
            helperText="Optional — used for notifications"
          />

          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Phone Number</p>
              <p className="text-sm font-medium text-gray-600">{user?.phone_number}</p>
              <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">ID Number</p>
              <p className="text-sm font-medium text-gray-600">{user?.id_number}</p>
              <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/profile')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={<Save size={18} />}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;