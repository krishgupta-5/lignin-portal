import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { motion, useScroll } from 'framer-motion';

// Components
import SeamlessVideoBackground from '../components/Home/SeamlessVideoBackground';
import ShapVisualization from '../components/Home/ShapVisualization';
import ExperimentalFidelity from '../components/Home/ExperimentalFidelity';
import MaterialsShowcase from '../components/Home/MaterialsShowcase';
import CapabilitiesBento from '../components/Home/CapabilitiesBento';
import WorkflowWave from '../components/Home/WorkflowWave';

import './Home.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

export default function Home() {
  return (
    <div className="home-page">
      {/* SECTION 01: HERO */}
      <section className="hero-section" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: '-64px' }}>
        <SeamlessVideoBackground />
        
        <main className="hero-content-centered">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div className="badge">
                <div className="badge-dark">
                    <svg className="icon-star" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    New
                </div>
                <div className="badge-light">
                    Discover what's possible
                </div>
            </div>

            <h1 className="main-title">Predict Lignin Removal</h1>
            <p className="subtitle">Deep tabular learning for predicting lignin removal efficiency in deep eutectic solvent-based biomass fractionation.</p>

            <div className="hero-actions" style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link to="/predict" className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Run Prediction <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                Read the Research
              </Link>
            </div>
          </motion.div>
        </main>
      </section>

      {/* --- ALL SECTIONS BELOW HERO (LIGHT THEME) --- */}
      <div className="light-page-wrapper">

      {/* SECTION 02: THE PROBLEM */}
      <section className="research-section" style={{paddingTop: '64px'}}>
        <motion.div 
          className="problem-section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <span className="hero-eyebrow">The Challenge</span>
          <h2>The structural barrier</h2>
          <p>
            Lignin forms a rigid, complex structural barrier in lignocellulosic biomass, 
            making efficient fractionation and solvent extraction exceedingly difficult. 
            Traditional experimental trials are costly, time-consuming, and environmentally intensive.
          </p>
        </motion.div>
      </section>

      {/* SECTION 03 & 04: THE PROCESS / FROM EXPERIMENT TO MODEL */}
      <section className="research-section" style={{borderTop: '1px solid rgba(20, 54, 33, 0.5)', borderBottom: '1px solid rgba(20, 54, 33, 0.5)'}}>
        <motion.div 
          style={{textAlign: 'center', marginBottom: '64px'}}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span className="hero-eyebrow">Methodology</span>
          <h2>From physical experiment to data matrix</h2>
        </motion.div>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px'}}>
          <motion.div style={{flex: 1, minWidth: '200px', textAlign: 'center'}} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div style={{fontSize: '2rem', marginBottom: '16px'}}>🌿</div>
            <h4 style={{fontFamily: 'var(--font-mono)', color: 'var(--scientific)', marginBottom: '8px'}}>BIOMASS</h4>
            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Cellulose %</p>
          </motion.div>
          <div style={{color: 'var(--text-muted)'}}>&rarr;</div>
          <motion.div style={{flex: 1, minWidth: '200px', textAlign: 'center'}} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div style={{fontSize: '2rem', marginBottom: '16px'}}>🧪</div>
            <h4 style={{fontFamily: 'var(--font-mono)', color: 'var(--scientific)', marginBottom: '8px'}}>DES SOLVENT</h4>
            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>HBD-pKa/pKb, LogR0</p>
          </motion.div>
          <div style={{color: 'var(--text-muted)'}}>&rarr;</div>
          <motion.div style={{flex: 1, minWidth: '200px', textAlign: 'center'}} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div style={{fontSize: '2rem', marginBottom: '16px'}}>📊</div>
            <h4 style={{fontFamily: 'var(--font-mono)', color: 'var(--scientific)', marginBottom: '8px'}}>DATA MATRIX</h4>
            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Molecular descriptors</p>
          </motion.div>
          <div style={{color: 'var(--text-muted)'}}>&rarr;</div>
          <motion.div style={{flex: 1, minWidth: '200px', textAlign: 'center'}} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div style={{fontSize: '2rem', marginBottom: '16px'}}>🧠</div>
            <h4 style={{fontFamily: 'var(--font-mono)', color: 'var(--scientific)', marginBottom: '8px'}}>NODE</h4>
            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Deep learning prediction</p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 06: EXPLAINABILITY */}
      <ShapVisualization />

      {/* SECTION 07: EXPERIMENTAL FIDELITY */}
      <ExperimentalFidelity />

      {/* SECTION 08: SUPPORTED MATERIALS */}
      <section className="materials-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="section-heading">
              <span className="section-tag font-mono">DATABASE</span>
              <h2>Supported Feedstocks & Solvents</h2>
              <p>Predict lignin yield across a wide range of biomass sources and green solvents</p>
            </div>
          </motion.div>

          <motion.div
            className="materials-grid"
            style={{ display: 'block' }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <MaterialsShowcase />
          </motion.div>
        </div>
      </section>

      {/* SECTION 09: CAPABILITIES */}
      <section className="capabilities-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="section-heading">
              <span className="section-tag font-mono">CAPABILITIES</span>
              <h2>End-to-End Research Suite</h2>
              <p>From raw parameter input to publication-ready analysis reports</p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <CapabilitiesBento />
          </motion.div>
        </div>
      </section>

      {/* SECTION 10: WORKFLOW */}
      <section className="workflow-section">
        <div className="container" style={{ maxWidth: '1200px' }}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="section-heading" style={{ marginBottom: '20px' }}>
              <span className="section-tag font-mono">WORKFLOW</span>
              <h2>How It Works</h2>
              <p>An end-to-end pipeline from parameter selection to final prediction</p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <WorkflowWave />
          </motion.div>
        </div>
      </section>

      {/* SECTION 11: CTA BANNER */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="cta-banner">
              <div className="cta-content">
                <h2>Ready to predict lignin yield?</h2>
                <p>Run your first AI-powered extraction prediction in under 30 seconds.</p>
                <Link to="/predict" className="hero-btn-primary">
                  <FlaskConical size={18} />
                  <span>Launch Predictor</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 12: FINAL CTA */}
      <section className="research-section" style={{textAlign: 'center', paddingBottom: '200px'}}>
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span className="hero-eyebrow">Conclusion</span>
          <h2 style={{fontSize: '3.5rem', marginBottom: '40px'}}>Turn experimental parameters<br/>into prediction.</h2>
          <div className="hero-actions" style={{justifyContent: 'center'}}>
            <Link to="/predict" className="btn-primary">
              Run a Prediction <ArrowRight size={17} />
            </Link>
            <Link to="/about" className="btn-secondary">
              Read the Method &rarr;
            </Link>
          </div>
        </motion.div>
      </section>

      </div>
    </div>
  );
}