import './About.css';

export default function About() {
  return (
    <div className="about-page animate-fade-in">
      <section className="about-hero">
        <h1>About This Project</h1>
        <p>
          AI-Powered Lignin Extraction Predictor — A capstone research project
          combining deep learning with green chemistry.
        </p>
      </section>

      <div className="about-content">
        {/* Overview */}
        <section className="about-section">
          <h2>Project Overview</h2>
          <p>
            This web application predicts lignin extraction efficiency and the
            recommended extraction time for any plant–chemical combination under
            given process conditions. Using a trained deep learning model, the system
            analyzes inputs such as plant type, chemical solvent, temperature, pH, and
            solid-to-liquid ratio to deliver accurate yield predictions with confidence
            scores and performance ratings.
          </p>
          <p style={{ marginTop: 12 }}>
            The project was built as part of a capstone program, aiming to bridge the
            gap between laboratory experimentation and digital predictive tools for
            sustainable biomass processing.
          </p>
        </section>

        {/* System Architecture */}
        <section className="about-section">
          <h2>System Architecture</h2>
          <div className="arch-flow">
            <div className="arch-card">
              <div className="arch-card-title">👥 Users</div>
              <div className="arch-card-tech">Researchers / Scientists</div>
              <ul>
                <li>Interact through web browser</li>
                <li>Input parameters</li>
                <li>View predictions</li>
              </ul>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-card">
              <div className="arch-card-title">🖥️ Frontend</div>
              <div className="arch-card-tech">React.js</div>
              <ul>
                <li>Input forms</li>
                <li>Results visualization</li>
                <li>History &amp; comparison</li>
                <li>Export reports</li>
              </ul>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-card">
              <div className="arch-card-title">⚙️ Backend</div>
              <div className="arch-card-tech">Python – FastAPI</div>
              <ul>
                <li>RESTful API endpoints</li>
                <li>Input validation</li>
                <li>Business logic</li>
                <li>Model inference</li>
              </ul>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-card">
              <div className="arch-card-title">🧠 ML Model</div>
              <div className="arch-card-tech">Deep Learning</div>
              <ul>
                <li>Trained DL model</li>
                <li>Predicts lignin yield</li>
                <li>Recommends time</li>
                <li>Performance rating</li>
              </ul>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-card">
              <div className="arch-card-title">🗄️ Database</div>
              <div className="arch-card-tech">Cloud Data Store</div>
              <ul>
                <li>Users &amp; inputs</li>
                <li>Predictions</li>
                <li>Model logs</li>
                <li>Comparisons</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            {[
              { icon: '⚛️', title: 'React.js', desc: 'Modern frontend framework for building interactive user interfaces' },
              { icon: '⚡', title: 'FastAPI', desc: 'High-performance Python backend with automatic API documentation' },
              { icon: '🧠', title: 'TensorFlow / PyTorch', desc: 'Deep learning frameworks for training the prediction model' },
              { icon: '🗄️', title: 'Cloud Database', desc: 'High-performance cloud storage for seamless research data persistence' },
              { icon: '☁️', title: 'Cloud Storage', desc: 'Storage for reports, exports, and model artifacts' },
              { icon: '📊', title: 'Recharts', desc: 'React charting library for yield curve visualization' },
            ].map((tech, idx) => (
              <div key={idx} className="tech-card">
                <div className="tech-card-icon">{tech.icon}</div>
                <h4>{tech.title}</h4>
                <p>{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="about-section">
          <h2>Research Team</h2>
          <p>
            This project is developed by a dedicated team of researchers and engineers
            as part of a capstone program focused on applying AI techniques to
            sustainable chemistry and biomass processing. For inquiries and
            collaboration, please reach out through the portal's contact features.
          </p>
        </section>
      </div>
    </div>
  );
}
