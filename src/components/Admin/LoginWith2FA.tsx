/* eslint-disable */
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Update if different
type LoginWith2FAProps = {
  onLoginSuccess: (role: string) => void;
};


const LoginWith2FA: React.FC<LoginWith2FAProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'login' | '2fa' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/register`, { username, password });
      if (res.data.qr) {
        setMessage('✅ Registered successfully! Please login now.');
        setMode('login');
        setUsername('');
        setPassword('');
      } else {
        setMessage('Unexpected registration response.');
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      if (res.data.message === '2FA required') {
        setUserId(res.data.userId);
        setStep('2fa');
        setMessage('Enter your 2FA code');
      } else {
        setMessage('Unexpected response');
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/verify-token`, {
        username,
        token: otpCode,
      });

      if (res.data.message === '2FA verified successfully') {
        if (res.data.message === '2FA verified successfully') {
          setMessage('✅ Logged in successfully!');
          onLoginSuccess(res.data.role); // 👈 pass role back to App.tsx
        }
      } else {
        setMessage('Failed to verify 2FA');
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || '2FA failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setStep('login');
    setMessage('');
    setUsername('');
    setPassword('');
    setOtpCode('');
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20, border: '1px solid #ccc', borderRadius: 10 }}>
      <h2>
        {step === '2fa' ? '2FA Verification' : mode === 'login' ? 'Login' : 'Register'}
      </h2>
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'crimson' }}>{message}</p>}

      {step === '2fa' ? (
        <form onSubmit={handleVerify2FA}>
          <input
            type="text"
            placeholder="Enter 2FA Code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <button type="submit" disabled={loading} style={{ padding: 10, width: '100%' }}>
            {loading ? 'Verifying 2FA...' : 'Verify 2FA'}
          </button>
        </form>
      ) : (
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <button type="submit" disabled={loading} style={{ padding: 10, width: '100%' }}>
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      )}

      {step !== '2fa' && (
        <p style={{ marginTop: 15, textAlign: 'center' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={toggleMode} style={{ border: 'none', background: 'none', color: 'blue', cursor: 'pointer' }}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={toggleMode} style={{ border: 'none', background: 'none', color: 'blue', cursor: 'pointer' }}>
                Login
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
};

export default LoginWith2FA;
