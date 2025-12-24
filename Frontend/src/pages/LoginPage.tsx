import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Film, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingAnimation } from '../components/LoadingAnimation';
import { useUIStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { currentTheme } = useTheme();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'Username is required';
    } else if (formData.user_name.length < 3) {
      newErrors.user_name = 'Username must be at least 3 characters';
    }

    if (!isLogin) {
      if (!formData.user_email.trim()) {
        newErrors.user_email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
        newErrors.user_email = 'Please enter a valid email';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      const isConnected = await authService.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to backend server. Please check if the server is running.');
      }

      if (isLogin) {
        console.log('Attempting login...');
        await login({
          user_name: formData.user_name,
          password: formData.password,
        });
        console.log('Login successful, navigating to dashboard');
        addNotification({
          type: 'success',
          title: 'Welcome back! 🎬',
          message: `Successfully logged in as ${formData.user_name}`,
        });
        navigate('/dashboard');
      } else {
        await register({
          user_name: formData.user_name,
          user_email: formData.user_email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        });
        addNotification({
          type: 'success',
          title: 'Account created! 🎉',
          message: 'Please sign in with your new account.',
        });
        setIsLogin(true);
        setFormData(prev => ({
          ...prev,
          user_email: '',
          password: '',
          password_confirmation: ''
        }));
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      console.log('Error response data:', error.response?.data);
      
      let errorMessage = 'Something went wrong';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => {
            if (typeof err === 'object' && err.msg) {
              return err.msg;
            }
            return String(err);
          }).join(', ');
        } else {
          errorMessage = String(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('Parsed error message:', errorMessage);
      
      if (error.response?.status === 400 || error.response?.status === 422) {
        if (errorMessage.toLowerCase().includes('username') || errorMessage.toLowerCase().includes('user')) {
          setErrors({ user_name: 'Invalid username or user not found' });
        } else if (errorMessage.toLowerCase().includes('email')) {
          setErrors({ user_email: 'Email already registered' });
        } else if (errorMessage.toLowerCase().includes('password')) {
          setErrors({ password: 'Invalid password' });
        } else {
          setErrors({ general: errorMessage });
        }
      } else {
        addNotification({
          type: 'error',
          title: isLogin ? 'Login failed' : 'Registration failed',
          message: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Inline styles to avoid CSS loading issues
  const containerStyle = {
    minHeight: '100vh',
    background: currentTheme?.background || '#0f0f23',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px 14px 48px',
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    height: '52px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    background: `linear-gradient(135deg, ${currentTheme?.primary || '#0066ff'}, ${currentTheme?.secondary || '#00bfff'})`,
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: `0 10px 30px ${currentTheme?.primary || '#0066ff'}40`,
    boxSizing: 'border-box' as const,
    height: '52px',
  };

  return (
    <div style={containerStyle}>
      {/* Background Pattern */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${currentTheme?.primary || '#0066ff'}20 1px, transparent 1px),
            linear-gradient(90deg, ${currentTheme?.primary || '#0066ff'}20 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.3,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        style={cardStyle}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{ marginBottom: '24px' }}
          >
            <div 
              style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${currentTheme?.primary || '#0066ff'}, ${currentTheme?.secondary || '#00bfff'})`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: `0 0 40px ${currentTheme?.primary || '#0066ff'}40`,
              }}
            >
              <Film size={40} color="white" />
            </div>
          </motion.div>
          
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            margin: '0 0 12px 0', 
            color: '#ffffff',
            background: 'linear-gradient(to right, #ffffff, #e5e7eb, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CinePal
          </h1>
          
          <p style={{ 
            fontSize: '18px', 
            color: 'rgba(255, 255, 255, 0.7)', 
            margin: 0 
          }}>
            Your AI Movie Companion
          </p>
        </div>

        {/* Form Toggle */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '32px', 
          padding: '4px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: isLogin ? `linear-gradient(135deg, ${currentTheme?.primary || '#0066ff'}, ${currentTheme?.secondary || '#00bfff'})` : 'transparent',
              color: isLogin ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Sign In
          </button>
          
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: !isLogin ? `linear-gradient(135deg, ${currentTheme?.primary || '#0066ff'}, ${currentTheme?.secondary || '#00bfff'})` : 'transparent',
              color: !isLogin ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '14px',
              }}
            >
              {errors.general}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Username */}
          <div style={{ position: 'relative' }}>
            <User size={20} style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'rgba(255, 255, 255, 0.5)' 
            }} />
            <input
              type="text"
              required
              value={formData.user_name}
              onChange={(e) => handleInputChange('user_name', e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.user_name ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
              }}
              placeholder="Username"
            />
            {errors.user_name && (
              <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '8px', margin: '8px 0 0 0' }}>
                {errors.user_name}
              </p>
            )}
          </div>

          {/* Email (Register only) */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative' }}
              >
                <Mail size={20} style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255, 255, 255, 0.5)' 
                }} />
                <input
                  type="email"
                  required={!isLogin}
                  value={formData.user_email}
                  onChange={(e) => handleInputChange('user_email', e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: errors.user_email ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                  }}
                  placeholder="Email Address"
                />
                {errors.user_email && (
                  <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '8px', margin: '8px 0 0 0' }}>
                    {errors.user_email}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'rgba(255, 255, 255, 0.5)' 
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={{
                ...inputStyle,
                paddingRight: '56px',
                borderColor: errors.password ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
              }}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '8px', margin: '8px 0 0 0' }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative' }}
              >
                <Lock size={20} style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255, 255, 255, 0.5)' 
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!isLogin}
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: errors.password_confirmation ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                  }}
                  placeholder="Confirm Password"
                />
                {errors.password_confirmation && (
                  <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: '8px', margin: '8px 0 0 0' }}>
                    {errors.password_confirmation}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <LoadingAnimation type="film-reel" size="sm" />
                <span>Processing...</span>
              </div>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <Film size={20} />
                {isLogin ? 'Sign In to CinePal' : 'Create Your Account'}
              </span>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
            {isLogin ? "New to CinePal?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                if (!isLogin) {
                  setFormData(prev => ({ 
                    ...prev, 
                    user_email: '', 
                    password: '', 
                    password_confirmation: '' 
                  }));
                } else {
                  setFormData({ user_name: '', user_email: '', password: '', password_confirmation: '' });
                }
              }}
              style={{
                marginLeft: '8px',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isLogin ? 'Create an account' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};