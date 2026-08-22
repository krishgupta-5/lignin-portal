import re

with open('src/pages/Predict.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pipeline_code = '''
import { motion, AnimatePresence } from 'framer-motion';
// --- Architecture Pipeline Component ---
const ArchitecturePipeline = ({ formData, selectedModel, compareAllMode, isLoading, result, multiResults }) => {
  const hasResult = !!(result || multiResults);
  const isRunning = isLoading;

  const s1 = hasResult || isRunning ? 'completed' : 'active';
  const s2 = hasResult ? 'completed' : 'active';
  const s3 = hasResult ? 'completed' : isRunning ? 'active' : 'idle';
  const s4 = hasResult ? 'completed' : isRunning ? 'active' : 'idle';
  const s5 = hasResult ? 'completed' : 'idle';
  const s6 = hasResult ? 'completed' : 'idle';
  
  const getProgressWidth = () => {
    if (hasResult) return '100%';
    if (isRunning) return '60%';
    return '15%';
  };

  const activeModelName = compareAllMode ? '4 Models Concurrent' : (
    selectedModel === 'node_augmented' ? 'NODE Augmented' :
    selectedModel === 'node' ? 'NODE' :
    selectedModel === 'dnn' ? 'DNN' : 'TabNet'
  );

  return (
    <div className="ap-section">
      <div className="ap-header">
        <span className="ap-eyebrow">ARCHITECTURE</span>
        <h2 className="ap-title">How the Prediction Engine Works</h2>
        <p className="ap-subtitle">Follow how experimental biomass, DES, and process parameters move through the prediction pipeline.</p>
      </div>

      <div className="ap-wrapper">
        <div className="ap-connector-track desktop-only">
           <motion.div className="ap-connector-fill" initial={{width:0}} animate={{width: getProgressWidth()}} transition={{duration: 1.5, ease: 'easeInOut'}} />
           {isRunning && <motion.div className="ap-connector-particle" animate={{left: ['0%', '100%']}} transition={{duration: 2, repeat: Infinity}} />}
        </div>
        
        <div className="ap-stages">
          
          <div className={\p-stage \\}>
            <div className="ap-stage-icon-box">01</div>
            <div className="ap-stage-text">
              <h4 className="ap-stage-title">Experimental Data</h4>
              <div className="ap-stage-content">
                {!hasResult && !isRunning ? (
                  <>
                    <div className="ap-chip">Biomass: {formData?.feedMaterial || 'Configured'}</div>
                    <div className="ap-chip">DES: {formData?.hba}+{formData?.hbd}</div>
                  </>
                ) : (
                  <div className="ap-status-msg">Inputs Locked</div>
                )}
              </div>
            </div>
          </div>

          <div className={\p-stage \\}>
            <div className="ap-stage-icon-box">02</div>
            <div className="ap-stage-text">
              <h4 className="ap-stage-title">Deep Learning</h4>
              <div className="ap-stage-content">
                <div className="ap-chip highlight">{activeModelName}</div>
              </div>
            </div>
          </div>

          <div className={\p-stage \\}>
            <div className="ap-stage-icon-box">03</div>
            <div className="ap-stage-text">
              <h4 className="ap-stage-title">Optimization</h4>
              <div className="ap-stage-content">
                {isRunning ? <div className="ap-status-msg pulse">Tuning Hyperparameters...</div> : <div className="ap-chip">Model Selection</div>}
              </div>
            </div>
          </div>

          <div className={\p-stage \\}>
            <div className="ap-stage-icon-box">04</div>
            <div className="ap-stage-text">
              <h4 className="ap-stage-title">Prediction</h4>
              <div className="ap-stage-content">
                {hasResult ? (
                  <div className="ap-chip success">Output Generated</div>
                ) : isRunning ? (
                  <div className="ap-status-msg pulse">Estimating Yield...</div>
                ) : (
                  <div className="ap-status-msg">Awaiting execution</div>
                )}
              </div>
            </div>
          </div>

          <div className={\p-stage \\}>
            <div className="ap-stage-icon-box">05</div>
            <div className="ap-stage-text">
              <h4 className="ap-stage-title">Explainability</h4>
              <div className="ap-stage-content">
                {hasResult ? <div className="ap-chip">SHAP Analysis Ready</div> : <div className="ap-status-msg">Awaiting prediction</div>}
              </div>
            </div>
          </div>

          <div className={\p-stage \\}>
            <div className="ap-stage-icon-box">06</div>
            <div className="ap-stage-text">
              <h4 className="ap-stage-title">Validation</h4>
              <div className="ap-stage-content">
                {hasResult ? <div className="ap-chip">R² & MAE Verified</div> : <div className="ap-status-msg">Awaiting prediction</div>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
// ----------------------------------------
'''

if "const ArchitecturePipeline =" not in content:
    content = content.replace("function getPerformanceColor", pipeline_code + "\nfunction getPerformanceColor")
    
    if "import { motion" not in content:
        content = content.replace("import { Link", "import { motion, AnimatePresence } from 'framer-motion';\nimport { Link")

model_start = content.find("        {/* TOP SECTION: Model Selector & Multi-Model Toggle */}")
model_end = content.find("        {/* MIDDLE SECTION: Experimental Parameters Form (Full Width) */}")
model_section = content[model_start:model_end]

params_start = content.find("        {/* MIDDLE SECTION: Experimental Parameters Form (Full Width) */}")
params_end = content.find("        {/* BOTTOM SECTION: Execute Button */}")
params_section = content[params_start:params_end]

content = content.replace(model_section, "")
content = content.replace(params_section, "")

model_section_updated = model_section.replace("1. Select Prediction Model Architecture", "3. Select Prediction Model Architecture")
params_section_updated = params_section.replace("2. Experimental Parameters", "2. Experimental Parameters")

pipeline_usage = '''
        {/* PIPELINE VISUALIZATION */}
        <ArchitecturePipeline 
          formData={formData} 
          selectedModel={selectedModel} 
          compareAllMode={compareAllMode} 
          isLoading={isLoading} 
          result={result} 
          multiResults={multiResults} 
        />
'''

banner_end_str = ")}\n"
banner_end = content.find(banner_end_str, content.find("Guest Mode Notice Banner"))
if banner_end != -1:
    banner_end += len(banner_end_str)
else:
    banner_end = content.find("<div className=\"predict-page\" ref={resultsRef}>\n") + len("<div className=\"predict-page\" ref={resultsRef}>\n")

new_layout = pipeline_usage + "\n" + params_section_updated + "\n" + model_section_updated
content = content[:banner_end] + new_layout + content[banner_end:]

with open('src/pages/Predict.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
