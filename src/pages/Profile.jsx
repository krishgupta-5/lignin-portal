import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Activity,
  FileText,
  CheckCircle,
  AlertCircle,
  Check,
  Edit2,
  Save,
  X,
  Sliders,
  LogOut,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  apiGetHistory,
  apiGetReports,
  apiUpdateProfile,
  apiChangePassword,
} from '../services/api';
import PasswordRequirements from '../components/PasswordRequirements';
import { checkPasswordConstraints } from '../utils/passwordValidator';
import './Profile.css';

export default function Profile() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { preferences, updatePreferences, formatTemp, tempSymbol } = usePreferences();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);

  // User Stats & Activity Data
  const [historyData, setHistoryData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Local Research Preferences state for form editing
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [prefSavedToast, setPrefSavedToast] = useState(false);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  // Load user stats
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.name) setNameInput(user.name);

    async function loadData() {
      setLoadingStats(true);
      try {
        const [histRes, repRes] = await Promise.allSettled([
          apiGetHistory('', 'All', 1, 10),
          apiGetReports(),
        ]);
        if (histRes.status === 'fulfilled' && histRes.value?.predictions) {
          setHistoryData(histRes.value.predictions);
        }
        if (repRes.status === 'fulfilled' && Array.isArray(repRes.value)) {
          setReportsData(repRes.value);
        }
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadData();
  }, [isAuthenticated, user]);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setNameLoading(true);
    try {
      const updated = await apiUpdateProfile(trimmed);
      updateProfile(updated);
      setIsEditingName(false);
    } catch (err) {
      alert(err.message || 'Failed to update name');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword) {
      setPwdError('Please enter your current password.');
      return;
    }

    const pwdValidation = checkPasswordConstraints(newPassword);
    if (!pwdValidation.isValid) {
      setPwdError(pwdValidation.errorMessage || 'New password does not meet security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match. Please verify.');
      return;
    }

    setPwdLoading(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.message || 'Failed to update password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updatePreferences(localPrefs);
    setPrefSavedToast(true);
    setTimeout(() => setPrefSavedToast(false), 2500);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent Member';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Compute stats
  const totalPredictions = historyData.length;
  const totalReports = reportsData.length;
  const avgYield =
    totalPredictions > 0
      ? (
          historyData.reduce((acc, curr) => {
            const y = curr.lignin_yield ?? curr.ligninYield ?? curr.yield_percentage ?? 0;
            return acc + (Number(y) || 0);
          }, 0) / totalPredictions
        ).toFixed(1)
      : '—';

  const formatPrefModel = (modelKey) => {
    switch (modelKey) {
      case 'node_augmented': return 'NODE Aug';
      case 'node': return 'NODE';
      case 'tabnet': return 'TabNet';
      case 'dnn': return 'DNN';
      default: return 'NODE Aug';
    }
  };

  // Unauthenticated Guest View
  if (!isAuthenticated) {
    return (
      <div className="profile-page animate-fade-in">
        <div className="profile-guest-card">
          <div className="profile-guest-icon">
            <User size={48} />
          </div>
          <h2>Researcher Profile</h2>
          <p className="profile-guest-desc">
            Sign in to manage your researcher identity, view activity analytics, configure default model parameters, and access saved predictions across sessions.
          </p>
          <div className="profile-guest-actions">
            <Link to="/login" className="btn btn-primary">
              Sign In to Your Account
            </Link>
            <Link to="/signup" className="btn btn-secondary">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page animate-fade-in">
      {/* Top Hero Banner */}
      <div className="profile-hero-card">
        <div className="profile-hero-main">
          <div className="profile-avatar-large">
            {getInitials(user?.name)}
          </div>

          <div className="profile-hero-info">
            <div className="profile-name-row">
              {isEditingName ? (
                <div className="profile-name-edit">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    disabled={nameLoading}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameLoading}
                    className="profile-btn-icon save"
                    title="Save Name"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setNameInput(user?.name || '');
                      setIsEditingName(false);
                    }}
                    className="profile-btn-icon cancel"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="profile-name-display">
                  <h1>{user?.name}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="profile-edit-btn"
                    title="Edit Name"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              )}
              <span className="profile-role-badge">
                <Sparkles size={13} /> Research Scientist
              </span>
            </div>

            <div className="profile-meta-list">
              <div className="profile-meta-item">
                <Mail size={15} />
                <span>{user?.email}</span>
              </div>
              <div className="profile-meta-item">
                <Calendar size={15} />
                <span>Joined {formatDate(user?.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={logout} className="profile-logout-btn">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Stats Ribbon */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="stat-icon-wrap emerald">
            <Activity size={20} />
          </div>
          <div className="stat-details">
            <div className="stat-val">{loadingStats ? '...' : totalPredictions}</div>
            <div className="stat-lbl">Predictions Executed</div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-wrap blue">
            <FileText size={20} />
          </div>
          <div className="stat-details">
            <div className="stat-val">{loadingStats ? '...' : totalReports}</div>
            <div className="stat-lbl">Reports Generated</div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-wrap amber">
            <TrendingUp size={20} />
          </div>
          <div className="stat-details">
            <div className="stat-val">{loadingStats ? '...' : avgYield !== '—' ? `${avgYield}%` : '—'}</div>
            <div className="stat-lbl">Avg Yield Output</div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-wrap purple">
            <Cpu size={20} />
          </div>
          <div className="stat-details">
            <div className="stat-val">{formatPrefModel(preferences.defaultModel)}</div>
            <div className="stat-lbl">Preferred Model</div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="profile-tabs-header">
        <button
          className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} /> Research Overview
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Sliders size={16} /> Model & Research Preferences
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={16} /> Security & Account
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="profile-tab-content">
          <div className="profile-section-card">
            <div className="section-card-header">
              <div>
                <h3>Recent Prediction Activity</h3>
                <p>Latest runs logged under this account</p>
              </div>
              <Link to="/history" className="section-link">
                View All History <ArrowRight size={14} />
              </Link>
            </div>

            {loadingStats ? (
              <div className="profile-loading-state">Loading recent activity...</div>
            ) : historyData.length === 0 ? (
              <div className="profile-empty-state">
                <p>No predictions executed yet.</p>
                <Link to="/predict" className="btn btn-primary btn-sm">
                  Run First Prediction
                </Link>
              </div>
            ) : (
              <div className="profile-recent-table-wrap">
                <table className="profile-recent-table">
                  <thead>
                    <tr>
                      <th>Plant Source</th>
                      <th>Chemical</th>
                      <th>Temp ({tempSymbol})</th>
                      <th>Yield</th>
                      <th>Performance</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.slice(0, 5).map((item, idx) => {
                      const yieldVal = item.lignin_yield ?? item.ligninYield ?? item.yield_percentage;
                      const perf = item.performance || 'Good';
                      return (
                        <tr key={item.id || idx}>
                          <td className="fw-semibold">{item.plant}</td>
                          <td>{item.chemical}</td>
                          <td>{formatTemp(item.temperature)}</td>
                          <td className="yield-cell">
                            {yieldVal != null ? `${Number(yieldVal).toFixed(1)}%` : '—'}
                          </td>
                          <td>
                            <span className={`badge badge-${perf.toLowerCase()}`}>
                              {perf}
                            </span>
                          </td>
                          <td className="text-muted">
                            {item.created_at ? formatDate(item.created_at) : 'Recent'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="profile-section-card">
            <div className="section-card-header">
              <div>
                <h3>Generated Reports</h3>
                <p>Synthesized analysis documents</p>
              </div>
              <Link to="/reports" className="section-link">
                View All Reports <ArrowRight size={14} />
              </Link>
            </div>

            {loadingStats ? (
              <div className="profile-loading-state">Loading reports...</div>
            ) : reportsData.length === 0 ? (
              <div className="profile-empty-state">
                <p>No reports generated yet.</p>
                <Link to="/history" className="btn btn-secondary btn-sm">
                  Select Predictions to Export
                </Link>
              </div>
            ) : (
              <div className="profile-reports-grid">
                {reportsData.slice(0, 4).map((rep) => (
                  <div key={rep.id} className="profile-report-mini">
                    <FileText size={20} className="report-icon" />
                    <div className="report-mini-info">
                      <div className="report-mini-title">{rep.title}</div>
                      <div className="report-mini-meta">
                        {rep.format || 'PDF'} • {rep.size || '350 KB'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Preferences */}
      {activeTab === 'preferences' && (
        <div className="profile-tab-content">
          <div className="profile-section-card">
            <div className="section-card-header">
              <div>
                <h3>Research & AI Model Defaults</h3>
                <p>Configure your default prediction workspace parameters</p>
              </div>
            </div>

            {prefSavedToast && (
              <div className="profile-success-banner">
                <CheckCircle size={18} /> Preferences successfully updated!
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="profile-pref-form">
              <div className="pref-row">
                <div className="pref-info">
                  <label htmlFor="pref-default-model">Default Prediction Model</label>
                  <p>Model loaded by default on the prediction workspace</p>
                </div>
                <select
                  id="pref-default-model"
                  className="pref-select"
                  value={localPrefs.defaultModel}
                  onChange={(e) =>
                    setLocalPrefs((prev) => ({ ...prev, defaultModel: e.target.value }))
                  }
                >
                  <option value="node_augmented">NODE Augmented (Physics-Informed ODESolve)</option>
                  <option value="node">Neural ODE Standard</option>
                  <option value="tabnet">TabNet Attentive Ensemble</option>
                  <option value="dnn">Deep Neural Network (Feed-Forward)</option>
                </select>
              </div>

              <div className="pref-row">
                <div className="pref-info">
                  <label htmlFor="pref-temp-unit">Temperature Unit Display</label>
                  <p>Preferred thermal scale in UI charts, forms, CSV, and PDF exports</p>
                </div>
                <select
                  id="pref-temp-unit"
                  className="pref-select"
                  value={localPrefs.tempUnit}
                  onChange={(e) =>
                    setLocalPrefs((prev) => ({ ...prev, tempUnit: e.target.value }))
                  }
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="kelvin">Kelvin (K)</option>
                </select>
              </div>

              <div className="pref-row">
                <div className="pref-info">
                  <label>Auto-Save Predictions</label>
                  <p>Automatically save every executed inference into history</p>
                </div>
                <label className="pref-toggle">
                  <input
                    type="checkbox"
                    checked={localPrefs.autoSave}
                    onChange={(e) =>
                      setLocalPrefs((prev) => ({ ...prev, autoSave: e.target.checked }))
                    }
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="pref-form-actions">
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Account */}
      {activeTab === 'security' && (
        <div className="profile-tab-content">
          <div className="profile-section-card">
            <div className="section-card-header">
              <div>
                <h3>Change Password</h3>
                <p>Update your research account password</p>
              </div>
            </div>

            {pwdError && (
              <div className="profile-error-banner">
                <AlertCircle size={18} /> {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="profile-success-banner">
                <CheckCircle size={18} /> {pwdSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="password-change-form">
              <div className="form-group">
                <label htmlFor="curr-pwd">Current Password</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    id="curr-pwd"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-pwd">New Password</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    id="new-pwd"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    required
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

              <div className="form-group">
                <label htmlFor="confirm-pwd">Confirm New Password</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    id="confirm-pwd"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
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

              <button type="submit" className="btn btn-primary" disabled={pwdLoading}>
                {pwdLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
