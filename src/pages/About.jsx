import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ArrowDown, FileText, Activity, Layers, Zap, Database, Brain, Network, BarChart3, 
  Search, Lock, CheckCircle, ShieldCheck, Microscope, Cpu, FlaskConical, Target, Settings2, Sliders, TrendingUp, Sparkles, BrainCircuit, Terminal, Table, Grid, Filter, GitBranch, LineChart, Code, Boxes, GraduationCap, BookOpen, Atom, TestTubes, User, Globe, Share2, Workflow
} from 'lucide-react';
import './About.css';

// --- Helper: CountUp Animation ---
const CountUp = ({ end, decimals = 0, duration = 2, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: "0px 0px -50px 0px" });

  useEffect(() => {
    if (!inView) return;
    let startTime;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(end * easeOut);
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
      else setCount(end);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, inView]);

  return <span ref={nodeRef}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

// --- Data Objects ---
const glanceCards = [
  { val: 467, lbl: 'Experimental observations' },
  { val: 33, lbl: 'Raw + engineered variables' },
  { val: 4, lbl: 'Benchmarked model families' },
  { val: 0.8726, lbl: 'Reported NODE blind-test result (R²)', dec: 4 },
  { val: 0.0504, lbl: 'Reported NODE blind-test result (MAE)', dec: 4 }
];

const challengeContent = (
  <p style={{ lineHeight: 1.7, color: 'var(--graphite)', opacity: 0.85, fontSize: '0.95rem' }}>
    Lignocellulosic biomass contains <strong>cellulose, hemicellulose, and lignin</strong>. Lignin is a complex aromatic polymer that makes biomass difficult to process. <strong>Deep Eutectic Solvents (DESs)</strong> can support lignin fractionation, but effective removal depends on many interacting variables, including biomass composition, DES properties, HBA:HBD ratio, temperature, reaction time, and liquid-to-solid ratio. Traditional optimization therefore requires repeated <strong>trial-and-error laboratory experiments</strong>, making the process time-consuming and resource-intensive. Existing computational approaches also have limitations. Many rely on <strong>tree-based models or discrete deep-learning architectures</strong> that do not explicitly represent continuous chemical dynamics. Research is also affected by <strong>small scientific datasets, overfitting, data leakage, limited independent validation, and the black-box nature of AI models</strong>. In addition, naive synthetic data augmentation may introduce chemically unrealistic observations. These challenges create a need for a more reliable, interpretable, and scientifically grounded prediction framework.
  </p>
);

const innovationContent = (
  <p style={{ lineHeight: 1.7, color: 'var(--graphite)', opacity: 0.85, fontSize: '0.95rem' }}>
    Our research develops a <strong>Deep Learning-based predictive framework</strong> for estimating <strong>lignin removal efficiency</strong> during Deep Eutectic Solvent-based biomass fractionation. The framework uses biomass characteristics, DES molecular descriptors, solvent composition, and process conditions to learn complex nonlinear relationships from experimental data. We investigate <strong>DNN, TabNet, FT-Transformer, and NODE</strong> architectures, with XGBoost considered as a traditional machine-learning benchmark. The central innovation is the use of <strong>Neural Oblivious Decision Ensembles (NODE)</strong>, which represent the hidden state continuously through learned representations, providing a mathematical structure aligned with continuous chemical-process dynamics. The framework also applies <strong>Optuna</strong> for hyperparameter optimization and <strong>SHAP-based Explainable AI</strong> for feature-level interpretation. A strict <strong>zero-leakage evaluation protocol</strong> and an independent blind-test dataset are used to assess generalization. The reported NODE result achieved a blind-test <strong>R² of 0.8726</strong> and <strong>MAE of 0.0504</strong>.
  </p>
);

const findingsContent = (
  <p style={{ lineHeight: 1.7, color: 'var(--graphite)', opacity: 0.85, fontSize: '0.95rem' }}>
    The research demonstrates that <strong>Explainable AI (XAI)</strong> can provide meaningful information about the variables associated with lignin-removal prediction. Using <strong>SHAP analysis</strong>, the <strong>HBD-pKa/pKb</strong> was identified as the most influential descriptor affecting lignin-yield prediction. The engineered interaction <strong>LSR × log R₀</strong>, connecting liquid-to-solid ratio with pretreatment severity, was also identified as an important factor. The model was further evaluated through <strong>parity analysis and residual diagnostics</strong>, with the blind-test observations showing relatively small prediction errors around the ideal relationship. Another important finding came from the study of <strong>Gaussian synthetic data augmentation</strong>. Adding approximately 10% synthetic data did not improve generalization; instead, blind-test <strong>R² decreased from 0.8726 to 0.8335</strong>, while <strong>MAE increased from 0.0504 to 0.0565</strong>. These results support the importance of chemically meaningful data, independent validation, and explainability when applying Deep Learning to small scientific datasets.
  </p>
);


const workflow = [
  { id: '01', title: 'Experimental Data', desc: 'Biomass characteristics\nDES properties\nProcess parameters', icon: FlaskConical },
  { id: '02', title: 'Data Engineering', desc: 'Data cleaning\nMissing-value handling\nFeature transformation\nScaling / encoding', icon: Settings2 },
  { id: '03', title: 'Feature Engineering', desc: 'Raw + engineered variables\nMolecular descriptors\nProcess interactions', icon: Network },
  { id: '04', title: 'Deep Learning', desc: 'DNN\nTabNet\nFT-Transformer\nNODE', icon: BrainCircuit },
  { id: '05', title: 'Optimization', desc: 'Hyperparameter tuning\nModel selection', icon: Sliders },
  { id: '06', title: 'Prediction', desc: 'Lignin removal efficiency\nR² / MAE / RMSE', icon: TrendingUp },
  { id: '07', title: 'Explainability', desc: 'SHAP\nGlobal feature importance\nLocal prediction interpretation', icon: Sparkles },
  { id: '08', title: 'Validation', desc: 'Independent blind-test evaluation', icon: ShieldCheck },
];

const modelCards = [
  { name: 'TabNet', desc: 'Attention-based tabular learning', r2: 0.726, icon: '🧠' },
  { name: 'DNN', desc: 'Deep Neural Network (MLP)', r2: 0.835, icon: '🔗' },
  { name: 'NODE', desc: 'Neural Oblivious Decision Ensembles', r2: 0.873, icon: '🌳', highlight: true },
  { name: 'NODE Augmented', desc: 'NODE with feature augmentation', r2: 0.834, icon: '⚡' }
];

