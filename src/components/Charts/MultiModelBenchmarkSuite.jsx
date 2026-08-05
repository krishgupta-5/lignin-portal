import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Award,
  BarChart2,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import PredictionChartsSuite from './PredictionChartsSuite';
import './MultiModelBenchmarkSuite.css';

const MODEL_SPECS = {
  node_augmented: {
    name: 'NODE Augmented',
    code: 'NODE-Aug',
    icon: '⚡',
    color: '#2D6A4F',
    r2: '0.8335',
    accuracy: 83.4,
    type: 'Hybrid Tree-Neural with Molecular Descriptors',
  },
  node: {
    name: 'NODE',
    code: 'NODE',
    icon: '🌳',
    color: '#0284C7',
    r2: '0.8726',
    accuracy: 87.3,
    type: 'Neural Oblivious Decision Ensembles',
  },
  dnn: {
    name: 'DNN',
    code: 'DNN',
    icon: '🔗',
    color: '#8B5CF6',
    r2: '0.8350',
    accuracy: 83.5,
    type: 'Deep Multi-Layer Perceptron',
  },
  tabnet: {
    name: 'TabNet',
    code: 'TabNet',
    icon: '🧠',
    color: '#F59E0B',
    r2: '0.7256',
    accuracy: 72.6,
    type: 'Attentive Tabular Learning',
  },
};

function getPerformanceBadgeClass(perf) {
  switch (perf) {
    case 'Better': return 'badge-better';
    case 'Good': return 'badge-good';
    case 'Average': return 'badge-average';
    case 'Poor': return 'badge-poor';
    default: return 'badge-good';
  }
}

