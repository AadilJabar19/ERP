import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    if (!isLogin && !formData.name) {
      setError('Name is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
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
      const endpoint = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/${isLogin ? 'login' : 'register'}`;
      const response = await axios.post(endpoint, formData);
      
      login(response.data.user, response.data.token);
      navigate('/');
      
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred';
      setError(message);
      
      if (error.response?.status === 423) {
        // Account locked
        const lockUntil = error.response.data.lockUntil;
        if (lockUntil) {
          const unlockTime = new Date(lockUntil).toLocaleTimeString();
          setError(`Account locked until ${unlockTime}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
        email: formData.email
      });
      setResetToken(response.data.token);
      setError('');
      alert('Password reset token generated. Check console for token (in production, this would be emailed).');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !formData.password) {
      setError('Token and new password are required');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        token: resetToken,
        password: formData.password
      });
      setForgotPassword(false);
      setResetToken('');
      setError('');
      alert('Password reset successful! You can now login.');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (forgotPassword) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
          <h2>Reset Password</h2>
          
          {error && (
            <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          
          {!resetToken ? (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Token'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Reset Token:</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={() => { setForgotPassword(false); setResetToken(''); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h2>{isLogin ? 'Login to ERP System' : 'Create Account'}</h2>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required={!isLogin}
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={loading}
                placeholder="Enter your password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {!isLogin && (
              <small style={{ color: '#666' }}>Password must be at least 6 characters</small>
            )}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label>Role:</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                disabled={loading}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '10px' }}
            disabled={loading}
          >
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        {isLogin && (
          <p style={{ textAlign: 'center', marginBottom: '10px' }}>
            <button 
              type="button" 
              onClick={() => { setForgotPassword(true); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '14px' }}
            >
              Forgot Password?
            </button>
          </p>
        )}
        
        <p style={{ textAlign: 'center' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}
            disabled={loading}
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </p>
        
        {isLogin && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '12px' }}>
            <strong>Demo Credentials:</strong><br/>
            Email: admin@test.com<br/>
            Password: admin123
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;