const techStack = [
  { name: 'Python', desc: 'Core programming language.' },
  { name: 'Pandas', desc: 'Data manipulation and analysis.' },
  { name: 'NumPy', desc: 'Numerical computing.' },
  { name: 'Scikit-learn', desc: 'Machine learning utilities.' },
  { name: 'PyTorch', desc: 'Deep-learning implementation and training.' },
  { name: 'XGBoost', desc: 'Tree-based benchmark modeling.' },
  { name: 'DNN', desc: 'Deep Neural Network architecture.' },
  { name: 'TabNet', desc: 'Attentive tabular learning.' },
  { name: 'FT-Transformer', desc: 'Feature Tokenizer Transformer.' },
  { name: 'NODE', desc: 'Neural Oblivious Decision Ensembles.' },
  { name: 'Optuna', desc: 'Hyperparameter optimization.' },
  { name: 'SHAP', desc: 'Model explainability.' },
  { name: 'Matplotlib', desc: 'Scientific plotting and visualization.' },
  { name: 'MongoDB Atlas', desc: 'Proposed cloud-based storage for heterogeneous chemical information.' }
];

const timelineEvents = [
  { phase: 'PHASE I', time: 'MONTHS 1–2', title: 'Research Foundation & Problem Formulation', desc: 'Literature review, research-gap analysis, requirements gathering, and project-scope definition.' },
  { phase: 'PHASE II', time: 'MONTHS 3–4', title: 'Data Engineering & Management', desc: 'Experimental data collection, cleaning, migration, normalization, and chemical-data management.' },
  { phase: 'PHASE III', time: 'MONTHS 5–7', title: 'Deep Learning Model Development', desc: 'Architecture design, model implementation, and training of DNN, TabNet, FT-Transformer, and NODE approaches.' },
  { phase: 'PHASE IV', time: 'MONTHS 8–9', title: 'Optimization & Explainable AI', desc: 'Hyperparameter optimization, model refinement, SHAP implementation, and feature-level interpretation.' },
  { phase: 'PHASE V', time: 'MONTHS 10–11', title: 'Performance Evaluation & Validation', desc: 'Model comparison using R², MAE, and RMSE, followed by independent blind-test validation.' },
  { phase: 'PHASE VI', time: 'MONTH 12', title: 'Documentation & Final Delivery', desc: 'Final results, technical documentation, report compilation, and final presentation.' },
];

const faculty = [
  { name: 'Dr. Sumit Bansal', role: 'Assistant Professor' },
  { name: 'Dr. Palika Chopra', role: 'Assistant Professor' }
];

const team = ['Daksh Sharma', 'Divyam Puri', 'Krish Gupta', 'Lavish Arora', 'Lavkush Vashistha'];

