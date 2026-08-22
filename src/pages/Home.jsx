import React, { useRef, useState, useEffect } from 'react';
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
      {/* SECTION 01: HERO */}
      <section className="hero-section" style={{ position: 'relative', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: '-64px', backgroundColor: '#050E09', paddingTop: '12vh', paddingBottom: '150px' }}>
        
        {/* The Mountain Landscape Background */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', inset: 0 }}>
          <SeamlessVideoBackground />
        </motion.div>
        
        {/* Soft Dark Emerald Overlay in the center for readability */}
        <div className="hero-soft-gradient"></div>

        {/* Simplified Scientific Visual Overlay */}
        <div className="hero-scientific-overlay">
          <svg className="hero-ode-curve" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            <motion.path
              d="M -100,400 C 300,400 500,200 700,250 C 900,300 1000,100 1300,150"
              stroke="rgba(121, 214, 177, 0.15)"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2.5, ease: "easeOut", delay: 0.8 }}
            />
            {/* 3-5 Small particles */}
            <motion.circle r="2.5" fill="#79D6B1" filter="blur(0.5px)">
              <animateMotion dur="12s" repeatCount="indefinite" path="M -100,400 C 300,400 500,200 700,250 C 900,300 1000,100 1300,150" />
            </motion.circle>
            <motion.circle r="2" fill="#fff" filter="blur(0.5px)">
              <animateMotion dur="18s" repeatCount="indefinite" begin="4s" path="M -100,400 C 300,400 500,200 700,250 C 900,300 1000,100 1300,150" />
            </motion.circle>
            <motion.circle r="1.5" fill="#79D6B1" filter="blur(0.5px)">
              <animateMotion dur="15s" repeatCount="indefinite" begin="8s" path="M -100,400 C 300,400 500,200 700,250 C 900,300 1000,100 1300,150" />
            </motion.circle>

            {/* Very faint molecular structures */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ duration: 1.5, delay: 0.5 }}>
              <circle cx="250" cy="180" r="3" fill="#79D6B1" />
              <circle cx="300" cy="140" r="2" fill="#79D6B1" />
              <line x1="250" y1="180" x2="300" y2="140" stroke="#79D6B1" strokeWidth="0.5" strokeDasharray="2 2" />
            </motion.g>
          </svg>
        </div>

        <main className="hero-content-centered" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '900px', padding: '0 24px', textAlign: 'center' }}>
          
          <motion.div 
            className="hero-research-badge"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <FlaskConical size={14} className="badge-icon" />
            <span>AI + BIOTECHNOLOGY RESEARCH</span>
          </motion.div>

          <motion.h1 
            className="hero-main-title"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <span style={{ display: 'block', color: '#F7F8F2' }}>Decoding Biomass</span>
            <span style={{ display: 'block', color: '#79D6B1', fontStyle: 'italic' }}>with Continuous AI</span>
          </motion.h1>

          <motion.p 
            className="hero-research-desc"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            An AI-assisted framework for learning the complex relationships between biomass characteristics, Deep Eutectic Solvents, and process conditions to predict lignin removal efficiency.
          </motion.p>

          <motion.div
            className="hero-secondary-statements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="hero-tech-stack">Deep Learning &middot; Neural ODE &middot; Explainable AI</div>
            <div className="hero-decision-support">Computational screening and decision support for subsequent experimental validation.</div>
          </motion.div>

          <motion.div 
            className="hero-actions-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          >
            <Link to="/about" className="hero-primary-cta">
              Explore the Research <ArrowRight size={20} className="cta-icon" />
            </Link>
          </motion.div>

        </main>
        
        {/* Soft transition gradient to the light section */}
        <div className="hero-to-light-transition"></div>
      </section>

      {/* --- ALL SECTIONS BELOW HERO (LIGHT THEME) --- */}
      <div className="light-page-wrapper">

      {/* HOW IT WORKS SECTION (LIGHT THEME) */}
      <section className="hiw-light-section">
        <div className="container" style={{ maxWidth: '1400px' }}>
          <motion.div
            className="hiw-light-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >

            <h2>From Experimental Data to AI-Assisted Screening</h2>
            <p className="hiw-light-subtitle">Transform biomass, DES, and process conditions into explainable lignin-removal predictions.</p>
          </motion.div>

          <div className="hiw-light-pipeline">
            {/* The single elegant connecting line */}
            <div className="hiw-light-track">
               <motion.div 
                 className="hiw-light-progress"
                 initial={{ width: "0%" }}
                 whileInView={{ width: "100%" }}
                 viewport={{ once: true, margin: "-100px" }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
               />
            </div>

            {/* STAGE 1 */}
            <motion.div 
              className="hiw-light-stage"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 }}
            >
              <div className="hiw-light-number">01</div>
              <h3>Experimental Inputs</h3>
              <div className="hiw-light-chips">
                <span>Biomass</span>
                <span>DES</span>
                <span>Temperature</span>
                <span>Reaction Time</span>
                <span>Liquid-to-Solid Ratio</span>
                <span>HBD:HBA Ratio</span>
              </div>
              <div className="hiw-light-hover">
                Defines the physical boundaries of the extraction scenario.
              </div>
            </motion.div>

            {/* STAGE 2 */}
            <motion.div 
              className="hiw-light-stage"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.4 }}
            >
              <div className="hiw-light-number">02</div>
              <h3>AI Prediction Engine</h3>
              <div className="hiw-light-models">
                <span>DNN</span>
                <span>TabNet</span>
                <span>NODE Augmented</span>
                <span className="hiw-light-highlight">NODE <span className="highlight-tag">Research Focus</span></span>
              </div>
              
              {/* Miniature NN animation */}
              <div className="hiw-mini-nn">
                <div className="mn-node m1"></div><div className="mn-node m2"></div><div className="mn-node m3"></div>
                <svg className="mn-lines"><line x1="8" y1="8" x2="32" y2="20"/><line x1="8" y1="32" x2="32" y2="20"/></svg>
              </div>

              <div className="hiw-light-hover">
                Learns complex non-linear mappings across the unified dataset.
              </div>
            </motion.div>

            {/* STAGE 3 */}
            <motion.div 
              className="hiw-light-stage"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.7 }}
            >
              <div className="hiw-light-number">03</div>
              <h3>Explainable Results</h3>
              <div className="hiw-light-results">
                <div className="hl-pred">Lignin Removal Prediction</div>
                
                <div className="hl-shap-viz">
                  <div className="hl-shap-label">SHAP Feature Impact</div>
                  <div className="hl-shap-bar-container">
                     <div className="hl-shap-bar b1" style={{width: '70%'}}></div>
                     <div className="hl-shap-bar b2" style={{width: '40%'}}></div>
                     <div className="hl-shap-bar b3" style={{width: '25%'}}></div>
                  </div>
                </div>
              </div>
              <div className="hiw-light-hover">
                Provides mechanistic interpretability of the AI's internal logic.
              </div>
            </motion.div>

            {/* STAGE 4 */}
            <motion.div 
              className="hiw-light-stage"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 1.0 }}
            >
              <div className="hiw-light-number">04</div>
              <h3>Physical Validation</h3>
              <div className="hiw-light-validation">
                <div className="hl-val-box">Promising Conditions</div>
                <div className="hl-val-arrow">↓</div>
                <div className="hl-val-box hl-val-strong">
                   <FlaskConical size={16} className="hl-flask" />
                   Experimental Validation
                </div>
              </div>
              <div className="hiw-light-hover">
                Guides focused laboratory trials, reducing trial-and-error.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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

      {/* CINEMATIC RESEARCH CONCLUSION */}
      <section className="cinematic-section">
        <div className="cinematic-bg-glow"></div>
        
        {/* Aesthetic Animated Background Orbs */}
        <div className="cinematic-orbs-container">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        {/* Animated Background Layer */}
        <div className="cinematic-animation-layer">
          
          {/* Faint molecular/biomass structure on the far left */}
          <svg className="cinematic-biomass" viewBox="0 0 400 400">
            <motion.path
              d="M100,200 L150,120 L250,120 L300,200 L250,280 L150,280 Z"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="2"
              fill="none"
              initial={{ opacity: 0, rotate: -5 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 4 }}
            />
            <motion.path
              d="M250,280 L300,350 L400,350"
              stroke="rgba(255, 255, 255, 0.02)"
              strokeWidth="1.5"
              fill="none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 4, delay: 1 }}
            />
            <motion.path
              d="M250,120 L300,50 L400,50"
              stroke="rgba(255, 255, 255, 0.02)"
              strokeWidth="1.5"
              fill="none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 4, delay: 1 }}
            />
          </svg>

          {/* Foreground layer: Neural ODE Continuous Curve */}
          <svg className="cinematic-curve" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
            <motion.path
              className="ode-line"
              d="M -100,350 C 300,350 400,100 700,150 C 900,180 1000,100 1300,120"
              initial={{ strokeDashoffset: 3000 }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 5, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="cinematic-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="cinematic-label">The Idea</span>
          </motion.div>

          <motion.h2 
            className="cinematic-quote"
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          >
            "From <span className="highlight-emerald">experimental observations</span> to intelligent predictions, we use <span className="highlight-emerald">AI</span> to explore <span className="highlight-emerald">chemistry continuously</span> — not to replace the laboratory, but to make the <span className="highlight-emerald">next experiment</span> more informed."
          </motion.h2>

          <motion.p 
            className="cinematic-supporting"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
          >
            Lignin removal is shaped by interacting biomass, solvent, and process variables. Our framework connects those observations with Deep Learning, Neural ODEs, and Explainable AI to support computational screening and experimental validation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          >
            <Link to="/predict" className="cinematic-cta">
              Explore the Prediction Engine <ArrowRight size={20} className="cta-arrow-icon" />
            </Link>
            <span className="cinematic-cta-sub">From experimental inputs to AI-assisted lignin-removal prediction.</span>
          </motion.div>

          
        </div>
      </section>

      </div>
    </div>
  );
}