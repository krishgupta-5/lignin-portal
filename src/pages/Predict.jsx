import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Download, FileText, GitCompareArrows, Clock, BarChart3, Brain, CheckCircle2 } from 'lucide-react';
import { plantOptions, chemicalOptions, simulatePrediction } from '../data/mockData';
import { apiPredict, isAuthenticated } from '../services/api';
import MetricCard from '../components/UI/MetricCard';
import ConfidenceBar from '../components/UI/ConfidenceBar';
import YieldTimeChart from '../components/Charts/YieldTimeChart';
import './Predict.css';

const MODEL_OPTIONS = [
  {
    id: 'tabnet',
    name: 'TabNet',
    accuracy: 94.2,
    description: 'Attention-based tabular learning',
    icon: '🧠',
  },
  {
    id: 'dnn',
    name: 'DNN',
    accuracy: 91.7,
    description: 'Deep Neural Network (MLP)',
    icon: '🔗',
  },
  {
    id: 'node',
    name: 'NODE',
    accuracy: 93.5,
    description: 'Neural Oblivious Decision Ensembles',
    icon: '🌳',
  },
  {
    id: 'node_augmented',
    name: 'NODE Augmented',
    accuracy: 95.8,
    description: 'NODE with feature augmentation',
    icon: '⚡',
  },
];

function getPerformanceColor(perf) {
  switch (perf) {
    case 'Better': return '#2D6A4F';
    case 'Good': return '#40916C';
    case 'Average': return '#E9A820';
    case 'Poor': return '#DC3545';
    default: return '#4A5568';
  }
}

function getAccuracyColor(acc) {
  if (acc >= 95) return '#2D6A4F';
  if (acc >= 93) return '#40916C';
  if (acc >= 91) return '#E9A820';
  return '#DC3545';
}

// Normalize API response keys (snake_case → camelCase where needed)
function normalizeResult(data) {
  return {
    ligninYield: data.lignin_yield ?? data.ligninYield,
    recommendedTime: data.recommended_time ?? data.recommendedTime,
    performance: data.performance,
    confidence: data.confidence,
    model: data.model,
    yieldCurve: (data.yield_curve ?? data.yieldCurve ?? []).map((p) => ({
      time: p.time,
      yield: p.yield_value ?? p.yield ?? p.yield_value,
    })),
  };
}

export default function Predict() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState('node_augmented');
  const [formData, setFormData] = useState({
    plant: 'miscanthus',
    chemical: 'choline_chloride_urea',
    temperature: 120,
    timeRange: '10 – 180',
    ratio: '1:15',
    ph: 3.5,
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      if (isAuthenticated()) {
        const data = await apiPredict({ ...formData, model: selectedModel });
        setResult(normalizeResult(data));
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        const mock = simulatePrediction(
          formData.plant, formData.chemical,
          String(formData.temperature), formData.timeRange,
          formData.ratio, String(formData.ph)
        );
        setResult({ ...mock, model: selectedModel });
      }
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const activeModel = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  return (
    <div className="predict-page">
      {!isAuthenticated() && (
        <div className="guest-banner">
          💡 You're using guest mode with simulated data.{' '}
          <Link to="/login">Sign in</Link> to save predictions and use the real API.
        </div>
      )}

      {/* Model Selector */}
      <div className="model-selector-section">
        <div className="model-selector-header">
          <Brain size={18} />
          <span>Select Prediction Model</span>
        </div>
        <div className="model-cards-row">
          {MODEL_OPTIONS.map((model) => (
            <button
              key={model.id}
              className={`model-card${selectedModel === model.id ? ' model-card-active' : ''}`}
              onClick={() => setSelectedModel(model.id)}
              id={`model-${model.id}`}
            >
              {selectedModel === model.id && (
                <div className="model-check"><CheckCircle2 size={14} /></div>
              )}
              <div className="model-card-icon">{model.icon}</div>
              <div className="model-card-name">{model.name}</div>
              <div className="model-card-desc">{model.description}</div>
              <div className="model-card-accuracy">
                <div
                  className="accuracy-bar"
                  style={{ '--accuracy': `${model.accuracy}%`, '--accuracy-color': getAccuracyColor(model.accuracy) }}
                >
                  <div className="accuracy-fill" />
                </div>
                <span className="accuracy-value" style={{ color: getAccuracyColor(model.accuracy) }}>
                  {model.accuracy}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="predict-grid">
        {/* Left Panel */}
        <div className="input-panel animate-slide-left">
          <div className="panel-title">Input Parameters</div>

          <div className="form-group">
            <label htmlFor="plant-select">Plant</label>
            <select id="plant-select" name="plant" value={formData.plant} onChange={handleChange}>
              {plantOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="chemical-select">Chemical(s)</label>
            <select id="chemical-select" name="chemical" value={formData.chemical} onChange={handleChange}>
              {chemicalOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="params-subtitle">Process Parameters</div>
          <div className="params-grid">
            <div className="form-group">
              <label htmlFor="temperature-input">Temperature (°C)</label>
              <input id="temperature-input" type="number" name="temperature"
                value={formData.temperature} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="time-range-input">Time Range (min)</label>
              <input id="time-range-input" type="text" name="timeRange"
                value={formData.timeRange} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="ratio-input">Solid to Liquid Ratio</label>
              <input id="ratio-input" type="text" name="ratio"
                value={formData.ratio} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="ph-input">pH</label>
              <input id="ph-input" type="number" name="ph" step="0.1"
                value={formData.ph} onChange={handleChange} />
            </div>
          </div>

          <button className="predict-btn" onClick={handlePredict} disabled={isLoading}>
            <Zap size={18} />
            {isLoading ? `Running ${activeModel?.name}...` : `Predict with ${activeModel?.name}`}
          </button>
        </div>

        {/* Right Panel */}
        <div className={`results-panel animate-slide-right${isLoading ? ' loading-pulse' : ''}`}>
          <div className="panel-title">Prediction Results</div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

          {!result && !isLoading && !error && (
            <div className="results-placeholder">
              <div className="results-placeholder-icon">
                <BarChart3 size={28} />
              </div>
              <p>Configure parameters and click <strong>Predict</strong> to see results</p>
            </div>
          )}

          {isLoading && (
            <div className="results-placeholder">
              <div className="results-placeholder-icon" style={{ background: '#D8F3DC' }}>
                <Zap size={28} color="#2D6A4F" />
              </div>
              <p>Running <strong>{activeModel?.name}</strong> model...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="animate-fade-in">
              {/* Model badge in results */}
              <div className="result-model-badge">
                <span className="result-model-icon">{activeModel?.icon}</span>
                <span>Predicted with <strong>{activeModel?.name}</strong></span>
                <span className="result-model-accuracy">{activeModel?.accuracy}% accuracy</span>
              </div>

              <div className="metrics-row">
                <MetricCard label="Predicted Lignin Yield" value={result.ligninYield} unit=" %" color="#2D6A4F" />
                <MetricCard label="Recommended Time" value={result.recommendedTime} unit=" min" color="#1B7A5C" />
                <MetricCard label="Performance" value={result.performance} color={getPerformanceColor(result.performance)} />
              </div>
              <ConfidenceBar value={result.confidence} />
              <YieldTimeChart data={result.yieldCurve} highlightTime={result.recommendedTime} />
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button className="action-btn"><Download size={16} /> Download Report</button>
        <button className="action-btn"><FileText size={16} /> Save Result</button>
        <button className="action-btn"><GitCompareArrows size={16} /> Add to Compare</button>
        <Link to="/history" className="action-btn"><Clock size={16} /> View History</Link>
      </div>
    </div>
  );
}
