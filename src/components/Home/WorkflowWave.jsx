import { useState } from 'react';
import { 
  Leaf, 
  FlaskConical, 
  Droplets, 
  Thermometer, 
  Cpu, 
  Target, 
  LineChart, 
  FileDown,
  X 
} from 'lucide-react';
import './WorkflowWave.css';

const WORKFLOW_STEPS = [
  { id: 'biomass', icon: <Leaf size={24} />, title: 'Biomass', desc: 'Select feedstock & size', details: 'Choose from over 8 supported lignocellulosic feedstocks, including wheat straw, corn stover, and pine wood. The physical structure of the biomass significantly impacts extraction efficiency.' },
  { id: 'pretreat', icon: <FlaskConical size={24} />, title: 'Pretreat', desc: 'Prepare biomass', details: 'Define the physical preparation of the biomass, such as particle size and moisture content, which dictates the accessible surface area for the solvent.' },
  { id: 'solvent', icon: <Droplets size={24} />, title: 'Solvent', desc: 'Set HBA/HBD ratio', details: 'Select specific Hydrogen Bond Acceptors (HBA) and Hydrogen Bond Donors (HBD) to form your Deep Eutectic Solvent, and configure their exact molar ratio.' },
  { id: 'thermo', icon: <Thermometer size={24} />, title: 'Params', desc: 'Temp & time config', details: 'Set the thermodynamic boundaries for the reaction, including operating temperature and extraction duration, which drive the reaction kinetics.' },
  { id: 'neural', icon: <Cpu size={24} />, title: 'Inference', desc: 'AI forward pass', details: 'Your parameters are vectorized and passed through a deep neural network, mapping complex non-linear chemical interactions in milliseconds.' },
  { id: 'yield', icon: <Target size={24} />, title: 'Prediction', desc: 'Yield & purity', details: 'The AI outputs the predicted lignin yield percentage, providing a highly accurate forecast of extraction efficiency before stepping into the lab.' },
  { id: 'kinetics', icon: <LineChart size={24} />, title: 'Kinetics', desc: 'Extraction curves', details: 'Generate detailed time-series curves that visualize the extraction velocity and yield trajectory over the entire reaction duration (0-180 min).' },
  { id: 'export', icon: <FileDown size={24} />, title: 'Export', desc: 'PDF research dossier', details: 'Download a comprehensive, publication-ready PDF dossier containing all input parameters, predicted yields, kinetic charts, and model benchmark comparisons.' },
];

export default function WorkflowWave() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  return (
    <div className="workflow-wave-container">
      {/* Floating Icons Wave */}
      <div className="wave-track">
        {WORKFLOW_STEPS.map((step, idx) => {
          return (
            <div 
              key={step.id}
              className={`wave-node ${hoveredIndex === idx || selectedStep?.id === step.id ? 'is-active' : ''}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedStep(step)}
            >
              <div className="wave-icon">
                {step.icon}
              </div>
              
              <div className="wave-label">
                <span className="wave-label-title">{step.title}</span>
                <span className="wave-label-desc">{step.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Box that opens on click */}
      {selectedStep && (
        <div className="wave-details-box">
          <button className="wave-details-close" onClick={() => setSelectedStep(null)}>
            <X size={16} />
          </button>
          <div className="wave-details-header">
            <div className="wave-details-icon">{selectedStep.icon}</div>
            <div className="wave-details-title">
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#16A34A', display: 'block', marginBottom: '2px' }}>STEP DETAILS</span>
              <h3>{selectedStep.title}</h3>
            </div>
          </div>
          <p className="wave-details-text">{selectedStep.details}</p>
        </div>
      )}
    </div>
  );
}
