import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Download, GitCompareArrows, CheckSquare, Square, Search,
  Trash2, Plus, Sparkles, Filter, RefreshCw, FileText
} from 'lucide-react';
import { apiGetHistory, isAuthenticated } from '../services/api';
import { exportToCSV, exportToPrintablePDF } from '../utils/exportUtils';
import { usePreferences } from '../context/PreferencesContext';
import './Compare.css';

const COLORS = ['#2D6A4F', '#3182CE', '#D97706', '#8B5CF6'];

export default function Compare() {
  const { formatTemp, tempSymbol } = usePreferences();
  const [predictions, setPredictions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModel, setFilterModel] = useState('All');
  const authenticated = isAuthenticated();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (authenticated) {
          const res = await apiGetHistory('', 'All', 1, 100);
          const list = (res.predictions || []).map((p) => ({
            id: p.id,
            plant: p.plant,
            chemical: p.chemical,
            model: p.model || 'NODE Augmented',
            temperature: p.temperature,
            ph: p.ph,
            ratio: p.ratio || '1:20',
            time_range: p.time_range || '10 - 180',
            lignin_yield: Number(p.lignin_yield ?? p.ligninYield ?? 0),
            recommended_time: Number(p.recommended_time ?? p.recommendedTime ?? 90),
            performance: p.performance || 'Good',
            confidence: Number(p.confidence ?? 85),
            yield_curve: p.yield_curve || p.yieldCurve || [],
            created_at: p.created_at,
          }));
          setPredictions(list);

          // Check if user specifically selected runs from Predict page / History
          try {
            const savedIds = JSON.parse(localStorage.getItem('lignin_comparison_ids') || '[]');
            if (savedIds.length > 0) {
              const matched = list.filter((item) => savedIds.includes(item.id));
              if (matched.length > 0) {
                setSelected(matched.slice(0, 4));
                return;
              }
            }
          } catch {
            // fallback
          }

          setSelected(list.slice(0, 4));
        } else {
          setPredictions([]);
          setSelected([]);
        }
      } catch {
        setPredictions([]);
        setSelected([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [authenticated]);

  // Filtered list for the run picker table
  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      const matchSearch =
        search === '' ||
        p.plant.toLowerCase().includes(search.toLowerCase()) ||
        p.chemical.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase());
      const matchModel =
        filterModel === 'All' ||
        p.model.toLowerCase().replace(/_/g, '') === filterModel.toLowerCase().replace(/_/g, '');
      return matchSearch && matchModel;
    });
  }, [predictions, search, filterModel]);

  // Merge yield curves for overlay chart
  const chartData = useMemo(() => {
    if (!selected.length) return [];

    const times = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
    return times.map((t) => {
      const point = { time: t };
      selected.forEach((item, idx) => {
        const curve = item.yield_curve || [];
        const match = curve.find((c) => Number(c.time) === t);
        point[`yield${idx}`] = match ? Number(match.yield_value ?? match.yield ?? 0) : 0;
      });
      return point;
    });
  }, [selected]);

  const toggleSelect = (item) => {
    if (selected.some((s) => s.id === item.id)) {
      const updated = selected.filter((s) => s.id !== item.id);
      setSelected(updated);
      updateSavedIds(updated);
    } else {
      if (selected.length >= 4) {
        alert('You can compare up to 4 predictions simultaneously. Please uncheck a run first.');
        return;
      }
      const updated = [...selected, item];
      setSelected(updated);
      updateSavedIds(updated);
    }
  };

  const updateSavedIds = (items) => {
    try {
      localStorage.setItem('lignin_comparison_ids', JSON.stringify(items.map((i) => i.id)));
    } catch {
      // ignore
    }
  };

  const handleExportPDF = () => {
    if (!selected.length) return;
    exportToPrintablePDF(selected, `Comparison Benchmark Dossier (${selected.length} Runs)`);
  };

  const handleExportCSV = () => {
    if (!selected.length) return;
    exportToCSV(selected, `lignin_comparison_matrix_${Date.now()}.csv`);
  };

  const handleClear = () => {
    setSelected([]);
    updateSavedIds([]);
  };

  return (
    <div className="compare-page animate-fade-in">
      {/* Top Header */}
      <div className="compare-header-card">
        <div className="compare-header-text">
          <div className="compare-badge">
            <Sparkles size={14} /> Multi-Model Comparison Studio
          </div>
          <h1>Cross-Run & Model Benchmark</h1>
          <p>Superimpose dynamic kinetic curves, compare process parameters, and analyze model yield variance side-by-side.</p>
        </div>

        {selected.length > 0 && (
          <div className="compare-header-actions">
            <button onClick={handleExportPDF} className="btn btn-primary btn-sm" title="Export printable PDF report">
              <Download size={15} /> Export PDF Dossier
            </button>
            <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" title="Export CSV matrix">
              <FileText size={15} /> Export CSV
            </button>
            <button onClick={handleClear} className="btn btn-outline btn-sm" title="Clear active comparisons">
              <RefreshCw size={14} /> Clear ({selected.length})
            </button>
          </div>
        )}
      </div>

      {!authenticated && (
        <div className="guest-banner" style={{ marginBottom: 24 }}>
          💡 <Link to="/login">Sign in</Link> to save, search, and compare all your historical prediction runs.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#A0AEC0' }}>Loading predictions...</div>
      ) : predictions.length === 0 ? (
        <div className="compare-empty-state">
          <GitCompareArrows size={48} style={{ color: '#A0AEC0', marginBottom: 16 }} />
          <h3>No Predictions Available to Compare</h3>
          <p style={{ color: '#718096', marginBottom: 20 }}>
            Execute predictions or multi-model runs on the Predict page to compare kinetic dissolution dynamics across feedstocks and models.
          </p>
          <Link to="/predict" className="btn btn-primary">
            Run a Prediction
          </Link>
        </div>
      ) : (
        <>
          {/* Active Comparison Status Bar */}
          <div className="compare-status-bar">
            <div className="compare-status-left">
              <strong>Comparing {selected.length} of {predictions.length} Runs</strong>
              <span className="compare-limit-tag">(Max 4 simultaneous runs)</span>
            </div>
            <div className="compare-status-tags">
              {selected.map((item, idx) => (
                <span
                  key={item.id}
                  className="compare-active-pill"
                  style={{ borderLeftColor: COLORS[idx % COLORS.length] }}
                >
                  <span className="pill-dot" style={{ background: COLORS[idx % COLORS.length] }} />
                  {item.plant} • {item.model}
                  <button onClick={() => toggleSelect(item)} className="pill-remove-btn" title="Remove">×</button>
                </span>
              ))}
            </div>
          </div>

          {selected.length === 0 ? (
            <div className="compare-no-selection-banner">
              <p>👉 Select up to 4 runs from the table below to view side-by-side comparison cards and superimposed kinetic curves.</p>
            </div>
          ) : (
            <>
              {/* Side-by-Side Comparison Cards Grid */}
              <div className="compare-cards" style={{ gridTemplateColumns: `repeat(${Math.min(selected.length, 4)}, minmax(260px, 1fr))` }}>
                {selected.map((item, idx) => (
                  <div key={item.id} className="compare-card">
                    <div
                      className="compare-card-header"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]}, ${COLORS[idx % COLORS.length]}dd)`,
                      }}
                    >
                      <div className="compare-card-plant">{item.plant}</div>
                      <div className="compare-card-sub">{item.model}</div>
                    </div>
                    <div className="compare-card-body">
                      <div className="compare-row">
                        <span className="compare-row-label">Solvent (DES)</span>
                        <span className="compare-row-value text-truncate">{item.chemical}</span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-row-label">Temperature</span>
                        <span className="compare-row-value">{formatTemp(item.temperature)}</span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-row-label">pH / Ratio</span>
                        <span className="compare-row-value">{item.ph} • {item.ratio}</span>
                      </div>
                      <div className="compare-row highlight-row">
                        <span className="compare-row-label">Predicted Yield</span>
                        <span className="compare-row-value highlight">{item.lignin_yield.toFixed(1)}%</span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-row-label">Optimal Time</span>
                        <span className="compare-row-value">{item.recommended_time} min</span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-row-label">Performance</span>
                        <span className={`badge badge-${(item.performance || 'good').toLowerCase()}`}>
                          {item.performance}
                        </span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-row-label">Confidence</span>
                        <span className="compare-row-value">{item.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Superimposed Kinetic Curve Overlay */}
              <div className="compare-chart-section">
                <div className="compare-chart-title-row">
                  <div>
                    <h3 className="compare-chart-title">Comparative Kinetic Dissolution Trajectories</h3>
                    <p className="compare-chart-desc">Simulated extraction curve comparison across all {selected.length} selected runs (0 – 180 min).</p>
                  </div>
                </div>
                <div className="compare-chart-container">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 25, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: '#718096' }}
                        label={{ value: 'Reaction Time (min)', position: 'insideBottomRight', offset: -5, style: { fontSize: 11, fill: '#718096' } }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#718096' }}
                        label={{ value: 'Lignin Yield (%)', angle: -90, position: 'insideLeft', offset: 12, style: { fontSize: 11, fill: '#718096' } }}
                      />
                      <Tooltip
                        contentStyle={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(val, name) => [`${Number(val).toFixed(1)}%`, name]}
                      />
                      <Legend verticalAlign="top" height={36} />
                      {selected.map((item, idx) => (
                        <Area
                          key={item.id}
                          type="monotone"
                          dataKey={`yield${idx}`}
                          name={`${item.plant} (${item.model})`}
                          stroke={COLORS[idx % COLORS.length]}
                          fill={COLORS[idx % COLORS.length]}
                          fillOpacity={0.07}
                          strokeWidth={2.5}
                          dot={{ r: 2 }}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Interactive Run Selection Table */}
          <div className="compare-picker-card">
            <div className="compare-picker-header">
              <div>
                <h3>Select Predictions from History</h3>
                <p>Toggle checkboxes to add or remove runs from active comparison (Select 2 to 4 runs)</p>
              </div>

              <div className="compare-picker-filters">
                <div className="compare-search-input">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search plant, solvent, model..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="compare-table-wrapper">
              <table className="compare-picker-table">
                <thead>
                  <tr>
                    <th style={{ width: 45 }}>Select</th>
                    <th>Plant Feedstock</th>
                    <th>Chemical Solvent</th>
                    <th>Model Architecture</th>
                    <th>Temp ({tempSymbol})</th>
                    <th>Lignin Yield</th>
                    <th>Rec. Time</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredictions.map((p) => {
                    const isChecked = selected.some((s) => s.id === p.id);
                    const selectedIdx = selected.findIndex((s) => s.id === p.id);
                    return (
                      <tr
                        key={p.id}
                        onClick={() => toggleSelect(p)}
                        className={`picker-row ${isChecked ? 'row-selected' : ''}`}
                      >
                        <td className="checkbox-cell">
                          {isChecked ? (
                            <div className="selected-badge-num" style={{ background: COLORS[selectedIdx % COLORS.length] }}>
                              {selectedIdx + 1}
                            </div>
                          ) : (
                            <Square size={18} className="checkbox-empty" />
                          )}
                        </td>
                        <td className="fw-semibold">{p.plant}</td>
                        <td className="text-truncate" style={{ maxWidth: 220 }}>{p.chemical}</td>
                        <td>
                          <span className="model-chip">{p.model}</span>
                        </td>
                        <td>{formatTemp(p.temperature)}</td>
                        <td className="yield-cell">{p.lignin_yield.toFixed(1)}%</td>
                        <td>{p.recommended_time} min</td>
                        <td>
                          <span className={`badge badge-${(p.performance || 'good').toLowerCase()}`}>
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
        </>
      )}
    </div>
  );
}
