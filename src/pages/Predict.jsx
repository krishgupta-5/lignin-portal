import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Download, FileText, GitCompareArrows, Clock, BarChart3 } from 'lucide-react';
import { plantOptions, chemicalOptions, simulatePrediction } from '../data/mockData';
import MetricCard from '../components/UI/MetricCard';
import ConfidenceBar from '../components/UI/ConfidenceBar';
import YieldTimeChart from '../components/Charts/YieldTimeChart';
import './Predict.css';

function getPerformanceColor(perf) {
  switch (perf) {
    case 'Better': return '#2D6A4F';
    case 'Good': return '#40916C';
    case 'Average': return '#E9A820';
    case 'Poor': return '#DC3545';
    default: return '#4A5568';
  }
}

export default function Predict() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = () => {
    setIsLoading(true);
    setResult(null);
    setTimeout(() => {
      const prediction = simulatePrediction(
        formData.plant,
        formData.chemical,
        String(formData.temperature),
        formData.timeRange,
        formData.ratio,
        String(formData.ph)
      );
      setResult(prediction);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="predict-page">
      <div className="predict-grid">
        {/* Left Panel */}
        <div className="input-panel animate-slide-left">
          <div className="panel-title">Input Parameters</div>

          <div className="form-group">
            <label htmlFor="plant-select">Plant</label>
            <select
              id="plant-select"
              name="plant"
              value={formData.plant}
              onChange={handleChange}
            >
              {plantOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="chemical-select">Chemical(s)</label>
            <select
              id="chemical-select"
              name="chemical"
              value={formData.chemical}
              onChange={handleChange}
            >
              {chemicalOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="params-subtitle">Process Parameters</div>
          <div className="params-grid">
            <div className="form-group">
              <label htmlFor="temperature-input">Temperature (°C)</label>
              <input
                id="temperature-input"
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="time-range-input">Time Range (min)</label>
              <input
                id="time-range-input"
                type="text"
                name="timeRange"
                value={formData.timeRange}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ratio-input">Solid to Liquid Ratio</label>
              <input
                id="ratio-input"
                type="text"
                name="ratio"
                value={formData.ratio}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ph-input">pH</label>
              <input
                id="ph-input"
                type="number"
                name="ph"
                step="0.1"
                value={formData.ph}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="predict-btn"
            onClick={handlePredict}
            disabled={isLoading}
          >
            <Zap size={18} />
            {isLoading ? 'Predicting...' : 'Predict'}
          </button>
        </div>

        {/* Right Panel */}
        <div className={`results-panel animate-slide-right${isLoading ? ' loading-pulse' : ''}`}>
          <div className="panel-title">Prediction Results</div>

          {!result && !isLoading && (
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
              <p>Running prediction model...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="animate-fade-in">
              <div className="metrics-row">
                <MetricCard
                  label="Predicted Lignin Yield"
                  value={result.ligninYield}
                  unit=" %"
                  color="#2D6A4F"
                />
                <MetricCard
                  label="Recommended Time"
                  value={result.recommendedTime}
                  unit=" min"
                  color="#1B7A5C"
                />
                <MetricCard
                  label="Performance"
                  value={result.performance}
                  color={getPerformanceColor(result.performance)}
                />
              </div>

              <ConfidenceBar value={result.confidence} />

              <YieldTimeChart
                data={result.yieldCurve}
                highlightTime={result.recommendedTime}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button className="action-btn">
          <Download size={16} /> Download Report
        </button>
        <button className="action-btn">
          <FileText size={16} /> Save Result
        </button>
        <button className="action-btn">
          <GitCompareArrows size={16} /> Add to Compare
        </button>
        <Link to="/history" className="action-btn">
          <Clock size={16} /> View History
        </Link>
      </div>
    </div>
  );
}
