import { useState } from 'react';
import { Search, Eye, GitCompareArrows } from 'lucide-react';
import { sampleHistory } from '../data/mockData';
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

  const filtered = sampleHistory.filter((item) => {
    const matchSearch =
      item.plant.toLowerCase().includes(search.toLowerCase()) ||
      item.chemical.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || item.performance === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="history-page animate-fade-in">
      <div className="history-header">
        <h1>Prediction History</h1>
        <p>View and manage your past prediction results</p>
      </div>

      <div className="history-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by plant or chemical..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="history-search"
          />
        </div>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
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
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.plant}</td>
                <td>{item.chemical}</td>
                <td className="yield-cell">{item.ligninYield}%</td>
                <td>{item.recommendedTime}</td>
                <td>
                  <span className={getBadgeClass(item.performance)}>
                    {item.performance}
                  </span>
                </td>
                <td>
                  <button className="history-action-btn" title="View details">
                    <Eye size={14} />
                  </button>
                  <button className="history-action-btn" title="Add to compare">
                    <GitCompareArrows size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#A0AEC0' }}>
                  No predictions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="history-count">
        Showing {filtered.length} of {sampleHistory.length} predictions
      </div>
    </div>
  );
}
