import { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './OtpVerification.css';

export default function OtpVerification({ email, onVerified, onBack }) {
  const { verifyOTP, resendOTP } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef([]);

  // Auto-focus first digit box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleDigitChange = (index, value) => {
    // Only accept numeric characters
    const val = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);
    setError('');

    // Auto-advance to next input
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if all 6 digits entered
    if (val && index === 5 && newDigits.every((d) => d !== '')) {
      const fullOtp = newDigits.join('');
      submitOtp(fullOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    setError('');

    const nextIndex = Math.min(pasted.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }

    if (pasted.length === 6) {
      submitOtp(pasted);
    }
  };

  const submitOtp = async (codeToVerify) => {
    const otpCode = codeToVerify || digits.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await verifyOTP(email, otpCode);
      setSuccessMsg('Email verified successfully! Logging you in...');
      setTimeout(() => {
        if (onVerified) onVerified();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
      // Clear and focus first input
      setDigits(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resendOTP(email);
      setSuccessMsg(res?.message || 'New 6-digit verification code sent to your email!');
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-icon-wrapper">
        <div className="otp-icon-bubble">
          <ShieldCheck size={32} color="#10B981" />
        </div>
      </div>

      <h2 className="otp-title">Verify Your Email</h2>
      <p className="otp-subtitle">
        We sent a 6-digit verification code to
      </p>
      <div className="otp-email-badge">
        <Mail size={14} />
        <span>{email}</span>
      </div>

      {error && (
        <div className="auth-error otp-alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="otp-success-alert">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="otp-input-boxes" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            disabled={loading}
            className={`otp-digit-input ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      <button
        type="button"
        className="auth-submit-btn otp-verify-btn"
        onClick={() => submitOtp()}
        disabled={loading || digits.some((d) => !d)}
      >
        {loading ? 'Verifying Code...' : 'Verify & Continue'}
      </button>

      <div className="otp-resend-row">
        <span>Didn&apos;t receive the code?</span>
        <button
          type="button"
          className="otp-resend-btn"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
        >
          {resending ? (
            <>
              <RefreshCw size={14} className="spin" /> Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            'Resend Code'
          )}
        </button>
      </div>

      {onBack && (
        <button type="button" className="otp-back-btn" onClick={onBack}>
          <ArrowLeft size={15} /> Back to Sign Up
        </button>
      )}
    </div>
  );
}
