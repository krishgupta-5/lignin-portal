import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> AI-Powered Research Tool
          </div>
          <h1 className="hero-title">
            AI-Powered Lignin<br />Extraction Predictor
          </h1>
          <p className="hero-subtitle">
            Predict lignin yield and recommended extraction time for any
            plant–chemical combination using advanced deep learning models.
          </p>
          <div className="hero-actions">
            <Link to="/predict" className="hero-btn-primary">
              Start Predicting <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="hero-btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <h2>What Can You Do?</h2>
          <p>Powerful tools for lignin extraction research and optimization</p>
        </div>
        <div className="features-grid">
          {[
            {
              icon: '🌱',
              title: 'Input Parameters',
              desc: 'Input any Plant, Chemical and Process Parameters for comprehensive analysis.',
              delay: 1,
            },
            {
              icon: '🧠',
              title: 'AI Predictions',
              desc: 'Deep Learning model predicts Lignin Yield (%) and Recommended Extraction Time.',
              delay: 2,
            },
            {
              icon: '⭐',
              title: 'Performance Rating',
              desc: 'Get performance rating: Better, Good, Average, or Poor for every prediction.',
              delay: 3,
            },
            {
              icon: '📊',
              title: 'Compare & Export',
              desc: 'Compare multiple combinations and export detailed reports for publication.',
              delay: 4,
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`feature-card delay-${f.delay} animate-fade-in-up`}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="how-content">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to predict lignin extraction outcomes</p>
          </div>
          <div className="steps-row">
            {[
              {
                num: 1,
                title: 'Enter Parameters',
                desc: 'Select plant type, chemical solvent, and set process conditions like temperature and pH.',
                delay: 1,
              },
              {
                num: 2,
                title: 'AI Processes',
                desc: 'Our deep learning model analyzes your inputs using trained patterns from historical extraction data.',
                delay: 2,
              },
              {
                num: 3,
                title: 'Get Results',
                desc: 'Receive predicted yield, recommended time, performance rating, and confidence score.',
                delay: 3,
              },
            ].map((s, i) => (
              <div key={i} className={`step-item delay-${s.delay} animate-fade-in-up`}>
                <div className="step-number">{s.num}</div>
                {i < 2 && <div className="step-connector" />}
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {[
            { number: '8+', label: 'Plants Supported', delay: 1 },
            { number: '7+', label: 'Chemical Solvents', delay: 2 },
            { number: '95%', label: 'Model Accuracy', delay: 3 },
            { number: '1000+', label: 'Predictions Made', delay: 4 },
          ].map((s, i) => (
            <div key={i} className={`stat-item delay-${s.delay} animate-fade-in-up`}>
              <div className="stat-number">{s.number}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
