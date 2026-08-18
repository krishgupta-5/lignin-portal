import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function ExperimentalFidelity() {
  return (
    <section className="research-section">
      <motion.div 
        className="problem-section"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
      >
        <span className="hero-eyebrow">Experimental Fidelity</span>
        <h2>More data ≠ better generalization</h2>
        <p>
          We evaluated Gaussian synthetic-data augmentation against the purely experimental dataset. 
          The results demonstrate that introducing synthetic molecular data degraded the model's 
          ability to generalize to true blind-test experiments.
        </p>
      </motion.div>

      <motion.div 
        className="fidelity-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.div className="fidelity-card" variants={fadeUp} style={{borderColor: 'var(--cyan-glow)', background: 'rgba(72, 229, 194, 0.05)'}}>
          <h3>Experimental Data Only</h3>
          <div className="fidelity-metrics">
            <div>
              <div className="metric-value">0.8726</div>
              <div className="metric-label" style={{fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)'}}>R²</div>
            </div>
            <div>
              <div className="metric-value">0.0504</div>
              <div className="metric-label" style={{fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)'}}>MAE</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div className="fidelity-card" variants={fadeUp}>
          <h3>Experimental + Gaussian Synthetic</h3>
          <div className="fidelity-metrics">
            <div>
              <div className="metric-value" style={{color: 'var(--text-muted)'}}>0.8335</div>
              <div className="metric-label" style={{fontFamily: 'var(--font-mono)'}}>R²</div>
            </div>
            <div>
              <div className="metric-value" style={{color: 'var(--text-muted)'}}>0.0565</div>
              <div className="metric-label" style={{fontFamily: 'var(--font-mono)'}}>MAE</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
