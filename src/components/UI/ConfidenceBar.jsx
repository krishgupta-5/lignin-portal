import './ConfidenceBar.css';

export default function ConfidenceBar({ value = 0, label = 'Confidence' }) {
  return (
    <div className="confidence-bar-wrapper">
      <div className="confidence-header">
        <span className="confidence-label">{label}</span>
        <span className="confidence-value">{value} %</span>
      </div>
      <div className="confidence-track">
        <div className="confidence-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
