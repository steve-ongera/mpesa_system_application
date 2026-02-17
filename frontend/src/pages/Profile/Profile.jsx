import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, CreditCard, Calendar, Shield, Edit, Key, Settings } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuthStore } from '../../store';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon size={17} className="text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 truncate">{value || '—'}</p>
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
        </div>
        <Button variant="primary" icon={<Edit size={18} />} onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card>
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg mb-4">
              <span className="text-white font-bold text-4xl">
                {user?.first_name?.[0]?.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-500 text-sm mt-1">{user?.phone_number}</p>
            <div className="mt-3">
              <Badge variant={user?.is_verified ? 'success' : 'warning'}>
                {user?.is_verified ? '✓ Verified' : 'Unverified'}
              </Badge>
            </div>

            <div className="mt-6 w-full pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-lg">
                    KES {Number(user?.account_balance || 0).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs">Balance</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-lg">
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-gray-400 text-xs">Status</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Info Card */}
        <Card title="Personal Information" className="lg:col-span-2">
          <InfoRow icon={User}       label="Full Name"    value={`${user?.first_name} ${user?.last_name}`} />
          <InfoRow icon={Phone}      label="Phone Number" value={user?.phone_number} />
          <InfoRow icon={Mail}       label="Email"        value={user?.email || 'Not provided'} />
          <InfoRow icon={CreditCard} label="ID Number"    value={user?.id_number} />
          <InfoRow icon={Calendar}   label="Member Since" value={formatDate(user?.date_joined)} />
          <InfoRow icon={Calendar}   label="Last Login"   value={formatDate(user?.last_login)} />
        </Card>
      </div>

      {/* Account Actions */}
      <Card title="Account Actions">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Edit size={18} className="text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">Edit Profile</p>
              <p className="text-xs text-gray-400">Update your details</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/change-pin')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key size={18} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">Change PIN</p>
              <p className="text-xs text-gray-400">Update security PIN</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings size={18} className="text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">Settings</p>
              <p className="text-xs text-gray-400">Preferences & more</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;