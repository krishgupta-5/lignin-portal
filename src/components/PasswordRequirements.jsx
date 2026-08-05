import { Check, Circle } from 'lucide-react';
import { checkPasswordConstraints } from '../utils/passwordValidator';
import './PasswordRequirements.css';

export default function PasswordRequirements({ password = '', showOnlyWhenTyping = false }) {
  if (showOnlyWhenTyping && (!password || password.length === 0)) {
    return null;
  }

  const { rules, strength, isValid } = checkPasswordConstraints(password);

  return (
    <div className="pwd-requirements-box">
      {/* Strength Bar */}
      {password && password.length > 0 && (
        <div className="pwd-strength-container">
          <div className="pwd-strength-bars">
            <div className={`pwd-bar ${strength.score >= 1 ? `active ${strength.level}` : ''}`} />
            <div className={`pwd-bar ${strength.score >= 2 ? `active ${strength.level}` : ''}`} />
            <div className={`pwd-bar ${strength.score >= 3 ? `active ${strength.level}` : ''}`} />
          </div>
          <span className={`pwd-strength-text ${strength.level}`}>
            {strength.label}
          </span>
        </div>
      )}

      {/* Rules Checklist */}
      <div className="pwd-rules-list">
        {rules.map((r) => (
          <div key={r.id} className={`pwd-rule-item ${r.met ? 'met' : ''}`}>
            {r.met ? (
              <Check size={13} className="pwd-rule-icon met" />
            ) : (
              <Circle size={11} className="pwd-rule-icon unmet" />
            )}
            <span className="pwd-rule-label">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
