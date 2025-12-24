import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Lock, User, Mail, Film, Palette, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../components/NotificationSystem';
import { authService } from '../services/authService';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    user_name: user?.user_name || '',
    user_email: user?.user_email || '',
  });

  // Preferences Form State
  const [preferencesForm, setPreferencesForm] = useState({
    preferences: user?.preferences || [],
    newPreference: '',
  });

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.detail || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle preferences update
  const handleAddPreference = () => {
    if (preferencesForm.newPreference.trim()) {
      setPreferencesForm(prev => ({
        ...prev,
        preferences: [...prev.preferences, prev.newPreference],
        newPreference: '',
      }));
    }
  };

  const handleRemovePreference = (index: number) => {
    setPreferencesForm(prev => ({
      ...prev,
      preferences: prev.preferences.filter((_, i) => i !== index),
    }));
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New passwords do not match',
      });
      return;
    }

    if (securityForm.newPassword.length < 8) {
      addNotification({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long',
      });
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      addNotification({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been changed successfully',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Password Change Failed',
        message: error.response?.data?.detail || 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen" style={{ background: currentTheme?.background || '#0f0f23' }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-white/10 sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <ChevronLeft size={24} style={{ color: currentTheme.primary }} />
              </motion.button>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: currentTheme.text }}>
                Settings
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation - Mobile: Hidden, Desktop: Visible */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <div className="glass rounded-2xl p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'preferences', label: 'Preferences', icon: Film },
                  { id: 'security', label: 'Security', icon: Lock },
                ].map(({ id, label, icon: Icon }) => (
                  <motion.button
                    key={id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === id
                        ? 'bg-white/10 border border-white/20'
                        : 'hover:bg-white/5'
                    }`}
                    style={{
                      color: activeTab === id ? currentTheme.primary : currentTheme.text,
                    }}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Tabs for Mobile */}
          <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'preferences', label: 'Preferences', icon: Film },
              { id: 'security', label: 'Security', icon: Lock },
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === id
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                style={{
                  color: activeTab === id ? currentTheme.primary : currentTheme.text,
                }}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 sm:p-8"
              >
                <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.text }}>
                  Profile Information
                </h2>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                      Username
                    </label>
                    <div className="relative">
                      <User
                        size={20}
                        className="absolute left-3 top-3"
                        style={{ color: currentTheme.primary }}
                      />
                      <input
                        type="text"
                        value={profileForm.user_name}
                        onChange={(e) =>
                          setProfileForm(prev => ({
                            ...prev,
                            user_name: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl glass border-0 focus:ring-2 transition-all"
                        style={{
                          color: currentTheme.text,
                          '--tw-ring-color': currentTheme.primary,
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={20}
                        className="absolute left-3 top-3"
                        style={{ color: currentTheme.primary }}
                      />
                      <input
                        type="email"
                        value={profileForm.user_email}
                        onChange={(e) =>
                          setProfileForm(prev => ({
                            ...prev,
                            user_email: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl glass border-0 focus:ring-2 transition-all"
                        style={{
                          color: currentTheme.text,
                          '--tw-ring-color': currentTheme.primary,
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                    style={{ backgroundColor: currentTheme.primary }}
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 sm:p-8"
              >
                <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.text }}>
                  Movie Preferences
                </h2>

                <div className="space-y-6">
                  {/* Add Preference */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                      Add a Genre or Preference
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Film
                          size={20}
                          className="absolute left-3 top-3"
                          style={{ color: currentTheme.primary }}
                        />
                        <input
                          type="text"
                          value={preferencesForm.newPreference}
                          onChange={(e) =>
                            setPreferencesForm(prev => ({
                              ...prev,
                              newPreference: e.target.value,
                            }))
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddPreference();
                            }
                          }}
                          placeholder="e.g., Sci-Fi, Comedy, Drama..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass border-0 focus:ring-2 transition-all"
                          style={{
                            color: currentTheme.text,
                            '--tw-ring-color': currentTheme.primary,
                          } as React.CSSProperties}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddPreference}
                        className="px-4 sm:px-6 py-3 rounded-xl text-white font-medium transition-all"
                        style={{ backgroundColor: currentTheme.primary }}
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>

                  {/* Current Preferences */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.text }}>
                      Your Preferences ({preferencesForm.preferences.length})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {preferencesForm.preferences.map((pref, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center justify-between px-4 py-2 rounded-lg"
                          style={{ background: `${currentTheme.primary}20` }}
                        >
                          <span style={{ color: currentTheme.text }}>{pref}</span>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            onClick={() => handleRemovePreference(index)}
                            className="text-xs font-bold ml-2"
                            style={{ color: currentTheme.primary }}
                          >
                            ×
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                    {preferencesForm.preferences.length === 0 && (
                      <p className="text-sm opacity-60" style={{ color: currentTheme.text }}>
                        No preferences added yet. Add some to get better recommendations!
                      </p>
                    )}
                  </div>

                  {/* Save Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all"
                    style={{ backgroundColor: currentTheme.primary }}
                  >
                    <Save size={20} />
                    Save Preferences
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Change Password */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl p-6 sm:p-8"
                >
                  <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.text }}>
                    Change Password
                  </h2>

                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={20}
                          className="absolute left-3 top-3"
                          style={{ color: currentTheme.primary }}
                        />
                        <input
                          type="password"
                          value={securityForm.currentPassword}
                          onChange={(e) =>
                            setSecurityForm(prev => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass border-0 focus:ring-2 transition-all"
                          style={{
                            color: currentTheme.text,
                            '--tw-ring-color': currentTheme.primary,
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                        New Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={20}
                          className="absolute left-3 top-3"
                          style={{ color: currentTheme.primary }}
                        />
                        <input
                          type={passwordVisible ? 'text' : 'password'}
                          value={securityForm.newPassword}
                          onChange={(e) =>
                            setSecurityForm(prev => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass border-0 focus:ring-2 transition-all"
                          style={{
                            color: currentTheme.text,
                            '--tw-ring-color': currentTheme.primary,
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={20}
                          className="absolute left-3 top-3"
                          style={{ color: currentTheme.primary }}
                        />
                        <input
                          type={passwordVisible ? 'text' : 'password'}
                          value={securityForm.confirmPassword}
                          onChange={(e) =>
                            setSecurityForm(prev => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass border-0 focus:ring-2 transition-all"
                          style={{
                            color: currentTheme.text,
                            '--tw-ring-color': currentTheme.primary,
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: `${currentTheme.primary}10` }}
                    >
                      <p className="text-sm font-medium mb-2" style={{ color: currentTheme.text }}>
                        Password Requirements:
                      </p>
                      <ul className="text-sm space-y-1 opacity-80" style={{ color: currentTheme.text }}>
                        <li>✓ At least 8 characters long</li>
                        <li>✓ Mix of uppercase and lowercase letters</li>
                        <li>✓ At least one number</li>
                      </ul>
                    </div>

                    {/* Save Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                      style={{ backgroundColor: currentTheme.primary }}
                    >
                      <Lock size={20} />
                      {loading ? 'Changing...' : 'Change Password'}
                    </motion.button>
                  </form>
                </motion.div>

                {/* Logout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-2xl p-6 sm:p-8"
                >
                  <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.text }}>
                    Session
                  </h3>
                  <p className="text-sm opacity-70 mb-6" style={{ color: currentTheme.text }}>
                    Log out of your account and clear your session
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    <LogOut size={20} />
                    Logout
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
