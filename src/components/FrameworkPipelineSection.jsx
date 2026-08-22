import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Sliders, Cpu, Activity, BarChart2, ShieldCheck, FileDigit, ArrowRight, Lock, Atom } from "lucide-react";
import "./FrameworkPipeline.css";

const STAGES = [
  {
    id: 1,
    num: "01",
    title: "Experimental Data",
    icon: Database,
    short: "Biomass, DES, Process Conditions",
    purpose: "Systematize chemical and process variables into a unified dataset.",
    io: "In: Laboratory observations | Out: Raw structured data",
    role: "Foundation for all subsequent predictive modelling.",
    content: (
      <div className="fp-stage-details">
        <ul className="fp-list">
          <li>Biomass characteristics</li>
          <li>DES properties</li>
          <li>Process parameters</li>
        </ul>
        <div className="fp-visual-small"><Atom size={16}/> Biomass + Molecular Data</div>
      </div>
    )
  },
  {
    id: 2,
    num: "02",
    title: "Data Engineering",
    icon: FileDigit,
    short: "Cleaning, Scaling, Encoding",
    purpose: "Transform raw experimental data into a machine-learning-ready format.",
    io: "In: Raw data | Out: Normalized feature matrix",
    role: "Ensures model stability and prevents numerical overflow.",
    techs: ["Python", "Pandas", "NumPy", "Scikit-learn"],
    content: (
      <div className="fp-stage-details">
        <ul className="fp-list">
          <li>Data cleaning</li>
          <li>Missing-value handling</li>
          <li>Feature transformation</li>
          <li>Scaling / encoding</li>
        </ul>
      </div>
    )
  },
  {
    id: 3,
    num: "03",
    title: "Model Development",
    icon: Cpu,
    short: "Architecture Training & Testing",
    purpose: "Map complex non-linear chemical interactions to predict outcomes.",
    io: "In: Feature matrix | Out: Trained predictive weights",
    role: "Core predictive engine of the research.",
    content: (
      <div className="fp-stage-details">
        <div className="fp-models-grid">
          <div className="fp-model-node">XGBoost</div>
          <div className="fp-model-node">DNN</div>
          <div className="fp-model-node">TabNet</div>
          <div className="fp-model-node">FT-Transformer</div>
          <div className="fp-model-node highlight">
            NODE <span className="fp-focus-badge">RESEARCH FOCUS</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    num: "04",
    title: "Hyperparameter Optimization",
    icon: Sliders,
    short: "Optuna Tuning",
    purpose: "Algorithmically discover the optimal architecture parameters.",
    io: "In: Baseline model | Out: Optimized model configuration",
    role: "Maximizes accuracy while preventing overfitting.",
    techs: ["Optuna"],
    content: (
      <div className="fp-stage-details text-center">
        <div className="fp-flow-mini">
          <span>Model configuration</span> <ArrowRight size={14}/> <span>Optimization</span> <ArrowRight size={14}/> <span>Selection</span>
        </div>
      </div>
    )
  },
  {
    id: 5,
    num: "05",
    title: "Prediction",
    icon: Activity,
    short: "Yield Estimation",
    purpose: "Execute the optimized mathematical representation on unseen data.",
    io: "In: Chemical inputs | Out: Lignin Removal Efficiency",
    role: "Provides the actionable insight for chemical processes.",
    content: (
      <div className="fp-stage-details text-center">
        <div className="fp-prediction-box">
          <strong>Lignin Removal Efficiency</strong>
          <div className="fp-metrics-row">
            <span>R²</span>
            <span>MAE</span>
            <span>RMSE</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    num: "06",
    title: "SHAP Explainability",
    icon: BarChart2,
    short: "Feature Importance",
    purpose: "Deconstruct the black-box prediction into human-readable chemical insights.",
    io: "In: Model outputs | Out: Feature contribution scores",
    role: "Validates that the model learned true chemistry, not artifacts.",
    techs: ["SHAP"],
    content: (
      <div className="fp-stage-details text-center">
        <ul className="fp-list">
          <li>Global Feature Importance</li>
          <li>Local Prediction Interpretation</li>
        </ul>
        <div className="fp-flow-mini mt-3">
          <span>Feature</span> <ArrowRight size={14}/> <span>Contribution</span> <ArrowRight size={14}/> <span>Prediction</span>
        </div>
      </div>
    )
  },
  {
    id: 7,
    num: "07",
    title: "Independent Validation",
    icon: ShieldCheck,
    short: "Zero-Leakage Evaluation",
    purpose: "Prove the model generalizes to completely unseen chemical scenarios.",
    io: "In: Blind-test dataset | Out: Final unbiased metrics",
    role: "Establishes scientific credibility.",
    content: (
      <div className="fp-stage-details text-center">
        <ul className="fp-list">
          <li>Blind-Test Evaluation</li>
          <li>Generalization Assessment</li>
        </ul>
        <div className="mt-2 text-muted"><Lock size={14} className="inline mr-1"/> Secure Holdout</div>
      </div>
    )
  }
];


export default function FrameworkPipelineSection() {
  const [expandedId, setExpandedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const expandedStage = STAGES.find(s => s.id === expandedId);

  const renderDetailPanel = (stage) => {
    if (!stage) return null;
    return (
      <motion.div 
        className="fp-detail-panel"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="fp-dp-header">
          <div className="fp-dp-title-box">
            <h3 className="fp-dp-title">{stage.title}</h3>
            <p className="fp-dp-short">{stage.short}</p>
          </div>
          <button className="fp-dp-close" onClick={() => setExpandedId(null)}>×</button>
        </div>
        
        <div className="fp-dp-grid">
          <div className="fp-dp-col">
            <div className="fp-dp-meta-item">
              <span className="fp-dp-label">PURPOSE</span>
              <p>{stage.purpose}</p>
            </div>
            <div className="fp-dp-meta-item">
              <span className="fp-dp-label">I/O</span>
              <p>{stage.io}</p>
            </div>
            <div className="fp-dp-meta-item">
              <span className="fp-dp-label">ROLE</span>
              <p>{stage.role}</p>
            </div>
          </div>
          
          <div className="fp-dp-col">
            <span className="fp-dp-label">RELEVANT TECHNOLOGIES</span>
            <div className="fp-dp-visual-box">
              {stage.content}
            </div>
            {stage.techs && (
              <div className="fp-tech-pills mt-2">
                {stage.techs.map(t => <span key={t} className="fp-pill">{t}</span>)}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="fp-section py-20">
      <div className="about-container">
        <div className="fp-header text-center">
          <span className="section-eyebrow">FRAMEWORK PIPELINE</span>
          <h2 className="section-title">From Experimental Data to Explainable Prediction</h2>
          <p className="section-subtitle mx-auto">How the computational framework transforms experimental observations into model predictions, explanations, and validation.</p>
        </div>

        <div className="fp-pipeline-container">
          <div className="fp-track-bg">
            <motion.div 
              className="fp-particle"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 15, ease: "linear", repeat: Infinity }}
              style={{ animationPlayState: hoveredId ? "paused" : "running" }}
            />
          </div>

          <div className="fp-stages-row">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const isExpanded = expandedId === stage.id;
              const isHovered = hoveredId === stage.id;

              return (
                <div 
                  key={stage.id} 
                  className={`fp-stage-wrapper ${isExpanded ? "expanded" : ""} ${isHovered ? "hovered" : ""}`}
                  onMouseEnter={() => setHoveredId(stage.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <motion.div 
                    className="fp-stage-card"
                    onClick={() => toggleExpand(stage.id)}
                    whileHover={{ y: -4 }}
                  >
                    <div className="fp-stage-top">
                      <div className="fp-icon-box">
                        <Icon size={20} />
                      </div>
                      <span className="fp-num">{stage.num}</span>
                    </div>
                    
                    <h3 className="fp-title">{stage.title}</h3>
                    <p className="fp-short-desc">{stage.short}</p>
                    
                    {isExpanded && <div className="fp-card-indicator" />}
                  </motion.div>

                  <div className="fp-mobile-detail-container">
                    <AnimatePresence mode="wait">
                      {isExpanded && renderDetailPanel(stage)}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fp-desktop-detail-container">
            <AnimatePresence mode="wait">
              {expandedStage && renderDetailPanel(expandedStage)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
