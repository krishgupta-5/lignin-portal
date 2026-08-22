import FrameworkPipelineSection from "../components/FrameworkPipelineSection";
import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ArrowDown, FileText, Activity, Layers, Zap, Database, Brain, Network, BarChart3, 
  Search, Lock, CheckCircle, Clock, ShieldCheck, Microscope, Cpu, FlaskConical, Target, Settings2, Sliders, TrendingUp, Sparkles, BrainCircuit, Terminal, Table, Grid, Filter, GitBranch, LineChart, Code, Boxes, GraduationCap, BookOpen, Atom, TestTubes, User, Globe, Share2, Workflow, Mail
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



const needAnalysisContent = (
    <ul className="matter-list">
      <li>Lignin forms a complex structural barrier in <strong>lignocellulosic biomass</strong>.</li>
      <li><strong>Lignin removal</strong> depends on interacting variables such as temperature, reaction time, <strong>liquid-to-solid ratio (LSR)</strong>, <strong>HBD:HBA ratio</strong>, biomass composition, and solvent properties.</li>
      <li>Identifying suitable conditions through repeated laboratory experiments is time-consuming and resource-intensive.</li>
      <li>Conventional machine-learning approaches do not explicitly represent the continuous evolution of chemical processes.</li>
      <li>Scientific prediction also requires interpretability and reliable <strong>blind-test evaluation</strong> on unseen observations.</li>
    </ul>
  );
  
  const innovationContent = (
    <ul className="matter-list">
      <li>A <strong>Deep Learning</strong> framework is used to learn nonlinear relationships between experimental inputs and lignin removal efficiency.</li>
      <li><strong>Neural ODE</strong> provides a continuous-depth representation that is conceptually aligned with the continuous evolution of chemical processes.</li>
      <li>The framework compares <strong>DNN</strong>, <strong>TabNet</strong>, <strong>FT-Transformer</strong>, and NODE approaches with established machine-learning benchmarks.</li>
      <li><strong>Optuna</strong> is used for hyperparameter optimization.</li>
      <li><strong>SHAP</strong> is integrated to quantify feature contributions and interpret model predictions.</li>
    </ul>
  );
  
  const findingsContent = (
    <ul className="matter-list">
      <li><strong>Neural ODE</strong> achieved a reported independent blind-test R² of 0.8726 and MAE of 0.0504.</li>
      <li><strong>SHAP</strong> analysis identified <strong>HBD-pKa/pKb</strong> as the most influential reported descriptor.</li>
      <li>The engineered interaction <strong>LSR × log R₀</strong> was identified as an important factor.</li>
      <li>Independent <strong>blind-test evaluation</strong> was used to assess generalization to unseen observations.</li>
      <li>Approximately 10% <strong>Gaussian synthetic-data augmentation</strong> reduced rather than improved blind-test performance.</li>
    </ul>
  );


const workflow = [
  { id: '01', title: 'Experimental Data', desc: 'Biomass characteristics\nDES properties\nProcess parameters', icon: FlaskConical },
  { id: '02', title: 'Data Engineering', desc: 'Data cleaning\nMissing-value handling\nFeature transformation\nScaling / encoding', icon: Settings2 },
  { id: '03', title: 'Feature Engineering', desc: 'Raw + engineered variables\nMolecular descriptors\nProcess interactions', icon: Network },
  { id: '04', title: 'Deep Learning', desc: 'DNN\nTabNet\nNODE\nNODE Augmented', icon: BrainCircuit },
  { id: '05', title: 'Optimization', desc: 'Hyperparameter tuning\nModel selection', icon: Sliders },
  { id: '06', title: 'Prediction', desc: 'Lignin removal efficiency\nR² / MAE / RMSE', icon: TrendingUp },
  { id: '07', title: 'Explainability', desc: 'SHAP\nGlobal feature importance\nLocal prediction interpretation', icon: Sparkles },
  { id: '08', title: 'Validation', desc: 'Independent blind-test evaluation', icon: ShieldCheck },
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
  { name: 'NODE Augmented', desc: 'Enhanced NODE with Synthetic Data.' },
  { name: 'NODE', desc: 'Neural Oblivious Decision Ensembles.' },
  { name: 'Optuna', desc: 'Hyperparameter optimization.' },
  { name: 'SHAP', desc: 'Model explainability.' },
  { name: 'Matplotlib', desc: 'Scientific plotting and visualization.' },
  { name: 'MongoDB Atlas', desc: 'Proposed cloud-based storage for heterogeneous chemical information.' }
];

