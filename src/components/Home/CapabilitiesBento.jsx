import { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  BarChart3, 
  GitCompareArrows, 
  FileDown, 
  Layers,
  Code2
} from 'lucide-react';
import './CapabilitiesBento.css';

export default function CapabilitiesBento() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="bento-container">
      <div className="bento-grid">
        
        {/* Card 1: Kinetic Curves (Large, spans 2x2) */}
        <div 
          className="bento-card bento-large card-kinetic"
          onMouseEnter={() => setHoveredCard('kinetic')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="bento-bg-gradient color-rose" />
          <div className="bento-content">
            <div className="bento-header">
              <div className="bento-icon color-rose">
                <BarChart3 size={24} />
              </div>
              <h3>Kinetic Extraction Curves</h3>
            </div>
            <p>Neural ODE uses a continuous-time formulation to represent the evolving latent state. This continuous representation is conceptually aligned with the continuous evolution of lignin solubilization, unlike conventional models that only map to final yields.</p>
            <ul className="bento-list">
              <li>Reaction kinetics</li>
              <li>Reaction time</li>
              <li>Mass transfer</li>
              <li>Solvent–biomass interactions</li>
              <li>Continuous-time modelling</li>
            </ul>
          </div>
          <div className="bento-visual">
            {/* Animated SVG Chart */}
            <svg viewBox="0 0 400 150" className={`bento-chart ${hoveredCard === 'kinetic' ? 'is-animating' : ''}`}>
              <path 
                d="M 0,140 C 100,140 150,40 250,20 C 320,5 380,10 400,10" 
                fill="none" 
                stroke="#F43F5E" 
                strokeWidth="4" 
                strokeLinecap="round"
                className="chart-line"
              />
              <path 
                d="M 0,140 C 100,140 150,40 250,20 C 320,5 380,10 400,10 L 400,150 L 0,150 Z" 
                fill="url(#roseGradient)" 
                className="chart-fill"
              />
              <defs>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(244, 63, 94, 0.2)" />
                  <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 2: Real-Time Inference (Medium, spans 2x1) */}
        <div className="bento-card bento-medium card-inference">
          <div className="bento-bg-gradient color-blue" />
          <div className="bento-content">
            <div className="bento-header">
              <div className="bento-icon color-blue">
                <Zap size={22} />
              </div>
              <h3>Sub-Second AI Inference</h3>
            </div>
            <p>Instantaneous yield predictions. Bypass hours of physical lab testing with our optimized neural network forward passes.</p>
          </div>
          <div className="bento-visual-mini">
            <div className="fake-terminal">
              <span className="term-prompt">&gt;</span> <span className="term-cmd">model.predict(params)</span>
              <div className="term-output animate-pulse-fast">Processing multi-dimensional tensor...</div>
              <div className="term-result">Yield: 87.3%</div>
            </div>
          </div>
        </div>

        {/* Card 3: 10 Input Parameters (Small, 1x1) */}
        <div className="bento-card bento-small card-params">
          <div className="bento-content">
            <div className="bento-icon color-green">
              <Cpu size={22} />
            </div>
            <h3>10 Input Parameters</h3>
            <p>Feedstock, HBA/HBD, ratios, temp, and pH.</p>
          </div>
        </div>

        {/* Card 4: Model Comparison (Small, 1x1) */}
        <div className="bento-card bento-small card-compare">
          <div className="bento-content">
            <div className="bento-icon color-amber">
              <GitCompareArrows size={22} />
            </div>
            <h3>Model Comparison</h3>
            <p>Run TabNet, NODE, and DNN simultaneously.</p>
          </div>
        </div>

        {/* Card 5: Prediction History (Medium, spans 2x1) */}
        <div className="bento-card bento-medium card-history">
          <div className="bento-bg-gradient color-cyan" />
          <div className="bento-content history-layout">
            <div className="bento-icon color-cyan" style={{ flexShrink: 0 }}>
              <Layers size={22} />
            </div>
            <div className="history-text-col">
              <h3 className="history-title">Experiment<br/>History</h3>
              <p className="history-desc">Every prediction is automatically saved to your profile. Search previous records to review and revisit past configurations.</p>
              <ul className="bento-list history-list">
                <li>Previous prediction runs</li>
                <li>Experimental configurations</li>
                <li>Prediction records</li>
                <li>Search & review</li>
                <li>Revisit past configurations</li>
              </ul>
            </div>
          </div>
          <div className="bento-visual-mini stack-visual">
            <div className="stack-layer layer-1"></div>
            <div className="stack-layer layer-2"></div>
            <div className="stack-layer layer-3"></div>
          </div>
        </div>

        {/* Card 6: Export & Reports (Small, 1x1) */}
        <div className="bento-card bento-small card-export">
          <div className="bento-content">
            <div className="bento-icon color-purple">
              <FileDown size={22} />
            </div>
            <h3>PDF Exports</h3>
            <p>Generate publication-ready research dossiers.</p>
          </div>
        </div>

        {/* Card 7: REST API Access (Small, 1x1) */}
        <div className="bento-card bento-small card-api">
          <div className="bento-content">
            <div className="bento-icon color-slate">
              <Code2 size={22} />
            </div>
            <h3>REST API Access</h3>
            <p>Integrate predictions directly into Python scripts.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
