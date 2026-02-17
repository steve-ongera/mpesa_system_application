import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Shield, Eye, Moon, Globe, LogOut, ChevronRight } from 'lucide-react';
import Card from '../../components/common/Card';
import { useAuthStore } from '../../store';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
      enabled ? 'bg-green-500' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 mt-1 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const SettingRow = ({ icon: Icon, label, subtitle, rightContent, onClick, danger = false }) => (
  <div
    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
      onClick ? 'cursor-pointer hover:bg-gray-50' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-gray-100'}`}>
        <Icon size={18} className={danger ? 'text-red-600' : 'text-gray-600'} />
      </div>
      <div>
        <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}>{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div>{rightContent}</div>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { logout, refreshToken } = useAuthStore();

  const [prefs, setPrefs] = useState({
    transactionAlerts:  true,
    securityAlerts:     true,
    promotionalAlerts:  false,
    hideBalance:        false,
    darkMode:           false,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    try {
      await authAPI.logout(refreshToken);
    } catch (_) {}
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/profile')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your preferences</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <Card title="Notifications" subtitle="Control what alerts you receive">
          <div className="space-y-1 -mx-2">
            <SettingRow icon={Bell} label="Transaction Alerts" subtitle="Get notified on every transaction"
              rightContent={<Toggle enabled={prefs.transactionAlerts} onChange={() => toggle('transactionAlerts')} />} />
            <SettingRow icon={Shield} label="Security Alerts" subtitle="Login and security notifications"
              rightContent={<Toggle enabled={prefs.securityAlerts} onChange={() => toggle('securityAlerts')} />} />
            <SettingRow icon={Bell} label="Promotional" subtitle="Offers and promotions"
              rightContent={<Toggle enabled={prefs.promotionalAlerts} onChange={() => toggle('promotionalAlerts')} />} />
          </div>
        </Card>

        {/* Privacy */}
        <Card title="Privacy & Security">
          <div className="space-y-1 -mx-2">
            <SettingRow icon={Eye} label="Hide Balance" subtitle="Mask balance on dashboard"
              rightContent={<Toggle enabled={prefs.hideBalance} onChange={() => toggle('hideBalance')} />} />
            <SettingRow icon={Shield} label="Change PIN" subtitle="Update your security PIN"
              rightContent={<ChevronRight size={18} className="text-gray-400" />}
              onClick={() => navigate('/change-pin')} />
          </div>
        </Card>

        {/* Appearance */}
        <Card title="Appearance">
          <div className="space-y-1 -mx-2">
            <SettingRow icon={Moon} label="Dark Mode" subtitle="Switch to dark theme"
              rightContent={<Toggle enabled={prefs.darkMode} onChange={() => { toggle('darkMode'); toast('Dark mode coming soon!'); }} />} />
            <SettingRow icon={Globe} label="Language" subtitle="English (Default)"
              rightContent={<ChevronRight size={18} className="text-gray-400" />} />
          </div>
        </Card>

        {/* Account */}
        <Card title="Account">
          <div className="-mx-2">
            <SettingRow
              icon={LogOut}
              label="Logout"
              subtitle="Sign out from all devices"
              danger
              onClick={handleLogout}
              rightContent={<ChevronRight size={18} className="text-red-400" />}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;