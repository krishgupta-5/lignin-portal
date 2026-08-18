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

export default function NodeComparison() {
  return (
    <section className="research-section">
      <motion.div 
        className="problem-section"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
      >
        <span className="hero-eyebrow">Architecture Evaluation</span>
        <h2>Why NODE outperforms</h2>
        <p>
          In a blind-test generalization evaluation across deep tabular learning architectures, 
          Neural Oblivious Decision Ensembles (NODE) achieved the highest predictive accuracy 
          for lignin removal efficiency.
        </p>
      </motion.div>

      <motion.div 
        className="comparison-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.div className="model-card" variants={fadeUp}>
          <div className="model-name">FT-Transformer</div>
          <div className="model-stat">
            <span className="val">0.3988</span>
            <span className="lab">R²</span>
          </div>
        </motion.div>
        
        <motion.div className="model-card" variants={fadeUp}>
          <div className="model-name">TabNet</div>
          <div className="model-stat">
            <span className="val">0.6038</span>
            <span className="lab">R²</span>
          </div>
        </motion.div>
        
        <motion.div className="model-card" variants={fadeUp}>
          <div className="model-name">DNN</div>
          <div className="model-stat">
            <span className="val">0.8574</span>
            <span className="lab">R²</span>
          </div>
        </motion.div>
        
        <motion.div className="model-card highlight" variants={fadeUp}>
          <div className="model-name">NODE</div>
          <div className="model-stat">
            <span className="val">0.8726</span>
            <span className="lab">R²</span>
          </div>
          <div className="model-stat">
            <span className="val">0.0504</span>
            <span className="lab">MAE</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="benchmark-banner"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        <span>Published XGBoost benchmark: R² = 0.8034</span>
        <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>*Reference baseline</span>
      </motion.div>
    </section>
  );
}