const ExplainableAISection = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [depFeature, setDepFeature] = useState('HBD-pKa/pKb');

  return (
    <section className="sec-light py-20">
      <div className="about-container">
        <span className="section-eyebrow">From Prediction to Explanation</span>
        <h2 className="section-title">Explainable AI with SHAP</h2>
        <p className="section-subtitle">Understand not only what the model predicts, but which variables contribute to the prediction.</p>

        <div className="shap-tabs-container">
          <div className="shap-tabs">
            {['global', 'local', 'interaction', 'cross'].map(tab => (
              <button
                key={tab}
                className={`shap-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'global' && 'Global'}
                {tab === 'local' && 'Local'}
                {tab === 'interaction' && 'Interactions'}
                {tab === 'cross' && 'Cross-Method'}
              </button>
            ))}
          </div>
        </div>

        <div className="shap-content-area">
          {activeTab === 'global' && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="shap-panel">
              <div className="sp-header">
                <h3>Global Feature Importance</h3>
                <p>Which variables contribute most strongly across model predictions?</p>
              </div>
              <div className="sp-body">
                 <div className="global-row highlight">
                   <div className="gr-label">HBD-pKa/pKb <span className="gr-rank">Rank 1</span></div>
                   <div className="gr-bar-track"><motion.div className="gr-bar-fill" initial={{width:0}} animate={{width:'100%'}} transition={{duration:1}} /></div>
                 </div>
                 <div className="global-row highlight-sub">
                   <div className="gr-label">LSR × log R₀ <span className="gr-rank">Rank 2</span></div>
                   <div className="gr-bar-track"><motion.div className="gr-bar-fill" initial={{width:0}} animate={{width:'80%'}} transition={{duration:1, delay: 0.1}} /></div>
                 </div>
                 <div className="global-row">
                   <div className="gr-label">Temperature <span className="gr-rank">Rank 3</span></div>
                   <div className="gr-bar-track"><motion.div className="gr-bar-fill" initial={{width:0}} animate={{width:'50%'}} transition={{duration:1, delay: 0.2}} /></div>
                 </div>
                 <div className="global-row">
                   <div className="gr-label">Reaction Time <span className="gr-rank">Rank 4</span></div>
                   <div className="gr-bar-track"><motion.div className="gr-bar-fill" initial={{width:0}} animate={{width:'35%'}} transition={{duration:1, delay: 0.3}} /></div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'local' && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="shap-panel">
              <div className="sp-header">
                <h3>Local Prediction Explanation</h3>
                <p>Individual prediction breakdown mapping feature forces.</p>
              </div>
              <div className="sp-body">
                 <div className="local-selector">
                   <select className="ls-select"><option>Sample Experiment #42</option></select>
                   <span className="ls-note">Select experiment to view theoretical contribution paths</span>
                 </div>
                 
                 <div className="waterfall-container">
                   <div className="wf-items">
                      
                      {/* Base Value */}
                      <div className="wf-item base-item">
                         <div className="wf-item-lbl">Base Value</div>
                         <div className="wf-item-track">
                            <div className="wf-anchor-line" style={{left: '30%'}}></div>
                            <div className="wf-val-tag base-tag" style={{left: '30%'}}>E[f(x)]</div>
                         </div>
                      </div>

                      {/* HBD-pKa/pKb */}
                      <div className="wf-item">
                         <div className="wf-item-lbl">HBD-pKa/pKb</div>
                         <div className="wf-item-track">
                            <div className="wf-anchor-line" style={{left: '30%', borderStyle: 'dashed'}}></div>
                            <motion.div className="wf-bar pos-bar" initial={{width:0}} animate={{width:'30%'}} transition={{duration:1, delay:0.1}} style={{left: '30%'}}>
                              <span className="wf-bar-text">↑ Increases Output</span>
                            </motion.div>
                            <div className="wf-anchor-line" style={{left: '60%'}}></div>
                         </div>
                      </div>

                      {/* LSR x log R0 */}
                      <div className="wf-item">
                         <div className="wf-item-lbl">LSR × log R₀</div>
                         <div className="wf-item-track">
                            <div className="wf-anchor-line" style={{left: '60%', borderStyle: 'dashed'}}></div>
                            <motion.div className="wf-bar neg-bar" initial={{width:0}} animate={{width:'15%'}} transition={{duration:1, delay:0.3}} style={{right: '40%'}}>
                              <span className="wf-bar-text">↓ Decreases</span>
                            </motion.div>
                            <div className="wf-anchor-line" style={{left: '45%'}}></div>
                         </div>
                      </div>

                      {/* Temperature */}
                      <div className="wf-item">
                         <div className="wf-item-lbl">Temperature</div>
                         <div className="wf-item-track">
                            <div className="wf-anchor-line" style={{left: '45%', borderStyle: 'dashed'}}></div>
                            <motion.div className="wf-bar pos-bar" initial={{width:0}} animate={{width:'20%'}} transition={{duration:1, delay:0.5}} style={{left: '45%'}}>
                              <span className="wf-bar-text">↑ Increases</span>
                            </motion.div>
                            <div className="wf-anchor-line final-line" style={{left: '65%'}}></div>
                         </div>
                      </div>

                      {/* Final Prediction */}
                      <div className="wf-item final-item">
                         <div className="wf-item-lbl">Final Prediction</div>
                         <div className="wf-item-track">
                            <div className="wf-anchor-line final-line" style={{left: '65%'}}></div>
                            <div className="wf-val-tag final-tag" style={{left: '65%'}}>f(x)</div>
                         </div>
                      </div>

                   </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'interaction' && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="shap-panel">
              <div className="sp-header">
                <h3>Feature Dependence</h3>
                <p>Explore how an influential feature changes the model prediction.</p>
              </div>
              <div className="sp-body">
                 <div className="local-selector" style={{marginBottom: '3rem'}}>
                   <select className="ls-select" value={depFeature} onChange={(e)=>setDepFeature(e.target.value)}>
                     <option>HBD-pKa/pKb</option>
                     <option>LSR × log R₀</option>
                   </select>
                 </div>
                 <div className="interaction-plot">
                    <div className="plot-area">
                       <svg viewBox="0 0 400 200" className="plot-svg">
                          {depFeature === 'HBD-pKa/pKb' ? (
                            <motion.path d="M 50,150 Q 150,150 200,100 T 350,50" fill="none" stroke="var(--soft-emerald)" strokeWidth="4" strokeLinecap="round" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.5}}/>
                          ) : (
                            <motion.path d="M 50,50 Q 200,80 350,150" fill="none" stroke="var(--forest-green)" strokeWidth="4" strokeLinecap="round" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.5}}/>
                          )}
                       </svg>
                       <div className="plot-x-axis">{depFeature} Value</div>
                       <div className="plot-y-axis">SHAP Contribution</div>
                    </div>
                 </div>
                 <p className="plot-caption">SHAP dependence analysis helps visualize nonlinear relationships between feature values and their contribution to model predictions.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'cross' && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="shap-panel">
              <div className="sp-header">
                <h3>Cross-Method Feature Validation</h3>
                <p>Comparing feature importance identified using SHAP and permutation importance.</p>
              </div>
              <div className="sp-body">
                 <div className="cross-legend">
                   <span className="cl-item"><span className="cl-color shap-color"></span> SHAP Importance</span>
                   <span className="cl-item"><span className="cl-color perm-color"></span> Permutation Importance</span>
                 </div>
                 <div className="cross-chart">
                    <div className="cross-row highlight">
                      <div className="cr-label">HBD-pKa/pKb</div>
                      <div className="cr-bars">
                        <motion.div className="cr-bar shap-bar" initial={{width:0}} animate={{width:'100%'}} transition={{duration:1}} />
                        <motion.div className="cr-bar perm-bar" initial={{width:0}} animate={{width:'95%'}} transition={{duration:1, delay:0.2}} />
                      </div>
                    </div>
                    <div className="cross-row">
                      <div className="cr-label">LSR × log R₀</div>
                      <div className="cr-bars">
                        <motion.div className="cr-bar shap-bar" initial={{width:0}} animate={{width:'80%'}} transition={{duration:1}} />
                        <motion.div className="cr-bar perm-bar" initial={{width:0}} animate={{width:'75%'}} transition={{duration:1, delay:0.2}} />
                      </div>
                    </div>
                    <div className="cross-row">
                      <div className="cr-label">Temperature</div>
                      <div className="cr-bars">
                        <motion.div className="cr-bar shap-bar" initial={{width:0}} animate={{width:'50%'}} transition={{duration:1}} />
                        <motion.div className="cr-bar perm-bar" initial={{width:0}} animate={{width:'55%'}} transition={{duration:1, delay:0.2}} />
                      </div>
                    </div>
                 </div>
                 <p className="plot-caption">Agreement between SHAP and permutation importance provides additional support for the relevance of the selected feature rankings.</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="learned-section">
           <h3 className="learned-title">What the Model Learned</h3>
           <div className="learned-grid">
              <motion.div className="learned-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}>
                 <div className="lc-header">
                   <h4>HBD-pKa/pKb</h4>
                   <span className="lc-badge">Dominant Reported Descriptor</span>
                 </div>
                 <p>HBD-pKa/pKb was identified as the most influential descriptor in the reported SHAP analysis, showing a strong primary association with the predicted lignin removal efficiency.</p>
              </motion.div>
              <motion.div className="learned-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.2}}>
                 <div className="lc-header">
                   <h4>LSR × log R₀</h4>
                   <span className="lc-badge">Important Engineered Interaction</span>
                 </div>
                 <p>This engineered interaction connects liquid-to-solid ratio with pretreatment severity, and was identified as an important contributing factor in the reported analysis.</p>
              </motion.div>
           </div>
        </div>

        <motion.div className="research-disclaimer" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}>
          <div className="rd-icon"><FileText size={20} /></div>
          <div className="rd-text">
            <strong>Research Note:</strong> SHAP provides feature-level explanations of model predictions but does not by itself establish a complete chemical mechanism.
          </div>
        </motion.div>

      </div>
    </section>
  );
};

const techEcosystem = [
  { id: 'python', name: 'Python', category: 'DATA & COMPUTATION', role: 'Core language and computational backend.', icon: Terminal },
  { id: 'pandas', name: 'Pandas', category: 'DATA & COMPUTATION', role: 'Data manipulation and structured analysis.', icon: Table },
  { id: 'numpy', name: 'NumPy', category: 'DATA & COMPUTATION', role: 'High-performance numerical computation.', icon: Grid },
  { id: 'sklearn', name: 'Scikit-learn', category: 'PREPROCESSING', role: 'Data preprocessing and standard scaling.', icon: Filter },
  { id: 'xgboost', name: 'XGBoost', category: 'MACHINE LEARNING', role: 'Tree-based baseline algorithm.', icon: GitBranch },
  { id: 'pytorch', name: 'PyTorch', category: 'DEEP LEARNING', role: 'Deep learning implementation and training.', icon: Cpu },
  { id: 'dnn', name: 'DNN', category: 'DEEP LEARNING', role: 'Deep Neural Network architecture.', icon: Layers },
  { id: 'tabnet', name: 'TabNet', category: 'DEEP LEARNING', role: 'Attention-based tabular learning network.', icon: Network },
  { id: 'ftt', name: 'FT-Transformer', category: 'DEEP LEARNING', role: 'Feature Tokenizer + Transformer architecture.', icon: Boxes },
  { id: 'node', name: 'NODE', category: 'DEEP LEARNING', role: 'Continuous curve + neural network.', icon: Activity, focus: true },
  { id: 'optuna', name: 'Optuna', category: 'OPTIMIZATION', role: 'Hyperparameter optimization.', icon: Sliders },
  { id: 'shap', name: 'SHAP', category: 'EXPLAINABLE AI', role: 'Feature contribution and model interpretation.', icon: Sparkles },
  { id: 'matplotlib', name: 'Matplotlib', category: 'VISUALIZATION', role: 'Scientific chart and plot rendering.', icon: LineChart },
  { id: 'mongo', name: 'MongoDB Atlas', category: 'DATA MANAGEMENT', role: 'Storage of heterogeneous chemical information.', icon: Database },
];

const TechStackSection = () => {
  const [filter, setFilter] = useState('ALL');
  const tabs = ['ALL', 'DATA & COMPUTATION', 'PREPROCESSING', 'MACHINE LEARNING', 'DEEP LEARNING', 'OPTIMIZATION', 'EXPLAINABLE AI', 'VISUALIZATION', 'DATA MANAGEMENT'];

  const filteredTech = filter === 'ALL' ? techEcosystem : techEcosystem.filter(t => t.category === filter);
  
  const groupedTech = filteredTech.reduce((acc, tech) => {
    if (!acc[tech.category]) acc[tech.category] = [];
    acc[tech.category].push(tech);
    return acc;
  }, {});

  return (
    <section className="sec-light py-20 relative overflow-hidden" style={{background: '#fcfcfc'}}>
      <div className="eco-bg"></div>
      <div className="about-container relative z-10">
        <span className="section-eyebrow">RESEARCH STACK</span>
        <h2 className="section-title">Technologies Behind the Framework</h2>
        <p className="section-subtitle">A computational stack connecting scientific data engineering, deep learning, optimization, explainability, visualization, and data management.</p>

        <div className="eco-tabs-container">
          {tabs.map(t => (
            <button key={t} className={`eco-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="eco-center-wrapper">
          <motion.div className="eco-center-node" initial={{opacity:0, scale:0.9}} whileInView={{opacity:1, scale:1}} viewport={{once:true}}>
            LIGNIN REMOVAL<br/>PREDICTION FRAMEWORK
          </motion.div>
        </div>

        <div className="eco-groups">
          {Object.keys(groupedTech).map((cat, i) => (
            <motion.div key={cat} className="eco-category" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i * 0.1}}>
              <h4 className="eco-cat-title">{cat}</h4>
              <div className="eco-cards">
                {groupedTech[cat].map(t => {
                  const Icon = t.icon;
                  return (
                    <motion.div key={t.id} className="eco-card" initial={{opacity:0, scale:0.95}} whileInView={{opacity:1, scale:1}} viewport={{once:true}}>
                      {t.focus && <span className="ec-badge">Research Focus</span>}
                      <div className="ec-header">
                        <div className="ec-icon"><Icon size={20} strokeWidth={2}/></div>
                        <div className="ec-title">{t.name}</div>
                      </div>
                      <div className="ec-role">{t.role}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="eco-pipeline">
          <h3>Framework Pipeline</h3>
          <div className="ep-flow">
            
            <div className="ep-row">
              <div className="ep-stage">Experimental Data</div>
              <div className="ep-arrow"><ArrowRight size={16}/></div>
              <div className="ep-techs">
                <span className="ep-pill">Python</span>
                <span className="ep-pill">Pandas</span>
                <span className="ep-pill">NumPy</span>
                <span className="ep-pill">MongoDB Atlas</span>
              </div>
            </div>

            <div className="ep-row">
              <div className="ep-stage">Preprocessing</div>
              <div className="ep-arrow"><ArrowRight size={16}/></div>
              <div className="ep-techs">
                <span className="ep-pill">Scikit-learn</span>
              </div>
            </div>

            <div className="ep-row">
              <div className="ep-stage">Model Development</div>
              <div className="ep-arrow"><ArrowRight size={16}/></div>
              <div className="ep-techs">
                <span className="ep-pill">PyTorch</span>
                <span className="ep-pill">XGBoost</span>
                <span className="ep-pill">DNN</span>
                <span className="ep-pill">TabNet</span>
                <span className="ep-pill">FT-Transformer</span>
                <span className="ep-pill" style={{background:'var(--soft-emerald)', color:'#fff', border:'none'}}>NODE</span>
              </div>
            </div>

            <div className="ep-row">
              <div className="ep-stage">Hyperparameter Optimization</div>
              <div className="ep-arrow"><ArrowRight size={16}/></div>
              <div className="ep-techs">
                <span className="ep-pill">Optuna</span>
              </div>
            </div>

            <div className="ep-row">
              <div className="ep-stage">SHAP Explainability</div>
              <div className="ep-arrow"><ArrowRight size={16}/></div>
              <div className="ep-techs">
                <span className="ep-pill">SHAP</span>
              </div>
            </div>

            <div className="ep-row">
              <div className="ep-stage">Visualization</div>
              <div className="ep-arrow"><ArrowRight size={16}/></div>
              <div className="ep-techs">
                <span className="ep-pill">Matplotlib</span>
              </div>
            </div>

          </div>
        </div>

        <p style={{textAlign:'center', marginTop:'3rem', color:'#666', fontSize:'0.9rem'}}>
          Together, these technologies support the project workflow from experimental-data preparation and model development to optimization, explainability, visualization, and chemical-data management.
        </p>

      </div>
    </section>
  );
};

const SimpleArchitecture = () => {
  const cards = [
    {
      num: '01',
      icon: <FlaskConical size={20} />,
      title: 'Experimental Data',
      items: ['Biomass characteristics', 'DES properties', 'Process parameters']
    },
    {
      num: '02',
      icon: <BrainCircuit size={20} />,
      title: 'Deep Learning',
      items: ['DNN', 'TabNet', 'FT-Transformer', 'NODE']
    },
    {
      num: '03',
      icon: <Sliders size={20} />,
      title: 'Optimization',
      items: ['Hyperparameter tuning', 'Model selection']
    },
    {
      num: '04',
      icon: <LineChart size={20} />,
      title: 'Prediction',
      items: ['Lignin removal efficiency', 'R² / MAE / RMSE']
    },
    {
      num: '05',
      icon: <Sparkles size={20} />,
      title: 'Explainability',
      items: ['SHAP', 'Global feature importance', 'Local prediction interpretation']
    },
    {
      num: '06',
      icon: <ShieldCheck size={20} />,
      title: 'Validation',
      items: ['Independent blind-test evaluation']
    }
  ];

  return (
    <section className="arch-simple-sec py-20">
      <div className="about-container">
        <div className="arch-header-left">
          <span className="section-eyebrow">ARCHITECTURE</span>
          <h2 className="section-title">How the Prediction Engine Works</h2>
          <p className="section-subtitle">
            An end-to-end scientific pipeline processing chemical inputs into explainable predictions.
          </p>
        </div>
        
        <div className="arch-simple-grid">
          {cards.map((c, i) => (
            <div key={i} className="arch-simple-card">
              <div className="asc-top">
                <div className="asc-icon-box">{c.icon}</div>
                <div className="asc-num">{c.num}</div>
              </div>
              <h3 className="asc-title">{c.title}</h3>
              <div className="asc-list">
                {c.items.map((item, j) => (
                  <div key={j} className="asc-list-item">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main Component ---
export default function About() {
  return (
    <div className="about-wrapper">
      
      {/* 1. HERO SECTION */}
      <section className="sec-dark hero-sec">
        <div className="hero-bg-anim"></div>
        <div className="hero-grid"></div>
        <div className="about-container hero-content">
          <motion.span className="section-eyebrow" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>PROJECT GENESIS</motion.span>
          <motion.h1 className="hero-title" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
            Decoding Biomass <br/><span>with Continuous AI</span>
          </motion.h1>
          <motion.p className="hero-desc" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
            A research platform combining experimental biomass-fractionation data, deep learning, Neural Oblivious Decision Ensembles (NODE), and explainable AI to support computational screening of lignin removal conditions.
          </motion.p>
          
          <motion.div className="hero-metrics" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}>
            <div className="h-metric">
              <span className="h-metric-val"><CountUp end={0.8726} decimals={4} /></span>
              <span className="h-metric-lbl">Blind-Test R²</span>
            </div>
            <div className="h-metric">
              <span className="h-metric-val"><CountUp end={467} /></span>
              <span className="h-metric-lbl">Experimental Samples</span>
            </div>
            <div className="h-metric">
              <span className="h-metric-val"><CountUp end={33} /></span>
              <span className="h-metric-lbl">Raw + Engineered Features</span>
            </div>
            <div className="h-metric">
              <span className="h-metric-val"><CountUp end={0.0504} decimals={4} /></span>
              <span className="h-metric-lbl">Blind-Test MAE</span>
            </div>
            <div className="h-metric">
              <span className="h-metric-val" style={{fontSize: '1.5rem', marginTop: '1rem'}}>ZERO-LEAKAGE</span>
              <span className="h-metric-lbl">Validation Protocol</span>
            </div>
          </motion.div>

          <motion.div className="hero-btns" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}>
            <Link to="/predict" className="btn-pri">Explore Prediction Engine <ArrowRight size={18}/></Link>
            <a href="#methodology" className="btn-sec">View Research Methodology</a>
          </motion.div>
        </div>
      </section>

      {/* 2. RESEARCH AT A GLANCE */}
      <section className="sec-light py-20" id="methodology">
        <div className="about-container">
          <span className="section-eyebrow">The Research</span>
          <h2 className="section-title">From Experimental Data to Explainable AI</h2>
          <p className="section-subtitle">A computational framework designed to connect biomass fractionation data with predictive modelling and scientific interpretation.</p>
          
          <div className="glance-grid">
            {glanceCards.map((c, i) => (
              <motion.div key={i} className="glance-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i*0.1}}>
                <div className="glance-val"><CountUp end={c.val} decimals={c.dec||0}/></div>
                <div className="glance-lbl">{c.lbl}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY THIS RESEARCH MATTERS */}
      <section className="sec-light py-10">
        <div className="about-container">
          <h2 className="section-title text-center" style={{textAlign: 'center', marginBottom: '4rem'}}>Why This Research Matters</h2>
          <div className="matters-grid">
            <motion.div className="matter-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}>
              <h3 className="matter-title">The Challenge</h3>
              {challengeContent}
            </motion.div>
            <motion.div className="matter-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.1}}>
              <h3 className="matter-title">The Innovation</h3>
              {innovationContent}
            </motion.div>
            <motion.div className="matter-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.2}}>
              <h3 className="matter-title">Key Findings</h3>
              {findingsContent}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. IMMERSIVE PREDICTION ENGINE PIPELINE */}
      <SimpleArchitecture />

      {/* 5. WHY NODE */}
      <section className="sec-light py-20">
        <div className="about-container">
          <span className="section-eyebrow">Continuous-Time Learning</span>
          <h2 className="section-title">Why NODE?</h2>
          <p className="section-subtitle">Investigating whether continuous-depth representations are better aligned with the continuous dynamics of chemical systems.</p>
          
          <div className="ode-compare">
            <motion.div className="ode-box" initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
              <h3 style={{marginBottom:'1rem', fontSize:'1.2rem', fontWeight:700}}>Traditional / Discrete Deep Learning</h3>
              <div className="ode-svg-container">
                <svg viewBox="0 0 100 50" style={{width:'80%', height:'100%', overflow:'visible'}}>
                  <polyline points="0,40 25,40 25,25 50,25 50,10 100,10" fill="none" stroke="#E07A5F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="0" cy="40" r="3" fill="#E07A5F"/>
                  <circle cx="25" cy="25" r="3" fill="#E07A5F"/>
                  <circle cx="50" cy="10" r="3" fill="#E07A5F"/>
                  <circle cx="100" cy="10" r="3" fill="#E07A5F"/>
                </svg>
              </div>
              <p className="ode-caption">Discrete transformations provide a piecewise representation of the relationship.</p>
            </motion.div>
            
            <motion.div className="ode-box" style={{borderColor: 'var(--soft-emerald)'}} initial={{opacity:0, x:20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
              <h3 style={{marginBottom:'1rem', fontSize:'1.2rem', fontWeight:700, color: 'var(--forest-green)'}}>NODE</h3>
              <div className="ode-svg-container" style={{background: 'rgba(105, 201, 168, 0.05)'}}>
                <svg viewBox="0 0 100 50" style={{width:'80%', height:'100%', overflow:'visible'}}>
                  <path d="M 0,40 C 40,40 60,10 100,10" fill="none" stroke="var(--soft-emerald)" strokeWidth="4" strokeLinecap="round"/>
                  <circle cx="0" cy="40" r="4" fill="var(--soft-emerald)"/>
                  <circle cx="100" cy="10" r="4" fill="var(--soft-emerald)"/>
                </svg>
              </div>
              <p className="ode-caption" style={{color: 'var(--forest-green)', fontWeight: 600}}>A learned differential equation continuously evolves the latent representation.</p>
            </motion.div>
          </div>

          <motion.div className="ode-explanation" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}>
            Lignin solubilization involves coupled reaction kinetics, solvent–biomass interactions, temperature effects, mass transfer, and process evolution. The NODE framework investigates whether continuous-depth modelling provides a suitable mathematical representation of these nonlinear relationships.
          </motion.div>
        </div>
      </section>

      {/* 6. MODEL BENCHMARKING */}
      <section className="sec-dark py-20">
        <div className="about-container">
          <span className="section-eyebrow">Model Benchmarking</span>
          <h2 className="section-title">How the Architectures Compare</h2>
          <p className="section-subtitle">Consistent evaluation across multiple machine-learning and deep-learning approaches. (Reported Benchmark Results)</p>
          
          <div className="model-grid">
            {modelCards.map((m, i) => (
              <motion.div key={i} className={`model-card ${m.highlight ? 'highlight' : ''}`} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i*0.1}}>
                <div className="mc-header">
                  <span className="mc-icon">{m.icon}</span>
                  <span className="mc-title" style={{fontFamily: 'var(--font-serif)'}}>{m.name}</span>
                </div>
                <div className="mc-desc">{m.desc}</div>
                <div className="mc-footer">
                  <div className="mc-bar-bg">
                    <motion.div 
                      className="mc-bar-fill" 
                      initial={{width: 0}} 
                      whileInView={{width: `${m.r2 * 100}%`}} 
                      viewport={{once:true}} 
                      transition={{duration: 1.5, delay: i*0.1 + 0.3}} 
                    />
                  </div>
                  <div className="mc-val">{(m.r2 * 100).toFixed(1)}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. EXPLAINABLE AI */}
      <ExplainableAISection />

      {/* 8. SCIENTIFIC VALIDATION */}
      <section className="sec-dark py-20">
        <div className="about-container">
          <span className="section-eyebrow">Scientific Validation</span>
          <h2 className="section-title">Built for Leakage-Controlled Evaluation</h2>
          
          <div className="val-split">
            <motion.div className="val-box" initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
              <div className="val-perc">90%</div>
              <div style={{letterSpacing:'0.1em', fontSize:'0.8rem', color:'rgba(255,255,255,0.6)'}}>DEVELOPMENT SET</div>
            </motion.div>
            <motion.div className="val-box locked" initial={{opacity:0, x:20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
              <Lock size={32} color="var(--soft-emerald)" style={{margin:'0 auto 10px auto'}}/>
              <div className="val-perc">10%</div>
              <div style={{letterSpacing:'0.1em', fontSize:'0.8rem', color:'var(--soft-emerald)'}}>BLIND-TEST SET</div>
            </motion.div>
          </div>

          <div className="val-flow">
            <span className="val-flow-step">Development Data</span> <ArrowRight size={16} color="rgba(255,255,255,0.3)"/>
            <span className="val-flow-step">Preprocessing</span> <ArrowRight size={16} color="rgba(255,255,255,0.3)"/>
            <span className="val-flow-step">Feature Engineering</span> <ArrowRight size={16} color="rgba(255,255,255,0.3)"/>
            <span className="val-flow-step">Hyperparameter Optimization</span> <ArrowRight size={16} color="rgba(255,255,255,0.3)"/>
            <span className="val-flow-step">Model Development</span>
          </div>

          <p style={{textAlign:'center', maxWidth:'800px', margin:'0 auto 3rem', color:'rgba(255,255,255,0.7)', fontStyle:'italic'}}>
            "The independent blind-test set remained isolated during preprocessing, feature engineering, hyperparameter optimization, and model development, and was reserved for final evaluation."
          </p>

          <div className="val-metrics">
            <div className="val-m-box">
              <div style={{fontSize:'2rem', fontWeight:700, color:'var(--soft-emerald)'}}>R²</div>
              <div style={{fontSize:'0.85rem', color:'rgba(255,255,255,0.5)'}}>Coefficient of determination</div>
            </div>
            <div className="val-m-box">
              <div style={{fontSize:'2rem', fontWeight:700, color:'var(--soft-emerald)'}}>MAE</div>
              <div style={{fontSize:'0.85rem', color:'rgba(255,255,255,0.5)'}}>Mean absolute error</div>
            </div>
            <div className="val-m-box">
              <div style={{fontSize:'2rem', fontWeight:700, color:'var(--soft-emerald)'}}>RMSE</div>
              <div style={{fontSize:'0.85rem', color:'rgba(255,255,255,0.5)'}}>Root mean square error</div>
            </div>
          </div>
        </div>
      </section>



      {/* 10. TRIAL VS DIGITAL */}
      <section className="sec-dark py-20">
        <div className="about-container">
          <h2 className="section-title text-center" style={{textAlign:'center', marginBottom:'4rem'}}>From Trial-and-Error to Digital Screening</h2>
          
          <div className="td-grid">
            <motion.div className="td-col" initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
              <h3 style={{textAlign:'center', marginBottom:'2rem', fontSize:'1.35rem', color:'#ffffff', fontWeight:600}}>Traditional Experimental Optimization</h3>
              
              <div className="td-step-box">Many combinations</div>
              <div className="td-down"><ArrowDown size={20} /></div>
              
              <div className="td-step-box">Repeated laboratory trials</div>
              <div className="td-down"><ArrowDown size={20} /></div>
              
              <div className="td-step-box">Time and resource requirements</div>
              <div className="td-down"><ArrowDown size={20} /></div>
              
              <div className="td-step-box">Experimental measurement</div>
            </motion.div>

            <motion.div className="td-col digital" initial={{opacity:0, x:20}} whileInView={{opacity:1, x:0}} viewport={{once:true}}>
              <h3 style={{textAlign:'center', marginBottom:'2rem', fontSize:'1.35rem', color:'var(--soft-emerald)', fontWeight:600}}>AI-Assisted Digital Screening</h3>
              
              <div className="td-step-box digital">Experimental dataset</div>
              <div className="td-down digital"><ArrowDown size={20} /></div>
              
              <div className="td-step-box digital">Deep Learning</div>
              <div className="td-down digital"><ArrowDown size={20} /></div>
              
              <div className="td-step-box digital">Virtual prediction</div>
              <div className="td-down digital"><ArrowDown size={20} /></div>
              
              <div className="td-step-box digital highlight">Promising conditions</div>
              <div className="td-down digital"><ArrowDown size={20} /></div>
              
              <div className="td-step-box digital">Physical experimental validation</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 11. RESEARCH STACK */}
      <TechStackSection />

      {/* 12. WHY IT MATTERS (IMPACT) */}
      <section className="sec-dark py-20">
        <div className="about-container">
          <span className="section-eyebrow">Why It Matters</span>
          <h2 className="section-title">Research Impact</h2>
          <div className="matters-grid">
            <motion.div className="matter-card" style={{background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.05)'}} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}>
              <h3 style={{color:'var(--soft-emerald)', marginBottom:'1rem', fontSize:'1.25rem'}}>Scientific Impact</h3>
              <p style={{color:'rgba(255,255,255,0.7)', lineHeight:1.6}}>Improves investigation of nonlinear relationships between biomass characteristics, DES properties and process conditions.</p>
            </motion.div>
            <motion.div className="matter-card" style={{background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.05)'}} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.1}}>
              <h3 style={{color:'var(--soft-emerald)', marginBottom:'1rem', fontSize:'1.25rem'}}>Resource Impact</h3>
              <p style={{color:'rgba(255,255,255,0.7)', lineHeight:1.6}}>Computational screening can potentially reduce unnecessary experimental screening of unsuitable conditions.</p>
            </motion.div>
            <motion.div className="matter-card" style={{background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.05)'}} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.2}}>
              <h3 style={{color:'var(--soft-emerald)', marginBottom:'1rem', fontSize:'1.25rem'}}>Research Impact</h3>
              <p style={{color:'rgba(255,255,255,0.7)', lineHeight:1.6}}>Provides a framework combining prediction, model comparison, independent validation and explainability.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 13. TIMELINE */}
      <section className="sec-light py-20">
        <div className="about-container">
          <h2 className="section-title text-center" style={{textAlign:'center'}}>Project Timeline</h2>
          <p className="section-subtitle text-center" style={{textAlign:'center', margin:'0 auto 4rem'}}>The Work Breakdown Structure of the computational framework.</p>
          
          <div className="timeline-track">
            {timelineEvents.map((t, i) => (
              <motion.div key={i} className="tl-item" initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true, margin:"-50px"}}>
                <div className="tl-icon"><CheckCircle size={20}/></div>
                <div className="tl-content">
                  <div className="tl-phase">{t.phase} &middot; {t.time}</div>
                  <h4 style={{fontSize:'1.25rem', fontWeight:700, marginBottom:'0.5rem'}}>{t.title}</h4>
                  <p style={{color:'#666', lineHeight:1.5, margin:0}}>{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. TEAM */}
      <section className="sec-light py-20 relative overflow-hidden" style={{background: '#fcfcfc'}}>
        <div className="team-bg-net"></div>
        <div className="about-container relative z-10">
          <span className="section-eyebrow text-center" style={{display:'block', textAlign:'center'}}>THE PEOPLE</span>
          <h2 className="section-title text-center" style={{textAlign:'center', marginBottom:'1rem'}}>Our Team & Faculties</h2>
          <p className="text-center" style={{textAlign:'center', color:'#666', marginBottom:'5rem', fontSize:'1.05rem', lineHeight:1.6}}>
            Computer Science and Engineering Department <br/>
            Thapar Institute of Engineering and Technology, Patiala
          </p>

          <div className="faculty-section">
             <h3 className="team-section-title">Faculty Mentors</h3>
             <div className="faculty-grid">
               
               <motion.div className="faculty-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}>
                 <div className="fc-icon-wrapper"><GraduationCap size={40} strokeWidth={1.5} /></div>
                 <div className="fc-badge">Faculty Mentor</div>
                 <h4 className="fc-name">Dr. Sumit Bansal</h4>
                 <p className="fc-role">Assistant Professor</p>
               </motion.div>

               <motion.div className="faculty-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.1}}>
                 <div className="fc-icon-wrapper"><GraduationCap size={40} strokeWidth={1.5} /></div>
                 <div className="fc-badge">Faculty Mentor</div>
                 <h4 className="fc-name">Dr. Palika Chopra</h4>
                 <p className="fc-role">Assistant Professor</p>
               </motion.div>

             </div>
          </div>
          
          <div className="network-flow">
            <div className="nf-line"></div>
            <div className="nf-node"></div>
          </div>

          <div className="research-team-section">
             <div style={{textAlign:'center', marginBottom:'3rem'}}>
               <h3 className="team-section-title" style={{marginBottom:'0.5rem'}}>Research Team</h3>
               <p style={{color:'#777', fontSize:'0.95rem'}}>Student researchers contributing to the AI-powered lignin extraction research platform.</p>
             </div>
             
             <div className="student-grid">
                
                {/* Row 1 */}
                <motion.div className="student-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.2}}>
                  <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                  <h4 className="sc-name">Daksh Sharma</h4>
                  <div className="sc-line"></div>
                  <p className="sc-role">Research Team Member</p>
                </motion.div>
                
                <motion.div className="student-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.3}}>
                  <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                  <h4 className="sc-name">Divyam Puri</h4>
                  <div className="sc-line"></div>
                  <p className="sc-role">Research Team Member</p>
                </motion.div>

                <motion.div className="student-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.4}}>
                  <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                  <h4 className="sc-name">Krish Gupta</h4>
                  <div className="sc-line"></div>
                  <p className="sc-role">Research Team Member</p>
                </motion.div>
                
                {/* Row 2 (Centered via CSS) */}
                <motion.div className="student-card centered-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.5}}>
                  <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                  <h4 className="sc-name">Lavish Arora</h4>
                  <div className="sc-line"></div>
                  <p className="sc-role">Research Team Member</p>
                </motion.div>

                <motion.div className="student-card centered-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.6}}>
                  <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                  <h4 className="sc-name">Lavkush Vashistha</h4>
                  <div className="sc-line"></div>
                  <p className="sc-role">Research Team Member</p>
                </motion.div>

             </div>
          </div>
        </div>
      </section>

      {/* 15. FUTURE RESEARCH ROADMAP */}
      <section className="sec-dark py-20 relative overflow-hidden">
        <div className="fr-bg"></div>
        <div className="about-container relative z-10">
          <span className="section-eyebrow text-center" style={{display:'block', textAlign:'center'}}>FUTURE RESEARCH DIRECTIONS</span>
          <h2 className="section-title text-center" style={{textAlign:'center', marginBottom:'4rem'}}>Future Research Directions</h2>
          
          <div className="fr-roadmap">
            
            {/* Central Node */}
            <motion.div className="fr-center-node" initial={{opacity:0, scale:0.9}} whileInView={{opacity:1, scale:1}} viewport={{once:true}}>
               <h3 className="fr-node-title">CURRENT FRAMEWORK</h3>
               <div className="fr-node-tags">
                 <span>Neural ODE</span>
                 <span>SHAP</span>
                 <span>Deep Learning</span>
                 <span>Blind-Test Validation</span>
               </div>
            </motion.div>

            {/* Connecting Lines */}
            <div className="fr-lines-container">
               <div className="fr-line fr-line-left"></div>
               <div className="fr-line fr-line-center"></div>
               <div className="fr-line fr-line-right"></div>
            </div>

            {/* Branch Cards */}
            <div className="fr-branches">
               
               <motion.div className="fr-card" initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.1}}>
                 <div className="fr-diagram">
                   <div className="frd-circle"></div><div className="frd-line"></div><div className="frd-box"></div>
                 </div>
                 <div className="fr-icon-wrap"><Atom size={28} strokeWidth={1.5} /></div>
                 <div className="fr-badge">FUTURE MODEL DEVELOPMENT</div>
                 <h3 className="fr-card-title">Physics-Informed NODE</h3>
                 <p className="fr-card-desc">Potential integration of experimentally validated kinetics, thermodynamics, mass-transfer relationships, and conservation principles.</p>
               </motion.div>

               <motion.div className="fr-card" initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.2}}>
                 <div className="fr-diagram">
                   <div className="frd-hex"></div><div className="frd-line"></div><div className="frd-net"></div>
                 </div>
                 <div className="fr-icon-wrap"><Share2 size={28} strokeWidth={1.5} /></div>
                 <div className="fr-badge">MOLECULAR REPRESENTATION</div>
                 <h3 className="fr-card-title">Graph Neural Networks</h3>
                 <p className="fr-card-desc">Potential use of molecular graph representations to reduce dependence on manually engineered descriptors.</p>
               </motion.div>

               <motion.div className="fr-card" initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.3}}>
                 <div className="fr-diagram">
                   <div className="frd-stack"></div><div className="frd-line"></div><div className="frd-globe"></div>
                 </div>
                 <div className="fr-icon-wrap"><Globe size={28} strokeWidth={1.5} /></div>
                 <div className="fr-badge">GENERALIZATION</div>
                 <h3 className="fr-card-title">Broader Validation</h3>
                 <p className="fr-card-desc">Future evaluation across more diverse biomass types, experimental conditions, and external datasets.</p>
               </motion.div>

            </div>

            <motion.p className="fr-summary" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.5}}>
              Future work extends the current framework toward stronger physical constraints, richer molecular representations, and broader validation across experimental domains.
            </motion.p>
          </div>
        </div>
      </section>

      {/* 16. CTA / CONCLUSION */}
      <section className="sec-dark py-20 relative">
        <div className="about-container relative z-10">
          <motion.div className="cta-premium-container" initial={{opacity:0, scale:0.95}} whileInView={{opacity:1, scale:1}} viewport={{once:true}}>
            
            <div className="cta-content">
              <span className="cta-eyebrow">RESEARCH PLATFORM</span>
              <h2 className="cta-title">Ready to Explore the Research?</h2>
              <p className="cta-subtitle">Move from experimental inputs to AI-assisted lignin-removal prediction.</p>
              <div className="cta-btns">
                <Link to="/predict" className="btn-cta-pri">Run a Prediction <ArrowRight size={18}/></Link>
                <a href="#methodology" className="btn-cta-sec">Explore the Research</a>
              </div>
            </div>

            <div className="cta-visual">
              <div className="cv-flow">
                <div className="cv-item">Biomass</div>
                <div className="cv-arrow"><Workflow size={20}/></div>
                <div className="cv-item">DES</div>
                <div className="cv-arrow"><Workflow size={20}/></div>
                <div className="cv-item highlight">NODE</div>
                <div className="cv-arrow"><ArrowRight size={20}/></div>
                <div className="cv-item end">Prediction</div>
              </div>
            </div>

          </motion.div>

          {/* Stats Strip */}
          <motion.div className="cta-stats-strip" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.2}}>
            <div className="cta-stat">
              <h4>467</h4>
              <p>Experimental Samples</p>
            </div>
            <div className="cta-stat">
              <h4>0.8726</h4>
              <p>Reported Blind-Test R²</p>
            </div>
            <div className="cta-stat">
              <h4>0.0504</h4>
              <p>Reported Blind-Test MAE</p>
            </div>
            <div className="cta-stat">
              <h4>SHAP</h4>
              <p>Explainable AI</p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
