import { FileText, Download, Share2, Trash2, Plus, Calendar, HardDrive } from 'lucide-react';
import './Reports.css';

const reports = [
  { id: 1, title: 'Miscanthus Analysis Report', date: 'May 28, 2026', format: 'PDF', size: '2.4 MB' },
  { id: 2, title: 'Rice Straw Comparison', date: 'May 27, 2026', format: 'PDF', size: '1.8 MB' },
  { id: 3, title: 'Weekly Summary Report', date: 'May 26, 2026', format: 'PDF', size: '3.1 MB' },
  { id: 4, title: 'Sugarcane Bagasse Deep Dive', date: 'May 25, 2026', format: 'CSV', size: '0.9 MB' },
];

export default function Reports() {
  return (
    <div className="reports-page animate-fade-in">
      <div className="reports-header">
        <div className="reports-header-text">
          <h1>Reports</h1>
          <p>Generate and export detailed prediction reports</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Generate New Report
        </button>
      </div>

      <div className="reports-grid">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-card-top">
              <div className="report-icon">
                <FileText size={20} />
              </div>
              <div className="report-info">
                <h3>{report.title}</h3>
                <div className="report-meta">
                  <span className="report-meta-item">
                    <Calendar size={12} /> {report.date}
                  </span>
                  <span className={`format-badge ${report.format.toLowerCase()}`}>
                    {report.format}
                  </span>
                  <span className="report-meta-item">
                    <HardDrive size={12} /> {report.size}
                  </span>
                </div>
              </div>
            </div>
            <div className="report-actions">
              <button className="report-action-btn">
                <Download size={13} /> Download
              </button>
              <button className="report-action-btn">
                <Share2 size={13} /> Share
              </button>
              <button className="report-action-btn">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
