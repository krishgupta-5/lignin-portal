import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2026 AI-Powered Lignin Extraction Predictor. Built for research purposes.</p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <span className="footer-dot">•</span>
          <Link to="/about">About</Link>
          <span className="footer-dot">•</span>
          <Link to="/predict">Predict</Link>
        </div>
      </div>
    </footer>
  );
}
