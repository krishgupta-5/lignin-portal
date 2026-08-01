import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { apiSignup } from '../services/api';
import './Auth.css';

function getStrength(password) {
  if (password.length === 0) return { level: 0, label: '', cls: '' };
  if (password.length < 6) return { level: 1, label: 'Weak', cls: 'weak' };
  if (password.length < 10) return { level: 2, label: 'Medium', cls: 'medium' };
  return { level: 3, label: 'Strong', cls: 'strong' };
}

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await apiSignup(form.name, form.email, form.password);
      navigate('/predict');
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
          <div className="auth-brand-title">AI-Powered Lignin<br />Extraction Predictor</div>
          <div className="auth-brand-tagline">Predict. Analyze. Optimize.</div>
          <p className="auth-brand-desc">
            Create an account to save predictions, compare results,
            generate reports, and collaborate with your research team.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p className="auth-form-subtitle">Join the research community</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-input-group">
            <label htmlFor="signup-name">Full Name</label>
            <div className="input-with-icon">
              <User size={16} />
              <input id="signup-name" type="text" name="name" placeholder="Enter your full name"
                value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="signup-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input id="signup-email" type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="signup-password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input id="signup-password" type={showPassword ? 'text' : 'password'} name="password"
                placeholder="Create a strong password" value={form.password} onChange={handleChange} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <>
                <div className="password-strength">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`strength-bar${i <= strength.level ? ` active ${strength.cls}` : ''}`} />
                  ))}
                </div>
                <div className={`strength-text ${strength.cls}`}>{strength.label}</div>
              </>
            )}
          </div>

          <div className="auth-input-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input id="signup-confirm" type="password" name="confirmPassword"
                placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div className="auth-terms">
            <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} required id="signup-terms" />
            <label htmlFor="signup-terms">
              I agree to the <a href="#" style={{ color: '#2D6A4F', fontWeight: 500 }}>Terms of Service</a> and{' '}
              <a href="#" style={{ color: '#2D6A4F', fontWeight: 500 }}>Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="auth-divider">or continue with</div>

          <div className="social-buttons">
            <button type="button" className="social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button type="button" className="social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
