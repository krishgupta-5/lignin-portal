/**
 * Password validation utilities enforcing security constraints:
 * - At least 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&* etc.)
 */

export function checkPasswordConstraints(password = '') {
  const pwd = String(password || '');

  const rules = [
    { id: 'min_length', label: 'At least 8 characters', met: pwd.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(pwd) },
    { id: 'lowercase', label: 'One lowercase letter (a-z)', met: /[a-z]/.test(pwd) },
    { id: 'number', label: 'One number (0-9)', met: /[0-9]/.test(pwd) },
    { id: 'special', label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd) },
  ];

  const metCount = rules.filter((r) => r.met).length;
  const isValid = metCount === rules.length;

  let strength = { level: '', label: '', score: 0 };
  if (pwd.length > 0) {
    if (metCount === 5) {
      strength = { level: 'strong', label: 'Strong password', score: 3 };
    } else if (metCount >= 3) {
      strength = { level: 'medium', label: 'Moderate strength', score: 2 };
    } else {
      strength = { level: 'weak', label: 'Weak password', score: 1 };
    }
  }

  const unmetRule = rules.find((r) => !r.met);
  const errorMessage = !isValid
    ? unmetRule
      ? `Password must contain ${unmetRule.label.toLowerCase()}`
      : 'Password does not meet security constraints.'
    : '';

  return {
    rules,
    metCount,
    isValid,
    strength,
    errorMessage,
  };
}
