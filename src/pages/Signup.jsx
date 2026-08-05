import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OtpVerification from '../components/OtpVerification';
import PasswordRequirements from '../components/PasswordRequirements';
import { checkPasswordConstraints } from '../utils/passwordValidator';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });

  // If already authenticated, redirect to /predict
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/predict', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    const pwdValidation = checkPasswordConstraints(form.password);
    if (!pwdValidation.isValid) {
      setError(pwdValidation.errorMessage || 'Please create a password that satisfies all security requirements.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!form.agreed) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup(cleanName, cleanEmail, form.password);
      if (res?.status === 'verification_required' || !res?.access_token) {
        setStep('otp');
      } else {
        navigate('/predict', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">🌿</div>
          <div className="auth-brand-title">
            AI-Powered Lignin<br />Extraction Predictor
          </div>
          <div className="auth-brand-tagline">Predict. Analyze. Optimize.</div>
          <p className="auth-brand-desc">
            Create an account to save predictions, compare results,
            generate reports, and collaborate with your research team.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-header">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={16} /> Back to Portal
          </Link>
        </div>

        {step === 'otp' ? (
          <OtpVerification
            email={form.email.trim().toLowerCase()}
            onVerified={() => navigate('/predict', { replace: true })}
            onBack={() => setStep('form')}
          />
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <h2>Create Account</h2>
            <p className="auth-form-subtitle">Join the lignin research community</p>


          {error && (
            <div className="auth-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="auth-input-group">
            <label htmlFor="signup-name">Full Name</label>
            <div className="input-with-icon">
              <User size={16} />
              <input
                id="signup-name"
                type="text"
                name="name"
                placeholder="Dr. Jane Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="signup-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                id="signup-email"
                type="email"
                name="email"
                placeholder="researcher@university.edu"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="signup-password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            <PasswordRequirements password={form.password} />
          </div>

          <div className="auth-input-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                id="signup-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
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

          <div className="auth-terms">
            <input
              type="checkbox"
              name="agreed"
              checked={form.agreed}
              onChange={handleChange}
              id="signup-terms"
              disabled={loading}
            />
            <label htmlFor="signup-terms">
              I agree to the research portal <span style={{ color: '#2D6A4F', fontWeight: 600 }}>Terms of Use</span> and{' '}
              <span style={{ color: '#2D6A4F', fontWeight: 600 }}>Privacy Policy</span>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
        )}
      </div>
    </div>
  );
}

