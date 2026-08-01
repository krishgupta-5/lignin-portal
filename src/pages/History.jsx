import { useState, useEffect } from 'react';
import { Search, Eye, GitCompareArrows, Trash2 } from 'lucide-react';
import { sampleHistory } from '../data/mockData';
import { apiGetHistory, apiDeletePrediction, isAuthenticated } from '../services/api';
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const authenticated = isAuthenticated();

  useEffect(() => {
    loadHistory();
  }, [search, filter, page]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (authenticated) {
        const data = await apiGetHistory(search, filter, page, 20);
        // Normalize keys
        const normalized = (data.predictions || []).map((p) => ({
          id: p.id,
          date: p.created_at ? new Date(p.created_at).toLocaleString() : '',
          plant: p.plant,
          chemical: p.chemical,
          ligninYield: p.lignin_yield ?? p.ligninYield,
          recommendedTime: p.recommended_time ?? p.recommendedTime,
          performance: p.performance,
          confidence: p.confidence,
        }));
        setPredictions(normalized);
        setTotal(data.total || normalized.length);
      } else {
        // Use sample data for guests
        let filtered = [...sampleHistory];
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter((i) => i.plant.toLowerCase().includes(s) || i.chemical.toLowerCase().includes(s));
        }
        if (filter !== 'All') {
          filtered = filtered.filter((i) => i.performance === filter);
        }
        setPredictions(filtered);
        setTotal(filtered.length);
      }
    } catch {
      // Fallback to sample data on error
      setPredictions(sampleHistory);
      setTotal(sampleHistory.length);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prediction?')) return;
    try {
      await apiDeletePrediction(id);
      loadHistory();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="history-page animate-fade-in">
      <div className="history-header">
        <h1>Prediction History</h1>
        <p>View and manage your past prediction results</p>
      </div>

      <div className="history-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input type="text" placeholder="Search by plant or chemical..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} id="history-search" />
        </div>
        <select className="filter-select" value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }} id="history-filter">
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
              <th>Date</th>
              <th>Plant</th>
              <th>Chemical</th>
              <th>Yield (%)</th>
              <th>Time (min)</th>
              <th>Performance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#A0AEC0' }}>Loading...</td></tr>
            ) : predictions.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#A0AEC0' }}>No predictions found.</td></tr>
            ) : predictions.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.plant}</td>
                <td>{item.chemical}</td>
                <td className="yield-cell">{item.ligninYield}%</td>
                <td>{item.recommendedTime}</td>
                <td><span className={getBadgeClass(item.performance)}>{item.performance}</span></td>
                <td>
                  <button className="history-action-btn" title="View"><Eye size={14} /></button>
                  <button className="history-action-btn" title="Compare"><GitCompareArrows size={14} /></button>
                  {authenticated && (
                    <button className="history-action-btn" title="Delete" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="history-count">
        Showing {predictions.length} of {total} predictions
      </div>
    </div>
  );
}