const projectPhases = [
  {
    phase: "Phase I",
    name: "Identification & Formulation",
    months: "Months 1–3",
    status: "Completed",
    activities: [
      { name: "Literature Survey & Requirement Gathering", start: 0, end: 2 },
      { name: "Project Scope Definition", start: 0, end: 2 }
    ]
  },
  {
    phase: "Phase II",
    name: "Data Engineering",
    months: "Months 4–6",
    status: "Completed",
    activities: [
      { name: "Data Collection, Cleaning, and Migration", start: 0, end: 2 },
      { name: "MongoDB Atlas Integration & Normalization", start: 3, end: 5 }
    ]
  },
  {
    phase: "Phase III",
    name: "Deep Learning Development",
    months: "Months 7–10",
    status: "Completed",
    activities: [
      { name: "Architecture Design (Neural Network/TabNet)", start: 5, end: 7 },
      { name: "Model Implementation & Core Training", start: 5, end: 7 }
    ]
  },
  {
    phase: "Phase IV",
    name: "XAI & Refinement",
    months: "Months 10–11",
    status: "Completed",
    activities: [
      { name: "Hyperparameter Tuning & Optimization", start: 7, end: 9 },
      { name: "SHAP Implementation & Interpretability", start: 7, end: 9 }
    ]
  },
  {
    phase: "Phase V",
    name: "Evaluation",
    months: "Months 11–12",
    status: "Completed",
    activities: [
      { name: "Results Evaluation & Comparative Analysis", start: 8, end: 11 },
      { name: "Model Validation on Blind Test Set", start: 8, end: 11 }
    ]
  },
  {
    phase: "Phase VI",
    name: "Documentation",
    months: "Months 9–12",
    status: "In Progress",
    activities: [
      { name: "Interim Report and Mid-term Evaluation", start: 11, end: 12 },
      { name: "Final Report Compilation & Final Presentation", start: 11, end: 12 }
    ]
  }
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

// --- Main Component ---
export default function About() {
  const heroRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const { left, top } = heroRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    heroRef.current.style.setProperty("--mx", `${x}px`);
    heroRef.current.style.setProperty("--my", `${y}px`);
  };

  return (
    <div className="about-wrapper">
      
      {/* 1. HERO SECTION */}
      <section 
        className="sec-dark hero-sec-premium" 
        ref={heroRef}
        onMouseMove={handleMouseMove}
      >
        {/* Dynamic scientific grid (cursor reactive) */}
        <div className="hero-grid-premium"></div>
        
        {/* Cursor spotlight layer */}
        <div className="hero-spotlight-layer"></div>

        {/* Subtle Molecular Structures in the far background */}
        <div className="hero-molecular-bg">
          <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="mol-svg">
            {/* Extremely subtle connected nodes */}
            <g className="mol-group g1">
               <circle cx="200" cy="150" r="3" />
               <circle cx="280" cy="220" r="2" />
               <line x1="200" y1="150" x2="280" y2="220" />
               <circle cx="240" cy="300" r="4" />
               <line x1="280" y1="220" x2="240" y2="300" />
            </g>
            <g className="mol-group g2">
               <circle cx="800" cy="100" r="4" />
               <circle cx="850" cy="180" r="2" />
               <line x1="800" y1="100" x2="850" y2="180" />
            </g>
          </svg>
        </div>

        {/* Neural ODE subtle curve with particles */}
        <div className="hero-ode-bg">
           <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
              <motion.path 
                className="ode-subtle-path"
                d="M -100,450 C 300,500 500,200 800,250 C 1000,300 1100,100 1300,150" 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.15 }}
                transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
              />
              <circle r="2" className="ode-subtle-particle">
                <animateMotion dur="25s" repeatCount="indefinite" path="M -100,450 C 300,500 500,200 800,250 C 1000,300 1100,100 1300,150" />
              </circle>
              <circle r="1.5" className="ode-subtle-particle">
                <animateMotion dur="35s" repeatCount="indefinite" begin="10s" path="M -100,450 C 300,500 500,200 800,250 C 1000,300 1100,100 1300,150" />
              </circle>
           </svg>
        </div>

        {/* Main Content Area */}
        <div className="about-container hero-content-premium">
          <motion.span 
            className="section-eyebrow-premium" 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            transition={{duration: 0.6, delay: 0.1}}
          >
            PROJECT GENESIS
          </motion.span>
          
          <motion.h1 
            className="hero-title-premium" 
            initial={{opacity:0, y:15}} 
            animate={{opacity:1, y:0}} 
            transition={{duration: 0.6, delay: 0.2}}
          >
            Decoding Biomass <br/><span className="continuous-highlight">with Continuous AI</span>
          </motion.h1>
          
          <motion.p 
            className="hero-desc-premium" 
            initial={{opacity:0, y:15}} 
            animate={{opacity:1, y:0}} 
            transition={{duration: 0.6, delay: 0.3}}
          >
            A research platform combining experimental biomass-fractionation data, deep learning, Neural Oblivious Decision Ensembles (NODE), and explainable AI to support computational screening of lignin removal conditions.
          </motion.p>
          
          <motion.div 
            className="hero-metrics-premium" 
            initial={{opacity:0, y:15}} 
            animate={{opacity:1, y:0}} 
            transition={{duration: 0.6, delay: 0.4}}
          >
            <div className="h-metric-premium">
              <span className="h-metric-val"><CountUp end={0.8726} decimals={4} /></span>
              <span className="h-metric-lbl">Blind-Test R²</span>
            </div>
            <div className="h-metric-premium">
              <span className="h-metric-val"><CountUp end={467} /></span>
              <span className="h-metric-lbl">Experimental Samples</span>
            </div>
            <div className="h-metric-premium">
              <span className="h-metric-val"><CountUp end={33} /></span>
              <span className="h-metric-lbl">Raw + Engineered Features</span>
            </div>
            <div className="h-metric-premium">
              <span className="h-metric-val"><CountUp end={0.0504} decimals={4} /></span>
              <span className="h-metric-lbl">Blind-Test MAE</span>
            </div>
            <div className="h-metric-premium protocol-metric">
              <span className="h-metric-val" style={{fontSize: "1.5rem", marginTop: "1rem"}}>ZERO-LEAKAGE</span>
              <span className="h-metric-lbl">Validation Protocol</span>
            </div>
          </motion.div>

          <motion.div 
            className="hero-btns-premium" 
            initial={{opacity:0, y:15}} 
            animate={{opacity:1, y:0}} 
            transition={{duration: 0.6, delay: 0.5}}
          >
            <Link to="/predict" className="btn-pri-premium">
              Prediction <ArrowRight className="btn-arrow" size={18}/>
            </Link>
            <a href="#methodology" className="btn-sec-premium">View Research Methodology</a>
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
              <h3 className="matter-title">Need Analysis</h3>
              {needAnalysisContent}
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

      

      {/* 7. EXPLAINABLE AI */}
      <ExplainableAISection />

      

      {/* REDESIGNED FRAMEWORK PIPELINE */}
      <FrameworkPipelineSection />

      

      {/* 13. TIMELINE */}
        <section className="sec-light py-20" style={{background: "#F7F8F5"}}>
          <div className="about-container">
            <h2 className="section-title text-center" style={{textAlign:"center", marginBottom: "1.5rem"}}>Project Timeline</h2>
            
            {/* Timeline Summary Box */}
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "4rem", background: "#FFFFFF", padding: "1.5rem 2rem", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", maxWidth: "1000px", margin: "0 auto 4rem auto" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Project Duration</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A" }}>12 Months</div>
              </div>
              <div style={{ width: "1px", background: "#E2E8F0" }}></div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Total Phases</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A" }}>6</div>
              </div>
              <div style={{ width: "1px", background: "#E2E8F0" }}></div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Timeline Range</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A" }}>0–12 Months</div>
              </div>
              <div style={{ width: "1px", background: "#E2E8F0" }}></div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Status Overview</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#10B981" }}>5 Complete, 1 In Progress</div>
              </div>
            </div>
            
            <div className="timeline-track">
              {projectPhases.map((t, i) => (
                <motion.div key={i} className="tl-item" initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true, margin:"-50px"}}>
                  <div className={"tl-icon" + (t.status === "In Progress" ? " in-progress" : "")}>
                    {t.status === "Completed" ? <CheckCircle size={20}/> : <Clock size={20}/>}
                  </div>
                  <div className="tl-content" style={{ borderTop: t.status === "In Progress" ? "3px solid #EAB308" : "3px solid #10B981" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <div className="tl-phase" style={{ background: t.status === "In Progress" ? "#FEF9C3" : "#ECFDF5", color: t.status === "In Progress" ? "#CA8A04" : "#059669", marginBottom: "0.5rem" }}>{t.phase} &middot; {t.months}</div>
                        <h4 style={{fontSize:"1.4rem", fontWeight:700, color:"#0F172A", margin:0}}>{t.name}</h4>
                      </div>
                      <div style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, background: t.status === "Completed" ? "#ECFDF5" : "#FEF9C3", color: t.status === "Completed" ? "#059669" : "#CA8A04", border: t.status === "Completed" ? "1px solid #A7F3D0" : "1px solid #FEF08A" }}>
                        {t.status}
                      </div>
                    </div>
                    
                    <div style={{ background: "#F8FAFC", borderRadius: "8px", padding: "1.5rem", border: "1px solid #E2E8F0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Activity</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", position: "relative" }}>
                          {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                            <div key={n} style={{ position: "absolute", left: (n/12)*100 + "%", transform: "translateX(-50%)", fontSize: "0.65rem", fontWeight: 700, color: "#94A3B8" }}>{n}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                        {t.activities.map((act, actIdx) => (
                          <div key={actIdx} style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "1rem", alignItems: "center" }}>
                            <div style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 500, lineHeight: 1.3 }}>{act.name}</div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", height: "16px", background: "#F1F5F9", borderRadius: "4px", position: "relative" }}>
                              {[1,2,3,4,5,6,7,8,9,10,11].map(n => (
                                <div key={n} style={{ position: "absolute", left: (n/12)*100 + "%", top: 0, bottom: 0, width: "1px", background: "#E2E8F0" }}></div>
                              ))}
                              <div style={{ 
                                gridColumn: (act.start + 1) + " / " + (act.end + 1), 
                                background: t.status === "Completed" ? "#10B981" : "#EF4444", 
                                borderRadius: "4px",
                                height: "100%",
                                zIndex: 2
                              }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
                 <div className="fc-icon-wrapper" style={{ overflow: "hidden", padding: 0 }}>
                     <img src="https://csed.thapar.edu/files/microfaculty/21/173648460217364846021740.jpg" alt="Dr. Sumit Bansal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                   </div>
                   <div className="fc-badge">Faculty Mentor</div>
                   <h4 className="fc-name">Dr. Sumit Bansal</h4>
                   <p className="fc-role">Assistant Professor</p>
                   <a href="mailto:sumit.bansal@thapar.edu" className="email-link"><Mail size={14} /> sumit.bansal@thapar.edu</a>
               </motion.div>

               <motion.div className="faculty-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.1}}>
                 <div className="fc-icon-wrapper" style={{ overflow: "hidden", padding: 0 }}>
                     <img src="https://csed.thapar.edu/files/microfaculty/21/17307850041001.jpg" alt="Dr. Palika Chopra" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                   </div>
                   <div className="fc-badge">Faculty Mentor</div>
                   <h4 className="fc-name">Dr. Palika Chopra</h4>
                   <p className="fc-role">Assistant Professor</p>
                   <a href="mailto:palika.chopra@thapar.edu" className="email-link"><Mail size={14} /> palika.chopra@thapar.edu</a>
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
                  <motion.div className="student-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.2}}>
                    <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                    <h4 className="sc-name">Divyam Puri</h4>
                    <div className="sc-line"></div>
                    <p className="sc-role">Research Team Member</p>
                    <a href="mailto:dpuri60_be24@thapar.edu" className="email-link"><Mail size={14} /> dpuri60_be24@thapar.edu</a>
                  </motion.div>
                  <motion.div className="student-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.3}}>
                    <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                    <h4 className="sc-name">Daksh Sharma</h4>
                    <div className="sc-line"></div>
                    <p className="sc-role">Research Team Member</p>
                    <a href="mailto:dsharma60_be24@thapar.edu" className="email-link"><Mail size={14} /> dsharma60_be24@thapar.edu</a>
                  </motion.div>
                  <motion.div className="student-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.4}}>
                    <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                    <h4 className="sc-name">Krish Gupta</h4>
                    <div className="sc-line"></div>
                    <p className="sc-role">Research Team Member</p>
                    <a href="mailto:kgupta60_be24@thapar.edu" className="email-link"><Mail size={14} /> kgupta60_be24@thapar.edu</a>
                  </motion.div>
                  <motion.div className="student-card" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.5}}>
                    <div className="sc-icon-wrapper"><User size={32} strokeWidth={1.5}/></div>
                    <h4 className="sc-name">Lavkush Vashistha</h4>
                    <div className="sc-line"></div>
                    <p className="sc-role">Research Team Member</p>
                    <a href="mailto:lvashistha60_be24@thapar.edu" className="email-link"><Mail size={14} /> lvashistha60_be24@thapar.edu</a>
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

      

    </div>
  );
}
