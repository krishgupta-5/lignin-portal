import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Eye, GitCompareArrows, Trash2, Download, FileText, Plus, CheckSquare, Square, X } from 'lucide-react';
import { apiGetHistory, apiDeletePrediction, apiGenerateReport, isAuthenticated } from '../services/api';
import { exportToCSV, exportToPrintablePDF } from '../utils/exportUtils';
import { usePreferences } from '../context/PreferencesContext';
import YieldTimeChart from '../components/Charts/YieldTimeChart';
import './History.css';

function getBadgeClass(perf) {
  switch (perf) {
    case 'Better': return 'badge badge-better';
    case 'Good': return 'badge badge-good';
    case 'Average': return 'badge badge-average';
    case 'Poor': return 'badge badge-poor';
    default: return 'badge';
  }
}

export default function History() {
  const { formatTemp, tempSymbol } = usePreferences();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [predictions, setPredictions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);
  const authenticated = isAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, [search, filter, page, authenticated]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (viewItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewItem]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (authenticated) {
        const data = await apiGetHistory(search, filter, page, 50);
        const normalized = (data.predictions || []).map((p) => ({
          id: p.id,
          date: p.created_at ? new Date(p.created_at).toLocaleString() : '',
          created_at: p.created_at,
          plant: p.plant,
          chemical: p.chemical,
          model: p.model || 'TabNet',
          ligninYield: p.lignin_yield ?? p.ligninYield,
          lignin_yield: p.lignin_yield ?? p.ligninYield,
          recommendedTime: p.recommended_time ?? p.recommendedTime,
          recommended_time: p.recommended_time ?? p.recommendedTime,
          performance: p.performance,
          confidence: p.confidence,
          yield_curve: p.yield_curve || [],
          yieldCurve: p.yield_curve || [],
          temperature: p.temperature,
          time_range: p.time_range,
        }));
        setPredictions(normalized);
        setTotal(data.total || normalized.length);
      } else {
        setPredictions([]);
        setTotal(0);
      }
    } catch {
      setPredictions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === predictions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(predictions.map((p) => p.id));
    }
  };

  const handleGenerateReportFromSelected = async () => {
    if (!selectedIds.length) {
      alert('Please select at least one prediction to generate a report.');
      return;
    }
    const title = prompt('Enter a title for this Report:', `Analysis Dossier (${selectedIds.length} Runs)`);
    if (!title) return;

    try {
      await apiGenerateReport(title, selectedIds);
      alert('Report successfully created and saved!');
      navigate('/reports');
    } catch (err) {
      alert(err.message || 'Failed to generate report');
    }
  };

  const handleExportCSVAll = () => {
    const itemsToExport = selectedIds.length
      ? predictions.filter((p) => selectedIds.includes(p.id))
      : predictions;

    if (!itemsToExport.length) {
      alert('No predictions to export.');
      return;
    }
    exportToCSV(itemsToExport, `lignin_predictions_history_${Date.now()}.csv`);
  };

  const handleExportPDFSelected = () => {
    const itemsToExport = selectedIds.length
      ? predictions.filter((p) => selectedIds.includes(p.id))
      : predictions;

    if (!itemsToExport.length) {
      alert('No predictions to export.');
      return;
    }
    exportToPrintablePDF(itemsToExport, `Selected Analysis (${itemsToExport.length} Runs)`);
  };

  const handleCompare = (id) => {
    try {
      const existing = JSON.parse(localStorage.getItem('lignin_comparison_ids') || '[]');
      if (!existing.includes(id)) {
        existing.push(id);
        localStorage.setItem('lignin_comparison_ids', JSON.stringify(existing));
      }
      navigate('/compare');
    } catch {
      navigate('/compare');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prediction record?')) return;
    try {
      await apiDeletePrediction(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      loadHistory();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="history-page animate-fade-in">
      <div className="history-header">
        <div>
          <h1>Prediction History</h1>
          <p>Explore, filter, export, and generate dossiers from your recorded prediction runs</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportCSVAll} title="Export current items to CSV">
            <Download size={15} /> Export CSV
          </button>
          {selectedIds.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={handleExportPDFSelected} title="Export selected runs to PDF dossier">
                <FileText size={15} /> Export PDF ({selectedIds.length})
              </button>
              <button className="btn btn-primary" onClick={handleGenerateReportFromSelected}>
                <FileText size={15} /> Generate Report ({selectedIds.length})
              </button>
            </>
          )}
        </div>
      </div>

      {!authenticated && (
        <div className="guest-banner" style={{ marginBottom: 20 }}>
          💡 <Link to="/login">Sign in</Link> to automatically store and manage your prediction history.
        </div>
      )}

      <div className="history-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by plant or chemical..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="history-search"
          />
        </div>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          id="history-filter"
        >
          <option value="All">All Performance</option>
          <option value="Better">Better</option>
          <option value="Good">Good</option>
          <option value="Average">Average</option>
          <option value="Poor">Poor</option>
        </select>
      </div>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={predictions.length > 0 && selectedIds.length === predictions.length}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>Date</th>
              <th>Feedstock</th>
              <th>Chemical System</th>
              <th>Model</th>
              <th>Yield (%)</th>
              <th>Time (min)</th>
              <th>Performance</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#A0AEC0' }}>Loading predictions...</td></tr>
            ) : predictions.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#A0AEC0' }}>No predictions found in history.</td></tr>
            ) : predictions.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <tr key={item.id} className={isSelected ? 'selected-row' : ''}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(item.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>{item.date}</td>
                  <td><strong style={{ textTransform: 'capitalize' }}>{item.plant?.replace(/_/g, ' ')}</strong></td>
                  <td><span style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>{item.chemical?.replace(/_/g, ' + ')}</span></td>
                  <td><span className="format-badge tabnet">{item.model}</span></td>
                  <td className="yield-cell">{item.ligninYield}%</td>
                  <td>{item.recommendedTime}</td>
                  <td><span className={getBadgeClass(item.performance)}>{item.performance}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="history-action-btn" title="View Details & Kinetic Curve" onClick={() => setViewItem(item)}>
                        <Eye size={14} />
                      </button>
                      <button className="history-action-btn" title="Export Printable PDF" onClick={() => exportToPrintablePDF(item, item.model)}>
                        <Download size={14} />
                      </button>
                      <button className="history-action-btn" title="Add to Comparison" onClick={() => handleCompare(item.id)}>
                        <GitCompareArrows size={14} />
                      </button>
                      {authenticated && (
                        <button className="history-action-btn" title="Delete Record" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="history-count">
        Showing {predictions.length} of {total} predictions
      </div>

      {/* Modal for Viewing Prediction Details & Kinetic Curve */}
      {viewItem &&
        createPortal(
          <div
            className="history-modal-backdrop"
            onClick={() => setViewItem(null)}
          >
            <div
              className="history-modal-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Header */}
              <div className="history-modal-header">
                <div className="history-modal-header-left">
                  <div className="history-modal-title-row">
                    <span className="history-modal-model-badge">
                      {viewItem.model || 'Model Prediction'}
                    </span>
                    <h3 className="history-modal-title">
                      {viewItem.plant ? viewItem.plant.replace(/_/g, ' ') : 'Prediction Run'}
                    </h3>
                  </div>
                  <div className="history-modal-subtitle">
                    <span>Solvent: {viewItem.chemical ? viewItem.chemical.replace(/_/g, ' + ') : 'DES'}</span>
                    {viewItem.date && (
                      <span className="history-modal-date-bullet">• {viewItem.date}</span>
                    )}
                  </div>
                </div>
                <button
                  className="history-modal-close-btn"
                  onClick={() => setViewItem(null)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="history-modal-body">
                <div className="history-modal-kpi-grid">
                  <div className="history-modal-kpi-card">
                    <div className="history-modal-kpi-label">Yield</div>
                    <div className="history-modal-kpi-val" style={{ color: '#2D6A4F' }}>
                      {viewItem.ligninYield}%
                    </div>
                  </div>
                  <div className="history-modal-kpi-card">
                    <div className="history-modal-kpi-label">Optimal Time</div>
                    <div className="history-modal-kpi-val" style={{ color: '#1B7A5C' }}>
                      {viewItem.recommendedTime} min
                    </div>
                  </div>
                  <div className="history-modal-kpi-card">
                    <div className="history-modal-kpi-label">Temperature</div>
                    <div className="history-modal-kpi-val" style={{ color: '#2D6A4F' }}>
                      {formatTemp(viewItem.temperature ?? 100)}
                    </div>
                  </div>
                  <div className="history-modal-kpi-card">
                    <div className="history-modal-kpi-label">Confidence</div>
                    <div className="history-modal-kpi-val" style={{ color: '#40916C' }}>
                      {viewItem.confidence}%
                    </div>
                  </div>
                </div>

                {(viewItem.yield_curve?.length > 0 || viewItem.yieldCurve?.length > 0) && (
                  <div className="history-modal-chart-box">
                    <YieldTimeChart
                      data={viewItem.yield_curve || viewItem.yieldCurve}
                      highlightTime={viewItem.recommendedTime ?? viewItem.recommended_time}
                    />
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="history-modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setViewItem(null)}
                >
                  Close
                </button>
                <div className="history-modal-footer-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => exportToCSV(viewItem, `prediction_${viewItem.id}.csv`)}
                  >
                    <Download size={14} /> Download CSV
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => exportToPrintablePDF(viewItem, viewItem.model)}
                  >
                    <FileText size={14} /> Printable Dossier
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
