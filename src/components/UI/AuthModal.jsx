import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

export default function AuthModal() {
  const { authModalState, closeAuthModal } = useAuth();
  const navigate = useNavigate();

  const isOpen = authModalState?.isOpen;
  const targetPath = authModalState?.targetPath || '/predict';

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAuthModal]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    closeAuthModal();
    navigate(path, { state: { from: { pathname: targetPath } } });
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="auth-modal-card animate-modal-pop" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="auth-modal-close-btn"
          onClick={closeAuthModal}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header Icon */}
        <div className="auth-modal-icon-wrapper">
          <div className="auth-modal-icon-glow" />
          <div className="auth-modal-icon-badge">
            <Lock size={26} className="auth-modal-lock-icon" />
          </div>
        </div>

        {/* Content */}
        <div className="auth-modal-body">
          <div className="auth-modal-tag">
            <Sparkles size={13} /> Authentication Required
          </div>
          <h3 className="auth-modal-title">Sign In / Sign Up to Continue</h3>
          <p className="auth-modal-subtitle">
            To access the AI prediction engine and generate extraction recommendations, please log in to your account.
          </p>

          {/* Value Props */}
          <div className="auth-modal-features">
            <div className="auth-feature-item">
              <CheckCircle2 size={16} className="feature-check" />
              <span>Multi-model predictions (TabNet, DNN, NODE)</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={16} className="feature-check" />
              <span>Live extraction yield curves & kinetics</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={16} className="feature-check" />
              <span>Auto-save research history & export reports</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="auth-modal-actions">
            <button
              type="button"
              className="auth-modal-btn primary"
              onClick={() => handleNavigate('/login')}
            >
              Sign In to Account <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="auth-modal-btn secondary"
              onClick={() => handleNavigate('/signup')}
            >
              Create Free Account
            </button>
            <button
              type="button"
              className="auth-modal-btn ghost"
              onClick={closeAuthModal}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