export default function MultiModelBenchmarkSuite({
  multiResults,
  formData,
  ensembleYield,
  bestModelKey,
}) {
  // Active model selected for deep-dive single chart suite
  const [activeInspectModel, setActiveInspectModel] = useState(bestModelKey || 'node_augmented');

  // Find the selected prediction object for deep-dive
  const activePrediction = useMemo(() => {
    return multiResults.find((p) => p.model === activeInspectModel) || multiResults[0];
  }, [multiResults, activeInspectModel]);

  // Combine kinetic yield curves across all 4 models into a synchronized time-series array
  const combinedKineticData = useMemo(() => {
    if (!multiResults || multiResults.length === 0) return [];

    // Collect all unique time steps across all models
    const timeMap = new Map();

    multiResults.forEach((modelRes) => {
      const mKey = modelRes.model;
      (modelRes.yieldCurve || []).forEach((pt) => {
        const t = Number(pt.time);
        if (!timeMap.has(t)) {
          timeMap.set(t, { time: t, timeLabel: `${t} min` });
        }
        const entry = timeMap.get(t);
        entry[mKey] = Number(pt.yield ?? pt.yield_value ?? 0);
      });
    });

    return Array.from(timeMap.values()).sort((a, b) => a.time - b.time);
  }, [multiResults]);

  // Best performing model prediction
  const bestPrediction = useMemo(() => {
    return multiResults.find((p) => p.model === bestModelKey) || multiResults[0];
  }, [multiResults, bestModelKey]);

  // Calculate yield spread & standard deviation
  const stats = useMemo(() => {
    const yields = multiResults.map((p) => p.ligninYield);
    if (yields.length === 0) return { mean: 0, min: 0, max: 0, spread: 0, stdDev: 0 };
    const min = Math.min(...yields);
    const max = Math.max(...yields);
    const mean = Number((yields.reduce((a, b) => a + b, 0) / yields.length).toFixed(1));
    const variance = yields.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / yields.length;
    const stdDev = Number(Math.sqrt(variance).toFixed(1));
    return { mean, min, max, spread: Number((max - min).toFixed(1)), stdDev };
  }, [multiResults]);

  return (
    <div className="multimodel-benchmark-suite">
      {/* SECTION 1: Benchmark Overview & Ensemble Stats */}
      <div className="multimodel-header-banner">
        <div className="multimodel-header-left">
          <div className="multimodel-icon-pill">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="multimodel-eyebrow">Simultaneous 4-Model Neural Benchmark</div>
            <h3 className="multimodel-title">Cross-Model Prediction Analysis</h3>
          </div>
        </div>

        <div className="multimodel-stats-chips">
          <div className="mstat-chip">
            <span className="mstat-label">Ensemble Mean Yield</span>
            <span className="mstat-val">{stats.mean}%</span>
          </div>
          <div className="mstat-chip">
            <span className="mstat-label">Top Yield Model</span>
            <span className="mstat-val highlight">{MODEL_SPECS[bestModelKey]?.name || bestModelKey} ({bestPrediction?.ligninYield}%)</span>
          </div>
          <div className="mstat-chip">
            <span className="mstat-label">Model Spread (Δ)</span>
            <span className="mstat-val">±{stats.stdDev}%</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: 4 Side-by-Side Model Cards */}
      <div className="multimodel-cards-grid">
        {multiResults.map((pred) => {
          const spec = MODEL_SPECS[pred.model] || {
            name: pred.model,
            icon: '⚡',
            color: '#2D6A4F',
            r2: '0.80',
            accuracy: 80,
            type: 'Neural Network',
          };
          const isSelected = activeInspectModel === pred.model;
          const isTop = pred.model === bestModelKey;
          const deltaFromMean = Number((pred.ligninYield - stats.mean).toFixed(1));

          return (
            <div
              key={pred.model}
              className={`mmodel-card ${isSelected ? 'mmodel-card-active' : ''} ${isTop ? 'mmodel-card-top' : ''}`}
              onClick={() => setActiveInspectModel(pred.model)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveInspectModel(pred.model)}
            >
              {isTop && (
                <div className="top-model-ribbon">
                  <Award size={12} /> Top Yield
                </div>
              )}

              <div className="mmodel-card-top-row">
                <div className="mmodel-badge" style={{ backgroundColor: `${spec.color}15`, color: spec.color }}>
                  <span className="mmodel-icon">{spec.icon}</span>
                  <span className="mmodel-name">{spec.name}</span>
                </div>
                <span className={`mmodel-perf-pill ${getPerformanceBadgeClass(pred.performance)}`}>
                  {pred.performance}
                </span>
              </div>

              <div className="mmodel-yield-display">
                <div className="mmodel-yield-num" style={{ color: spec.color }}>
                  {pred.ligninYield}
                  <span className="mmodel-yield-unit">%</span>
                </div>
                <div className="mmodel-yield-sub">
                  Predicted Yield
                  <span className={`mmodel-delta ${deltaFromMean >= 0 ? 'pos' : 'neg'}`}>
                    {deltaFromMean >= 0 ? `+${deltaFromMean}%` : `${deltaFromMean}%`} vs mean
                  </span>
                </div>
              </div>

              <div className="mmodel-specs-list">
                <div className="mmodel-spec-item">
                  <span className="spec-k">Optimal Time:</span>
                  <span className="spec-v">{pred.recommendedTime} min</span>
                </div>
                <div className="mmodel-spec-item">
                  <span className="spec-k">Model Confidence:</span>
                  <span className="spec-v">{pred.confidence}%</span>
                </div>
                <div className="mmodel-spec-item">
                  <span className="spec-k">Cross-Validation R²:</span>
                  <span className="spec-v">{spec.r2} ({spec.accuracy}%)</span>
                </div>
              </div>

              <div className="mmodel-card-footer">
                <button
                  type="button"
                  className="mmodel-inspect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInspectModel(pred.model);
                  }}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 size={14} color={spec.color} />
                      <span>Inspecting Below</span>
                    </>
                  ) : (
                    <>
                      <span>Inspect Deep Dive</span>
                      <ArrowUpRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 3: Multi-Model Kinetic Overlay Curve */}
      <div className="multimodel-chart-card">
        <div className="multimodel-chart-header">
          <div>
            <h4 className="chart-card-title">
              <TrendingUp size={18} className="chart-title-icon" />
              Comparative Multi-Model Kinetic Dissolution Curves
            </h4>
            <p className="chart-card-subtitle">
              Simultaneous 0–180 min reaction trajectory overlay across all 4 deep learning architectures
            </p>
          </div>

          <div className="chart-legend-custom">
            {multiResults.map((p) => {
              const spec = MODEL_SPECS[p.model];
              return (
                <div key={p.model} className="legend-chip">
                  <span className="legend-chip-dot" style={{ backgroundColor: spec?.color }} />
                  <span className="legend-chip-name">{spec?.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="multimodel-chart-body">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart
              data={combinedKineticData}
              margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.6)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                tickLine={{ stroke: '#CBD5E1' }}
                axisLine={{ stroke: '#94A3B8' }}
                unit=" min"
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                tickLine={{ stroke: '#CBD5E1' }}
                axisLine={{ stroke: '#94A3B8' }}
                domain={['auto', 'auto']}
                unit="%"
              />
              <Tooltip content={<CustomMultiModelTooltip />} />

              <ReferenceLine
                y={stats.mean}
                stroke="#64748B"
                strokeDasharray="4 4"
                label={{
                  value: `Mean ${stats.mean}%`,
                  fill: '#64748B',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />

              {multiResults.map((p) => {
                const spec = MODEL_SPECS[p.model];
                const isSelected = activeInspectModel === p.model;
                return (
                  <Line
                    key={p.model}
                    type="monotone"
                    dataKey={p.model}
                    name={spec?.name || p.model}
                    stroke={spec?.color || '#2D6A4F'}
                    strokeWidth={isSelected ? 3.5 : 2.2}
                    dot={{ r: isSelected ? 3.5 : 2, fill: spec?.color }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#FFFFFF' }}
                    opacity={isSelected ? 1 : 0.8}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 4: Cross-Model Comparison Matrix Table */}
      <div className="multimodel-table-card">
        <div className="table-card-header">
          <h4 className="chart-card-title">
            <BarChart2 size={18} className="chart-title-icon" />
            Model Architecture & Variance Benchmark Table
          </h4>
          <span className="table-badge">Feedstock: {formData.feedMaterial} &bull; Solvent: {formData.hba} + {formData.hbd}</span>
        </div>

        <div className="table-responsive">
          <table className="benchmark-matrix-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Type & Structure</th>
                <th>Blind R² Accuracy</th>
                <th>Predicted Yield</th>
                <th>Ensemble Δ</th>
                <th>Optimal Time</th>
                <th>Confidence</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {multiResults.map((p) => {
                const spec = MODEL_SPECS[p.model];
                const delta = Number((p.ligninYield - stats.mean).toFixed(1));
                const isSelected = activeInspectModel === p.model;

                return (
                  <tr
                    key={p.model}
                    className={isSelected ? 'row-selected' : ''}
                    onClick={() => setActiveInspectModel(p.model)}
                  >
                    <td>
                      <div className="table-model-cell">
                        <span className="table-model-icon">{spec?.icon}</span>
                        <div>
                          <strong>{spec?.name}</strong>
                          {p.model === bestModelKey && <span className="table-top-tag">Top</span>}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{spec?.type}</td>
                    <td>
                      <span className="r2-pill">R² {spec?.r2}</span>
                    </td>
                    <td>
                      <span className="table-yield-val" style={{ color: spec?.color }}>
                        {p.ligninYield}%
                      </span>
                    </td>
                    <td>
                      <span className={`table-delta-pill ${delta >= 0 ? 'pos' : 'neg'}`}>
                        {delta >= 0 ? `+${delta}%` : `${delta}%`}
                      </span>
                    </td>
                    <td>{p.recommendedTime} min</td>
                    <td>{p.confidence}%</td>
                    <td>
                      <span className={`mmodel-perf-pill ${getPerformanceBadgeClass(p.performance)}`}>
                        {p.performance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: Individual Deep-Dive Model Tabs */}
      <div className="multimodel-deepdive-section">
        <div className="deepdive-header">
          <div className="deepdive-title-wrap">
            <Layers size={18} className="chart-title-icon" />
            <h4 className="chart-card-title">
              Granular Analytics Suite for <strong>{MODEL_SPECS[activeInspectModel]?.name}</strong>
            </h4>
          </div>

          <div className="deepdive-tabs">
            {multiResults.map((p) => {
              const spec = MODEL_SPECS[p.model];
              const isSelected = activeInspectModel === p.model;
              return (
                <button
                  key={p.model}
                  type="button"
                  className={`deepdive-tab-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setActiveInspectModel(p.model)}
                  style={isSelected ? { borderColor: spec?.color, color: spec?.color } : {}}
                >
                  <span>{spec?.icon}</span>
                  <span>{spec?.name}</span>
                  <span className="tab-yield">{p.ligninYield}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Render Single Model 4-Chart Analytical Suite */}
        {activePrediction && (
          <div className="deepdive-charts-wrapper animate-fade-in">
            <PredictionChartsSuite
              result={activePrediction}
              formData={formData}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Tooltip for Multi-Model Overlay Line Chart
function CustomMultiModelTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="multimodel-tooltip">
      <div className="tooltip-header">
        <span>⏱️ Reaction Time: <strong>{label} min</strong></span>
      </div>
      <div className="tooltip-items">
        {payload.map((item) => {
          const spec = MODEL_SPECS[item.dataKey] || { name: item.name, color: item.color };
          return (
            <div key={item.dataKey} className="tooltip-row">
              <div className="tooltip-label">
                <span className="tooltip-color-dot" style={{ backgroundColor: spec.color }} />
                <span>{spec.name}:</span>
              </div>
              <span className="tooltip-val" style={{ color: spec.color }}>
                {Number(item.value).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
