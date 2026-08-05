import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiForgotPassword, apiResetPassword } from '../services/api';
import OtpVerification from '../components/OtpVerification';
import PasswordRequirements from '../components/PasswordRequirements';
import { checkPasswordConstraints } from '../utils/passwordValidator';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Navigation / multi-step state: 'form' | 'otp' | 'forgot_email' | 'forgot_reset'
  const [step, setStep] = useState('form');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Fields
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to previous path or /predict
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/predict';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Resend OTP Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // --- 1. Standard Login Submit ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, password);
      const from = location.state?.from?.pathname || '/predict';
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 403 || err.message?.toLowerCase().includes('not verified')) {
        setStep('otp');
      } else {
        setError(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Forgot Password - Request OTP ---
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiForgotPassword(cleanEmail);
      setSuccess(res.message || 'Verification code sent! Please check your email.');
      setStep('forgot_reset');
      setResendCooldown(30);
    } catch (err) {
      setError(err.message || 'Failed to send password reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Forgot Password - Resend OTP ---
  const handleResendResetOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Email address is missing. Please go back and re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiForgotPassword(cleanEmail);
      setSuccess(res.message || 'A fresh verification code has been sent to your email.');
      setResendCooldown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Forgot Password - Submit Reset ---
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = resetOtp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the 6-digit verification code from your email.');
      return;
    }
    
    const pwdValidation = checkPasswordConstraints(newPassword);
    if (!pwdValidation.isValid) {
      setError(pwdValidation.errorMessage || 'Please create a password that satisfies all security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiResetPassword(email.trim().toLowerCase(), cleanOtp, newPassword);
      setSuccess(res.message || 'Password reset successfully! Please sign in with your new password.');
      setStep('form');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setResetOtp('');
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const from = location.state?.from?.pathname || '/predict';

  return (
    <div className="auth-page">
      {/* Brand Hero Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">🌿</div>
          <div className="auth-brand-title">
            AI-Powered Lignin<br />Extraction Predictor
          </div>
          <div className="auth-brand-tagline">Predict. Analyze. Optimize.</div>
          <p className="auth-brand-desc">
            Sign in to access your prediction history, saved comparisons,
            and research dossiers. Secure authentication with email recovery.
          </p>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-header">
          {step === 'form' ? (
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={16} /> Back to Portal
            </Link>
          ) : (
            <button
              type="button"
              className="auth-back-link"
              onClick={() => {
                setStep('form');
                setError('');
                setSuccess('');
              }}
              style={{ cursor: 'pointer', background: 'none', border: 'none' }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          )}
        </div>

        {/* --- View 1: Unverified Account OTP --- */}
        {step === 'otp' && (
          <OtpVerification
            email={email.trim().toLowerCase()}
            onVerified={() => navigate(from, { replace: true })}
            onBack={() => setStep('form')}
          />
        )}

        {/* --- View 2: Forgot Password - Step 1: Request OTP --- */}
        {step === 'forgot_email' && (
          <form className="auth-form" onSubmit={handleRequestResetOtp} noValidate>
            <h2>Reset Password</h2>
            <p className="auth-form-subtitle">
              Enter your registered email address and we will send you a 6-digit OTP code to reset your password.
            </p>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-success">
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{success}</span>
              </div>
            )}

            <div className="auth-input-group">
              <label htmlFor="forgot-email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="researcher@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Sending Verification Code...' : 'Send Reset Code'}
            </button>

            <p className="auth-footer-text" style={{ marginTop: 24 }}>
              Remember your password?{' '}
              <button
                type="button"
                className="auth-forgot-link-btn"
                onClick={() => {
                  setStep('form');
                  setError('');
                  setSuccess('');
                }}
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* --- View 3: Forgot Password - Step 2: Enter OTP & New Password --- */}
        {step === 'forgot_reset' && (
          <form className="auth-form" onSubmit={handleResetPasswordSubmit} noValidate>
            <h2>Create New Password</h2>
            <p className="auth-form-subtitle">
              Enter the 6-digit code sent to <strong>{email}</strong> and choose a secure new password.
            </p>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-success">
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{success}</span>
              </div>
            )}

            {/* 6-Digit OTP Input */}
            <div className="auth-input-group">
              <div className="auth-label-row">
                <label htmlFor="reset-otp">6-Digit Verification Code</label>
                <button
                  type="button"
                  className="auth-forgot-link-btn"
                  onClick={() => {
                    setStep('forgot_email');
                    setError('');
                    setSuccess('');
                  }}
                  title="Change email address"
                >
                  Change Email
                </button>
              </div>
              <div className="input-with-icon">
                <KeyRound size={16} />
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="otp-box-input"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Resend OTP Row */}
              <div className="auth-resend-row">
                <span>Didn&apos;t receive the code?</span>
                <button
                  type="button"
                  className="auth-resend-btn"
                  onClick={handleResendResetOtp}
                  disabled={resendCooldown > 0 || loading}
                >
                  <RotateCcw size={13} />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="auth-input-group">
              <label htmlFor="new-password">New Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter strong new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <PasswordRequirements password={newPassword} />
            </div>

            {/* Confirm New Password */}
            <div className="auth-input-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <div className="input-with-icon">
                <ShieldCheck size={16} />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}

        {/* --- View 4: Standard Sign In Form --- */}
        {step === 'form' && (
          <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
            <h2>Welcome Back</h2>
            <p className="auth-form-subtitle">Sign in to your research account</p>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-success">
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{success}</span>
              </div>
            )}

            <div className="auth-input-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="researcher@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="auth-forgot-link-btn"
                  onClick={() => {
                    setStep('forgot_email');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="auth-footer-text" style={{ marginTop: 24 }}>
              Don&apos;t have an account? <Link to="/signup">Create an account</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
