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

const FEATURES = [
  { name: 'HBD-pKa/pKb', influence: 90 },
  { name: 'LSR × LogR0', influence: 75 },
  { name: 'Cellulose %', influence: 60 },
  { name: 'LogR0', influence: 50 },
  { name: 'Ratio × LogR0', influence: 40 },
];

export default function ShapVisualization() {
  return (
    <section className="research-section" style={{background: 'rgba(20, 54, 33, 0.1)'}}>
      <motion.div 
        className="problem-section"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
      >
        <span className="hero-eyebrow">Interpretability</span>
        <h2>Inside the Model</h2>
        <p>
          Using SHAP (SHapley Additive exPlanations), we map exactly which 
          molecular descriptors and process conditions drive the model's predictions.
        </p>
      </motion.div>

      <div style={{maxWidth: '800px', margin: '0 auto'}}>
        <motion.div 
          className="shap-container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {FEATURES.map((feat, i) => (
            <motion.div key={i} className="shap-row" variants={fadeUp}>
              <div className="shap-label">{feat.name}</div>
              <div className="shap-bar-container">
                <motion.div 
                  className="shap-bar-fill" 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${feat.influence}%` }}
                  transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          style={{textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)'}}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Conceptual SHAP Influence Diagram
        </motion.div>
      </div>
    </section>
  );
}
