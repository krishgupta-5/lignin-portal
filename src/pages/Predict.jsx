import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Download,
  FileText,
  GitCompareArrows,
  Clock,
  BarChart3,
  Brain,
  CheckCircle2,
  Loader2,
  Layers,
  Beaker,
  Sliders,
  ArrowDownCircle,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { apiPredict, apiPredictAll, apiGetOptions, apiGenerateReport } from '../services/api';
import { exportToCSV, exportToPrintablePDF } from '../utils/exportUtils';
import { convertTempToCelsius, convertTempFromCelsius } from '../utils/tempConverter';
import MetricCard from '../components/UI/MetricCard';
import ConfidenceBar from '../components/UI/ConfidenceBar';
import PredictionChartsSuite from '../components/Charts/PredictionChartsSuite';
import MultiModelBenchmarkSuite from '../components/Charts/MultiModelBenchmarkSuite';
import './Predict.css';

const MODEL_OPTIONS = [
  {
    id: 'tabnet',
    name: 'TabNet',
    accuracy: 72.6,
    r2: '0.7256',
    description: 'Attention-based tabular learning',
    icon: '🧠',
  },
  {
    id: 'dnn',
    name: 'DNN',
    accuracy: 83.5,
    r2: '0.8350',
    description: 'Deep Neural Network (MLP)',
    icon: '🔗',
  },
  {
    id: 'node',
    name: 'NODE',
    accuracy: 87.3,
    r2: '0.8726',
    description: 'Neural Oblivious Decision Ensembles',
    icon: '🌳',
  },
  {
    id: 'node_augmented',
    name: 'NODE Augmented',
    accuracy: 83.4,
    r2: '0.8335',
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
  if (acc >= 90) return '#2D6A4F';
  if (acc >= 85) return '#40916C';
  if (acc >= 80) return '#2D6A4F';
  return '#E9A820';
}

// Normalize API response keys (snake_case → camelCase where needed)
function normalizeResult(data) {
  if (!data) return null;
  return {
    id: data.id ?? data._id,
    plant: data.plant,
    chemical: data.chemical,
    temperature: data.temperature,
    timeRange: data.time_range ?? data.timeRange,
    ratio: data.ratio,
    ph: data.ph,
    ligninYield: Number(data.lignin_yield ?? data.ligninYield ?? 0),
    recommendedTime: Number(data.recommended_time ?? data.recommendedTime ?? 90),
    performance: data.performance || 'Good',
    confidence: Number(data.confidence ?? 85),
    model: data.model || 'node_augmented',
    yieldCurve: (data.yield_curve ?? data.yieldCurve ?? []).map((p) => ({
      time: Number(p.time),
      yield: Number(p.yield_value ?? p.yield ?? 0),
    })),
  };
}

const INITIAL_OPTIONS = {
  feed_materials: [
    { name: 'Bamboo', key: 'bamboo', cellulose_percent: 44.3, hemicellulose_percent: 20.0, lignin_percent: 27.9, size_mm: 0.54 },
    { name: 'Wheat Straw', key: 'wheat_straw', cellulose_percent: 35.8, hemicellulose_percent: 22.3, lignin_percent: 18.2, size_mm: 0.83 },
    { name: 'Bagasse', key: 'bagasse', cellulose_percent: 42.1, hemicellulose_percent: 23.4, lignin_percent: 21.6, size_mm: 0.62 },
    { name: 'Willow', key: 'willow', cellulose_percent: 41.2, hemicellulose_percent: 19.8, lignin_percent: 26.5, size_mm: 0.5 },
    { name: 'Eucalyptus', key: 'eucalyptus', cellulose_percent: 45.0, hemicellulose_percent: 18.5, lignin_percent: 28.2, size_mm: 0.5 },
    { name: 'Corn Cob', key: 'corn_cob', cellulose_percent: 38.5, hemicellulose_percent: 32.1, lignin_percent: 16.4, size_mm: 2.08 },
    { name: 'Miscanthus', key: 'miscanthus', cellulose_percent: 43.2, hemicellulose_percent: 24.1, lignin_percent: 22.0, size_mm: 0.5 },
    { name: 'Birch', key: 'birch', cellulose_percent: 40.5, hemicellulose_percent: 25.3, lignin_percent: 21.4, size_mm: 0.5 },
    { name: 'Corn Stover', key: 'corn_stover', cellulose_percent: 36.3, hemicellulose_percent: 20.6, lignin_percent: 20.9, size_mm: 0.83 },
    { name: 'Rice Husks', key: 'rice_husks', cellulose_percent: 34.7, hemicellulose_percent: 16.4, lignin_percent: 17.0, size_mm: 0.83 },
    { name: 'Sunflower Straw', key: 'sunflower_straw', cellulose_percent: 30.8, hemicellulose_percent: 12.4, lignin_percent: 15.1, size_mm: 0.38 },
    { name: 'Reed Straw', key: 'reed_straw', cellulose_percent: 43.8, hemicellulose_percent: 18.1, lignin_percent: 25.3, size_mm: 0.42 },
  ],
  hba_compounds: [
    { name: 'Benzyltrimethylammonium chloride', abbreviation: 'BTMAC', type: 'HBA' },
    { name: 'Choline chloride', abbreviation: 'ChCl', type: 'HBA' },
    { name: 'Allyl trimethyl ammonium chloride', abbreviation: 'ATMAC', type: 'HBA' },
    { name: 'Betaine', abbreviation: 'Bet', type: 'HBA' },
    { name: 'Cetyltrimethylammonium bromide', abbreviation: 'CTAB', type: 'HBA' },
    { name: 'Ethanolamine hydrochloride', abbreviation: 'MEA HCl', type: 'HBA' },
    { name: 'Tetramethylammonium chloride', abbreviation: 'TMAC', type: 'HBA' },
    { name: 'Tetraethylammonium chloride', abbreviation: 'TEAC', type: 'HBA' },
    { name: 'Tetrabutylammonium chloride', abbreviation: 'TBAC', type: 'HBA' },
  ],
  hbd_compounds: [
    { name: '4-hydroxybenzaldehyde', abbreviation: '4-HBA', type: 'HBD' },
    { name: 'Lactic acid', abbreviation: 'LA', type: 'HBD' },
    { name: 'Acetic acid', abbreviation: 'AA', type: 'HBD' },
    { name: 'Formic acid', abbreviation: 'FA', type: 'HBD' },
    { name: 'Oxalic acid', abbreviation: 'OA', type: 'HBD' },
    { name: 'Glycerol', abbreviation: 'Gly', type: 'HBD' },
    { name: 'Ethylene Glycol', abbreviation: 'EG', type: 'HBD' },
    { name: 'Urea', abbreviation: 'U', type: 'HBD' },
    { name: 'Levulinic acid', abbreviation: 'LeA', type: 'HBD' },
    { name: 'Malic acid', abbreviation: 'MIA', type: 'HBD' },
    { name: 'Vanillin', abbreviation: 'VAN', type: 'HBD' },
  ],
  hbd_hba_ratio_range: { min: 0.5, max: 10.0 },
};

export default function Predict() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    preferences,
    tempUnit,
    tempSymbol,
    convertTempFromC,
    convertTempToC,
    formatTemp,
    getTempRange,
  } = usePreferences();
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('user_research_prefs') || '{}');
      return prefs.defaultModel || 'node_augmented';
    } catch {
      return 'node_augmented';
    }
  });
  const [compareAllMode, setCompareAllMode] = useState(false);
  const resultsRef = useRef(null);
  const prevTempUnitRef = useRef(tempUnit);

  // Options loaded from research database (with instant defaults)
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 10 Experimental Parameters State
  const [formData, setFormData] = useState({
    // Biomass Parameters (5 fields)
    feedMaterial: 'bamboo',
    cellulosePercent: 44.3,
    hemicellulosePercent: 20.0,
    ligninPercent: 27.9,
    sizeMm: 0.54,

    // DES Solvent Parameters (3 fields)
    hba: 'BTMAC',
    hbd: '4-HBA',
    hbdHbaRatio: 6.0,

    // Process Parameters (2 fields + time range)
    temperature: convertTempFromCelsius(100, tempUnit),
    liquidSolidRatio: 18,
    timeRange: '10 – 160',
  });

  // Sync temperature input value when tempUnit changes in preferences
  useEffect(() => {
    if (prevTempUnitRef.current !== tempUnit) {
      const oldUnit = prevTempUnitRef.current;
      setFormData((prev) => {
        const cVal = convertTempToCelsius(prev.temperature, oldUnit);
        return { ...prev, temperature: convertTempFromCelsius(cVal, tempUnit) };
      });
      prevTempUnitRef.current = tempUnit;
    }
  }, [tempUnit]);

  // Single Model & Multi Model Results State
  const [result, setResult] = useState(null);
  const [multiResults, setMultiResults] = useState(null);
  const [ensembleData, setEnsembleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load options from backend on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOptionsLoading(true);
      try {
        const data = await apiGetOptions();
        if (!cancelled && data && data.feed_materials?.length > 0) {
          setOptions(data);
        }
      } catch (err) {
        console.error('Failed to load options:', err);
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-fill standard composition when feed material changes
  const handleFeedMaterialChange = (e) => {
    const selectedKey = e.target.value;
    const mat = (options?.feed_materials || []).find((m) => m.key === selectedKey);
    if (mat) {
      setFormData((prev) => ({
        ...prev,
        feedMaterial: selectedKey,
        cellulosePercent: mat.cellulose_percent,
        hemicellulosePercent: mat.hemicellulose_percent,
        ligninPercent: mat.lignin_percent,
        sizeMm: mat.size_mm,
      }));
    } else {
      setFormData((prev) => ({ ...prev, feedMaterial: selectedKey }));
    }
  };

  const handlePredict = async () => {
    if (!compareAllMode && !selectedModel) {
      setError('Please select a prediction model above before running prediction.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setMultiResults(null);
    setError('');

    // Smooth scroll down to results section
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const hbaCode = formData.hba || 'BTMAC';
    const hbdCode = formData.hbd || '4-HBA';
    const chemStr = `${hbaCode}_${hbdCode}`.toLowerCase().replace(/\s+/g, '_');
    const tempInCelsius = convertTempToC(formData.temperature);

    const payload = {
      plant: formData.feedMaterial || 'bamboo',
      chemical: chemStr,
      temperature: tempInCelsius,
      time_range: formData.timeRange || '10 – 160',
      ratio: `1:${formData.liquidSolidRatio || 18}`,
      ph: 7.0,
      cellulose_percent: Number(formData.cellulosePercent) || 44.3,
      hemicellulose_percent: Number(formData.hemicellulosePercent) || 20.0,
      lignin_percent: Number(formData.ligninPercent) || 27.9,
      size_mm: Number(formData.sizeMm) || 0.54,
      hbd_hba_ratio: Number(formData.hbdHbaRatio) || 6.0,
      liquid_solid_ratio: Number(formData.liquidSolidRatio) || 18.0,
    };

    try {
      if (compareAllMode) {
        // Run all 4 models simultaneously
        const data = await apiPredictAll(payload);
        const normalizedList = (data.predictions || []).map(normalizeResult);
        setMultiResults(normalizedList);
        setEnsembleData({
          ensembleYield: data.ensemble_yield,
          bestModel: data.best_model,
          modelsEvaluated: data.models_evaluated,
        });
      } else {
        // Run single selected model
        const singlePayload = { ...payload, model: selectedModel };
        const data = await apiPredict(singlePayload);
        setResult(normalizeResult(data));
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      setError(err.message || 'Prediction execution failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!isAuthenticated) {
      openAuthModal('/predict');
      return;
    }

    const tempInCelsius = convertTempToC(formData.temperature);

    if (multiResults && multiResults.length > 0) {
      const enrichedMulti = multiResults.map((r) => ({
        ...r,
        plant: formData.feedMaterial,
        chemical: `${formData.hba} + ${formData.hbd}`,
        temperature: tempInCelsius,
        time_range: formData.timeRange,
        size_mm: formData.sizeMm,
        hbd_hba_ratio: formData.hbdHbaRatio,
        liquid_solid_ratio: formData.liquidSolidRatio,
      }));
      const filename = `lignin_multimodel_benchmark_${formData.feedMaterial}.csv`;
      exportToCSV(enrichedMulti, filename);
    } else if (result) {
      const filename = `lignin_prediction_${formData.feedMaterial}_${result.recommendedTime}min.csv`;
      exportToCSV({
        ...result,
        plant: formData.feedMaterial,
        chemical: `${formData.hba} + ${formData.hbd}`,
        temperature: tempInCelsius,
        time_range: formData.timeRange,
      }, filename);
    }
  };

  const handleDownloadPDF = async () => {
    if (!isAuthenticated) {
      openAuthModal('/predict');
      return;
    }

    const tempInCelsius = convertTempToC(formData.temperature);

    if (multiResults && multiResults.length > 0) {
      const enrichedMulti = multiResults.map((r) => ({
        ...r,
        plant: formData.feedMaterial,
        chemical: `${formData.hba} + ${formData.hbd}`,
        temperature: tempInCelsius,
        time_range: formData.timeRange,
        size_mm: formData.sizeMm,
        hbd_hba_ratio: formData.hbdHbaRatio,
        liquid_solid_ratio: formData.liquidSolidRatio,
      }));
      exportToPrintablePDF(enrichedMulti, 'Simultaneous 4-Model Benchmark');

      if (isAuthenticated) {
        const ids = multiResults.map((p) => p.id).filter(Boolean);
        if (ids.length > 0) {
          try {
            await apiGenerateReport(`Multi-Model Benchmark — ${formData.feedMaterial}`, ids);
            setReportSaved(true);
          } catch (e) {
            console.warn('Auto-save multi-model report notice:', e);
          }
        }
      }
    } else if (result) {
      exportToPrintablePDF({
        ...result,
        plant: formData.feedMaterial,
        chemical: `${formData.hba} + ${formData.hbd}`,
        temperature: tempInCelsius,
        time_range: formData.timeRange,
        size_mm: formData.sizeMm,
        hbd_hba_ratio: formData.hbdHbaRatio,
        liquid_solid_ratio: formData.liquidSolidRatio,
      }, activeModel?.name);

      if (isAuthenticated && result.id) {
        try {
          await apiGenerateReport(`${activeModel?.name} Report — ${formData.feedMaterial}`, [result.id]);
          setReportSaved(true);
        } catch (e) {
          console.warn('Report auto-save notice:', e);
        }
      }
    }
  };

  const handleSaveToDatabase = async () => {
    if (!isAuthenticated) {
      openAuthModal('/predict');
      return;
    }

    const tempInCelsius = convertTempToC(formData.temperature);

    if (multiResults && multiResults.length > 0) {
      const ids = multiResults.map((p) => p.id).filter(Boolean);
      if (ids.length > 0) {
        try {
          await apiGenerateReport(`4-Model Benchmark — ${formData.feedMaterial} (${formatTemp(tempInCelsius)})`, ids);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        } catch (err) {
          alert(err.message || 'Failed to save to database');
        }
      }
    } else if (result) {
      if (result.id) {
        try {
          await apiGenerateReport(`${activeModel?.name} Report — ${formData.feedMaterial} (${result.recommendedTime} min)`, [result.id]);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        } catch (err) {
          alert(err.message || 'Failed to save to database');
        }
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    }
  };

  const handleAddToComparison = () => {
    if (!isAuthenticated) {
      openAuthModal('/predict');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('lignin_comparison_ids') || '[]');
      if (multiResults && multiResults.length > 0) {
        multiResults.forEach((p) => {
          if (p.id && !existing.includes(p.id)) {
            existing.push(p.id);
          }
        });
        localStorage.setItem('lignin_comparison_ids', JSON.stringify(existing));
        alert('All 4 Model Predictions added to Comparison Studio!');
        navigate('/compare');
      } else if (result && result.id) {
        if (!existing.includes(result.id)) {
          existing.push(result.id);
          localStorage.setItem('lignin_comparison_ids', JSON.stringify(existing));
        }
        alert('Prediction added to Comparison! You can now compare it with other runs.');
        navigate('/compare');
      } else {
        navigate('/compare');
      }
    } catch {
      navigate('/compare');
    }
  };

  const activeModel = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  return (
    <div className="light-page-wrapper">
      <div className="predict-page" ref={resultsRef}>
      {/* Guest Mode Notice Banner (if not logged in) */}
      {!isAuthenticated && (
        <div className="login-required-banner">
          <div className="login-req-left">
            <div className="login-req-icon-box">
              <Zap size={18} color="#2D6A4F" />
            </div>
            <div>
              <h4 className="login-req-title">Guest Evaluation Mode Active</h4>
              <p className="login-req-desc">
                You can test neural predictions and explore charts. Sign in to export PDF/CSV dossiers, save reports, compare runs, and view history.
              </p>
            </div>
          </div>
          <div className="login-req-buttons">
            <Link
              to="/login"
              state={{ from: { pathname: '/predict' } }}
              className="login-req-btn primary"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              state={{ from: { pathname: '/predict' } }}
              className="login-req-btn secondary"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* TOP SECTION: Model Selector & Multi-Model Toggle */}
      <div className="model-selector-section">
        <div className="model-selector-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={18} />
            <span>1. Select Prediction Model Architecture</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Compare All 4 Models Toggle Button */}
            <button
              type="button"
              className={`compare-all-toggle-btn ${compareAllMode ? 'active' : ''}`}
              onClick={() => {
                setCompareAllMode((prev) => !prev);
                if (error) setError('');
              }}
              id="toggle-compare-all-models"
              title="Execute NODE, NODE Augmented, DNN, and TabNet simultaneously with one click"
            >
              <Sparkles size={16} className={compareAllMode ? 'sparkle-spin' : ''} />
              <span>Compare All 4 Models</span>
              <span className={`toggle-pill ${compareAllMode ? 'on' : 'off'}`}>
                {compareAllMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {!compareAllMode && activeModel ? (
              <span className="model-selected-pill">
                {activeModel.icon} {activeModel.name} Selected
              </span>
            ) : !compareAllMode ? (
              <span className="model-unselected-pill">
                * Please choose an ML model
              </span>
            ) : (
              <span className="model-selected-pill multi">
                ⚡ 4 Models Concurrent
              </span>
            )}
          </div>
        </div>

        <div className={`model-cards-row ${compareAllMode ? 'multi-mode-active' : ''}`}>
          {MODEL_OPTIONS.map((model) => (
            <button
              key={model.id}
              className={`model-card ${
                compareAllMode
                  ? 'model-card-multi-active'
                  : selectedModel === model.id
                  ? 'model-card-active'
                  : ''
              }`}
              onClick={() => {
                if (compareAllMode) {
                  setCompareAllMode(false);
                }
                setSelectedModel(model.id);
                if (error) setError('');
              }}
              id={`model-${model.id}`}
            >
              {(compareAllMode || selectedModel === model.id) && (
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

      {/* MIDDLE SECTION: Experimental Parameters Form (Full Width) */}
      <div className="parameters-container">
        <div className="panel-header">
          <h2 className="panel-heading">2. Experimental Parameters</h2>
        </div>

        {optionsLoading ? (
          <div className="options-loading">
            <Loader2 size={20} className="spin-icon" />
            <span>Loading chemical and biomass parameters...</span>
          </div>
        ) : (
          <>
            <div className="params-sections-grid">
              {/* Card 1: Biomass Feedstock & Composition */}
              <div className="params-card">
                <div className="params-card-header">
                  <Layers size={16} className="params-icon" />
                  <span>Biomass Feedstock & Composition</span>
                </div>

                <div className="form-group">
                  <label htmlFor="feed-material-select">Feedstock Material</label>
                  <select
                    id="feed-material-select"
                    name="feedMaterial"
                    value={formData.feedMaterial}
                    onChange={handleFeedMaterialChange}
                  >
                    {(options?.feed_materials || []).map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="composition-grid-2x2">
                  <div className="form-group">
                    <label htmlFor="cellulose-input">Cellulose (%)</label>
                    <input
                      id="cellulose-input"
                      type="number"
                      step="0.1"
                      name="cellulosePercent"
                      value={formData.cellulosePercent}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="hemicellulose-input">Hemicellulose (%)</label>
                    <input
                      id="hemicellulose-input"
                      type="number"
                      step="0.1"
                      name="hemicellulosePercent"
                      value={formData.hemicellulosePercent}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lignin-input">Lignin (%)</label>
                    <input
                      id="lignin-input"
                      type="number"
                      step="0.1"
                      name="ligninPercent"
                      value={formData.ligninPercent}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="size-input">Particle Size (mm)</label>
                    <input
                      id="size-input"
                      type="number"
                      step="0.01"
                      name="sizeMm"
                      value={formData.sizeMm}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Deep Eutectic Solvent (DES) */}
              <div className="params-card">
                <div className="params-card-header">
                  <Beaker size={16} className="params-icon" />
                  <span>Deep Eutectic Solvent (DES)</span>
                </div>

                <div className="form-group">
                  <label htmlFor="hba-select">Hydrogen Bond Acceptor (HBA)</label>
                  <select id="hba-select" name="hba" value={formData.hba} onChange={handleChange}>
                    {(options?.hba_compounds || []).map((c) => {
                      const label = c.name
                        ? (c.abbreviation && c.abbreviation !== c.name ? `${c.name} (${c.abbreviation})` : c.name)
                        : c.abbreviation;
                      return (
                        <option key={c.abbreviation} value={c.abbreviation}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hbd-select">Hydrogen Bond Donor (HBD)</label>
                  <select id="hbd-select" name="hbd" value={formData.hbd} onChange={handleChange}>
                    {(options?.hbd_compounds || []).map((c) => {
                      const label = c.name
                        ? (c.abbreviation && c.abbreviation !== c.name ? `${c.name} (${c.abbreviation})` : c.name)
                        : c.abbreviation;
                      return (
                        <option key={c.abbreviation} value={c.abbreviation}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hbd-hba-ratio-input">
                    HBD : HBA Molar Ratio
                    {options?.hbd_hba_ratio_range && (
                      <span className="param-hint"> ({options.hbd_hba_ratio_range.min} – {options.hbd_hba_ratio_range.max})</span>
                    )}
                  </label>
                  <input
                    id="hbd-hba-ratio-input"
                    type="number"
                    step="0.1"
                    name="hbdHbaRatio"
                    value={formData.hbdHbaRatio}
                    onChange={handleChange}
                    min={options?.hbd_hba_ratio_range?.min}
                    max={options?.hbd_hba_ratio_range?.max}
                  />
                </div>
              </div>

              {/* Card 3: Reaction Conditions */}
              <div className="params-card">
                <div className="params-card-header">
                  <Sliders size={16} className="params-icon" />
                  <span>Reaction Conditions</span>
                </div>

                <div className="form-group">
                  <label htmlFor="temperature-input">
                    Temperature ({tempSymbol})
                    <span className="param-hint">
                      {' '}
                      ({getTempRange(options?.temperature_range?.min ?? 60, options?.temperature_range?.max ?? 200).label})
                    </span>
                  </label>
                  <input
                    id="temperature-input"
                    type="number"
                    step={tempUnit === 'kelvin' ? '0.1' : '1'}
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    min={getTempRange(options?.temperature_range?.min ?? 60, options?.temperature_range?.max ?? 200).min}
                    max={getTempRange(options?.temperature_range?.min ?? 60, options?.temperature_range?.max ?? 200).max}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lsr-input">
                    Solid-to-Liquid Ratio (1:X)
                    {options?.liquid_solid_ratio_range && (
                      <span className="param-hint"> ({options.liquid_solid_ratio_range.min} – {options.liquid_solid_ratio_range.max})</span>
                    )}
                  </label>
                  <input
                    id="lsr-input"
                    type="number"
                    name="liquidSolidRatio"
                    value={formData.liquidSolidRatio}
                    onChange={handleChange}
                    min={options?.liquid_solid_ratio_range?.min}
                    max={options?.liquid_solid_ratio_range?.max}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time-range-input">Reaction Time Range (min)</label>
                  <input
                    id="time-range-input"
                    type="text"
                    name="timeRange"
                    value={formData.timeRange}
                    onChange={handleChange}
                    placeholder="10 – 180"
                  />
                </div>
              </div>
            </div>

            {/* Centered Large Predict Action */}
            <div className="predict-action-center">
              {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
              <button
                className={`predict-btn-main ${compareAllMode ? 'predict-btn-multi' : ''}`}
                onClick={handlePredict}
                disabled={isLoading || optionsLoading}
                id="run-prediction-submit-btn"
              >
                {compareAllMode ? (
                  <Sparkles size={20} className={isLoading ? 'spin-icon' : ''} />
                ) : (
                  <Zap size={20} className={isLoading ? 'spin-icon' : ''} />
                )}
                <span>
                  {isLoading
                    ? compareAllMode
                      ? 'Running Simultaneous 4-Model Benchmark...'
                      : `Running ${activeModel?.name || 'Model'} Inference...`
                    : compareAllMode
                    ? 'Run Simultaneous Benchmark (Compare All 4 Models)'
                    : activeModel
                    ? `Run Prediction with ${activeModel.name}`
                    : 'Select Model & Run Prediction'}
                </span>
                {!isLoading && <ArrowDownCircle size={18} style={{ opacity: 0.8 }} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* BOTTOM SECTION: Prediction Results & Charts (Revealed Below) */}
      <div ref={resultsRef} className="results-container" id="results-section">
        <div className="panel-header">
          <h2 className="panel-heading">
            {multiResults ? '3. Multi-Model Benchmark Analytics' : '3. Prediction Results & Analytics'}
          </h2>
        </div>

        {!result && !multiResults && !isLoading && (
          <div className="results-placeholder-bottom">
            <div className="results-placeholder-icon">
              <BarChart3 size={32} />
            </div>
            <h3>Ready for Prediction</h3>
            <p>
              Select an ML model or toggle <strong>Compare All 4 Models</strong> above, adjust experimental parameters, and click <strong>Run Prediction</strong>.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="results-placeholder-bottom loading-pulse">
            <div className="results-placeholder-icon" style={{ background: '#D8F3DC', borderColor: '#B7E4C7' }}>
              <Zap size={32} color="#2D6A4F" />
            </div>
            <h3>Simulating Extraction Kinetics...</h3>
            <p>
              {compareAllMode
                ? 'Executing simultaneous PyTorch neural inference across NODE, NODE Augmented, DNN, and TabNet...'
                : `Running neural network inference using ${activeModel?.name} across the specified reaction timeline.`}
            </p>
          </div>
        )}

        {/* Multi-Model Benchmark Suite View */}
        {multiResults && !isLoading && (
          <div className="results-content animate-fade-in">
            <MultiModelBenchmarkSuite
              multiResults={multiResults}
              formData={formData}
              ensembleYield={ensembleData?.ensembleYield}
              bestModelKey={ensembleData?.bestModel}
            />

            {/* Action Bar */}
            <div className="action-bar" style={{ marginTop: 24 }}>
              <button className="action-btn" onClick={handleDownloadPDF} title="Download printable Multi-Model PDF Dossier">
                <Download size={16} /> Export Multi-Model PDF Dossier
              </button>
              <button className="action-btn" onClick={handleDownloadCSV} title="Export All 4 Models CSV Data">
                <Download size={16} /> Export All Models CSV
              </button>
              <button
                className="action-btn"
                onClick={handleSaveToDatabase}
                style={savedSuccess ? { background: '#D8F3DC', borderColor: '#52B788', color: '#1B4332' } : {}}
              >
                {savedSuccess ? <Check size={16} /> : <FileText size={16} />}
                {savedSuccess ? 'Saved Benchmark Report!' : 'Save Benchmark to Reports'}
              </button>
              <button className="action-btn" onClick={handleAddToComparison}>
                <GitCompareArrows size={16} /> Open in Comparison Studio
              </button>
              <button
                className="action-btn"
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('/history');
                  } else {
                    navigate('/history');
                  }
                }}
              >
                <Clock size={16} /> View History
              </button>
            </div>
          </div>
        )}

        {/* Single-Model Results View */}
        {result && !multiResults && !isLoading && (
          <div className="results-content animate-fade-in">
            {/* Model Badge */}
            <div className="result-model-badge">
              <span className="result-model-icon">{activeModel?.icon}</span>
              <span>Predicted with <strong>{activeModel?.name}</strong> Architecture</span>
              <span className="result-model-accuracy">R² {activeModel?.r2} ({activeModel?.accuracy}% Benchmark Accuracy)</span>
            </div>

            {/* 3 Metric Cards */}
            <div className="metrics-row-3">
              <MetricCard label="Predicted Lignin Yield" value={result.ligninYield} unit=" %" color="#2D6A4F" />
              <MetricCard label="Optimal Reaction Time" value={result.recommendedTime} unit=" min" color="#1B7A5C" />
              <MetricCard label="Process Performance" value={result.performance} color={getPerformanceColor(result.performance)} />
            </div>

            {/* Confidence Bar */}
            <div className="confidence-wrapper">
              <ConfidenceBar value={result.confidence} />
            </div>

            {/* Multi-Chart Analytics & Kinetic Suite */}
            <PredictionChartsSuite
              result={result}
              formData={formData}
            />

            {/* Action Bar */}
            <div className="action-bar">
              <button className="action-btn" onClick={handleDownloadPDF} title="Download printable PDF Report">
                <Download size={16} /> Export PDF Report
              </button>
              <button className="action-btn" onClick={handleDownloadCSV} title="Export CSV Data & Kinetic Curve">
                <Download size={16} /> Export CSV
              </button>
              <button
                className="action-btn"
                onClick={handleSaveToDatabase}
                style={savedSuccess ? { background: '#D8F3DC', borderColor: '#52B788', color: '#1B4332' } : {}}
              >
                {savedSuccess ? <Check size={16} /> : <FileText size={16} />}
                {savedSuccess ? 'Saved to Reports!' : 'Save to Reports'}
              </button>
              <button className="action-btn" onClick={handleAddToComparison}>
                <GitCompareArrows size={16} /> Add to Comparison
              </button>
              <button
                className="action-btn"
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('/history');
                  } else {
                    navigate('/history');
                  }
                }}
              >
                <Clock size={16} /> View History
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
