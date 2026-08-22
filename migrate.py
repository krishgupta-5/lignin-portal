import re

with open('src/pages/Compare.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

benchmark_code = '''
import { motion } from 'framer-motion';
import { MODEL_OPTIONS } from './Predict';

const BenchmarkOverview = ({ selectedRuns }) => {
  // Which models are currently selected in the runs?
  const isSelected = (benchmarkName) => {
    return selectedRuns.some(r => {
      const rm = r.model.toLowerCase().replace('_', ' ');
      const bm = benchmarkName.toLowerCase().replace('_', ' ');
      return rm === bm || rm.includes(bm) || bm.includes(rm);
    });
  };

  const benchmarks = [...MODEL_OPTIONS].sort((a, b) => Number(b.r2) - Number(a.r2));
  const maxR2 = Math.max(...benchmarks.map(m => Number(m.r2)));

  return (
    <div className="benchmark-overview-sec animate-fade-in">
      <div className="bo-header">
        <span className="bo-eyebrow">MODEL BENCHMARKING</span>
        <h2 className="bo-title">How the Architectures Compare</h2>
        <p className="bo-subtitle">Compare reported model performance and evaluate architecture behaviour within the lignin-removal prediction framework.</p>
        <div className="bo-status-label">REPORTED BENCHMARK</div>
      </div>
      
      <div className="bo-board">
        {benchmarks.map((m, idx) => {
          const active = isSelected(m.name);
          const isBest = Number(m.r2) === maxR2;
          const r2Val = Number(m.r2);
          
          return (
            <motion.div 
              key={m.id} 
              className={\o-card \\}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="bo-rank">{(idx + 1).toString().padStart(2, '0')}</div>
              
              <div className="bo-info">
                <span className="bo-name">{m.name}</span>
                <span className="bo-desc">{m.description}</span>
              </div>
              
              <div className="bo-bar-container">
                <div className="bo-bar-bg">
                  <motion.div 
                    className="bo-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: \\%\ }}
                    transition={{ duration: 1.2, delay: 0.3 + (idx * 0.1), ease: "easeOut" }}
                  />
                </div>
                <div className="bo-metric-group">
                  <span className="bo-metric-val">{r2Val.toFixed(4)}</span>
                  <span className="bo-metric-lbl">R² Score</span>
                </div>
              </div>

              <div className="bo-badges">
                {isBest && <span className="bo-badge best">TOP BENCHMARK</span>}
                {active && <span className="bo-badge active-sel">SELECTED</span>}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};
'''

if "const BenchmarkOverview =" not in c:
    c = c.replace("export default function Compare() {", benchmark_code + "\n\nexport default function Compare() {")
    
    usage_code = '''
        {/* Dynamic Model Benchmarking */}
        <BenchmarkOverview selectedRuns={selected} />

        {/* Top Header */}
'''
    c = c.replace("{/* Top Header */}", usage_code)

    if "import { motion }" not in c:
        c = c.replace("import { Link }", "import { Link }\nimport { motion } from 'framer-motion';")
        
    with open('src/pages/Compare.jsx', 'w', encoding='utf-8') as f:
        f.write(c)

print("Injected BenchmarkOverview into Compare.jsx")
